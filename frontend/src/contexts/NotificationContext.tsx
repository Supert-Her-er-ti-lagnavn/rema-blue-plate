import React, { createContext, useContext, useState, useCallback } from 'react';

interface NotificationContextType {
  showFridgeNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [show, setShow] = useState(false);

  const showFridgeNotification = useCallback(() => {
    setShow(true);
    setTimeout(() => setShow(false), 2000);
  }, []);

  return (
    <NotificationContext.Provider value={{ showFridgeNotification }}>
      {children}
      {show && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg font-bold animate-scale-in">
            🛒 Oppskrift lagt til i handlelisten!
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};
