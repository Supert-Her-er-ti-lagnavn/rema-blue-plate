import React, { useState } from 'react';
import { ShoppingCart, Calendar } from 'lucide-react';

interface ToggleShoppingProps {
  onToggle: (isShoppingMode: boolean) => void;
}

export const ToggleShopping: React.FC<ToggleShoppingProps> = ({ onToggle }) => {
  const [isShoppingMode, setIsShoppingMode] = useState(false);

  const handleToggle = () => {
    const newMode = !isShoppingMode;
    setIsShoppingMode(newMode);
    onToggle(newMode);
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg px-2 py-2">
        <button
          onClick={handleToggle}
          className="relative flex items-center w-64 h-12 bg-gray-100 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label={`Switch to ${isShoppingMode ? 'meal planning' : 'shopping'} mode`}
        >
          {/* Background slider */}
          <div
            className={`absolute top-1 bottom-1 w-32 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-md transition-all duration-300 ease-in-out ${
              isShoppingMode ? 'translate-x-[120px]' : 'translate-x-1'
            }`}
          />
          
          {/* Left side - Meal Planning */}
          <div
            className={`relative z-10 flex items-center justify-center w-32 h-10 rounded-full transition-all duration-300 ${
              !isShoppingMode ? 'text-white' : 'text-gray-600'
            }`}
          >
            <Calendar size={16} className="mr-2" />
            <span className="text-sm font-medium">Meal Plan</span>
          </div>
          
          {/* Right side - Shopping */}
          <div
            className={`relative z-10 flex items-center justify-center w-32 h-10 rounded-full transition-all duration-300 ${
              isShoppingMode ? 'text-white' : 'text-gray-600'
            }`}
          >
            <ShoppingCart size={16} className="mr-2" />
            <span className="text-sm font-medium">Shopping</span>
          </div>
        </button>
        
        {/* Status indicator */}
        <div className="text-center mt-1">
          <span className="text-xs text-gray-500 font-medium">
            {isShoppingMode ? 'Shopping Mode' : 'Planning Mode'}
          </span>
        </div>
      </div>
    </div>
  );
};