import React, { useState } from 'react';
import { ShoppingCart, Calendar, Refrigerator } from 'lucide-react';

type ModeType = 'planning' | 'shopping' | 'fridge';

interface ToggleShoppingProps {
  onToggle: (mode: ModeType) => void;
}

export const ToggleShopping: React.FC<ToggleShoppingProps> = ({ onToggle }) => {
  const [currentMode, setCurrentMode] = useState<ModeType>('planning');

  const handleModeChange = (mode: ModeType) => {
    setCurrentMode(mode);
    onToggle(mode);
  };

  const modes: { key: ModeType; label: string; icon: any }[] = [
    { key: 'planning', label: 'Meal Plan', icon: Calendar },
    { key: 'shopping', label: 'Shopping', icon: ShoppingCart },
    { key: 'fridge', label: 'Fridge', icon: Refrigerator },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg px-2 py-2">
        <div className="relative flex items-center w-96 h-12 bg-gray-100 rounded-full">
          {/* Background slider */}
          <div
            className={`absolute top-1 bottom-1 w-32 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-md transition-all duration-300 ease-in-out ${
              currentMode === 'planning' ? 'translate-x-1' : 
              currentMode === 'shopping' ? 'translate-x-[128px]' : 
              'translate-x-[256px]'
            }`}
          />
          
          {modes.map((mode) => (
            <button
              key={mode.key}
              onClick={() => handleModeChange(mode.key)}
              className={`relative z-10 flex items-center justify-center w-32 h-10 rounded-full transition-all duration-300 ${
                currentMode === mode.key ? 'text-white' : 'text-gray-600'
              }`}
              aria-label={`Switch to ${mode.label} mode`}
            >
              <mode.icon size={16} className="mr-1" />
              <span className="text-sm font-medium">{mode.label}</span>
            </button>
          ))}
        </div>
        
        {/* Status indicator */}
        <div className="text-center mt-1">
          <span className="text-xs text-gray-500 font-medium">
            {currentMode === 'planning' ? 'Planning Mode' : 
             currentMode === 'shopping' ? 'Shopping Mode' : 
             'Fridge Mode'}
          </span>
        </div>
      </div>
    </div>
  );
};