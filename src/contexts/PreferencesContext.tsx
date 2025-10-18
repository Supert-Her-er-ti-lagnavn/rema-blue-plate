import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type DietaryPreference = 'omnivore' | 'vegetarian' | 'vegan' | 'eco';

export interface PreferencesContextType {
  dietaryPreference: DietaryPreference;
  setDietaryPreference: (preference: DietaryPreference) => void;
}

const DEFAULT_PREFERENCE: DietaryPreference = 'omnivore';
const STORAGE_KEY = 'rema-dietary-preference';

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dietaryPreference, setDietaryPreferenceState] = useState<DietaryPreference>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as DietaryPreference | null;
    return saved ?? DEFAULT_PREFERENCE;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, dietaryPreference);
  }, [dietaryPreference]);

  const setDietaryPreference = (preference: DietaryPreference) => {
    setDietaryPreferenceState(preference);
  };

  const value = useMemo(
    () => ({ dietaryPreference, setDietaryPreference }),
    [dietaryPreference],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
};

export const usePreferences = (): PreferencesContextType => {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return ctx;
};
