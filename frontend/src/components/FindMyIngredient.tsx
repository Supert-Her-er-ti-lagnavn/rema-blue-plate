import React, { useState } from 'react';
import { useShoppingContext } from '@/contexts/useShoppingContext';

const FindMyIngredient: React.FC = () => {
  const { getCurrentItem, markItemFound, getCompletedCount, getTotalCount } = useShoppingContext();
  const [userPosition, setUserPosition] = useState({ x: 450, y: 600 });
  const [pulseAnimation, setPulseAnimation] = useState(false);

  const currentItem = getCurrentItem();
  const completedCount = getCompletedCount();
  const totalCount = getTotalCount();
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Dummy direction and distance logic (replace with real logic if needed)
  const getDirectionData = () => {
    if (!currentItem) return null;
    const angle = (currentItem.aisle * 45) % 360;
    const distance = Math.random() * 30 + 10;
    return { angle, distance: distance.toFixed(1) };
  };
  const directionData = getDirectionData();

  if (!currentItem) {
    return (
      <div className="text-center p-8">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-green-600 mb-2">Handletur fullført!</h2>
        <p className="text-gray-600">Du har samlet alle ingrediensene dine.</p>
        <div className="mt-4 text-sm text-gray-500">
          {completedCount}/{totalCount} varer funnet
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Fremgang</span>
          <span>{completedCount}/{totalCount}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
      {/* Find My Ingredient Display */}
      <div className="text-center">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Finn ingrediens
          </h3>
          <h2 className="text-2xl font-bold text-gray-900 mt-1">
            {currentItem.name}
          </h2>
          <p className="text-sm text-gray-600">
            {currentItem.quantity} {currentItem.category} • Gang {currentItem.aisle}
          </p>
        </div>
        {/* Directional Arrow - Find My AirPods Style */}
        <div className="relative w-48 h-48 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
          <div 
            className={`absolute inset-8 rounded-full ${pulseAnimation ? 'animate-pulse bg-green-100' : 'bg-blue-50'} flex items-center justify-center transition-all duration-300`}
          >
            <div 
              className="text-4xl transition-transform duration-500 ease-in-out"
              style={{ transform: `rotate(${directionData?.angle ?? 0}deg)` }}
            >
              ➤
            </div>
          </div>
          {/* Distance display in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center mt-16">
              <div className="text-lg font-bold text-blue-600">
                {directionData?.distance ?? '--'}m
              </div>
            </div>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => {
              setPulseAnimation(true);
              setTimeout(() => setPulseAnimation(false), 1000);
              markItemFound(currentItem.id);
            }}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            ✓ Funnet! ({currentItem.price} kr)
          </button>
        </div>
        {/* Store Map Mini View */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-600 mb-2">Butikkversikt</div>
          <div className="relative w-full h-20 bg-white rounded border">
            {/* User position */}
            <div 
              className="absolute w-2 h-2 bg-blue-600 rounded-full"
              style={{ 
                left: `${(userPosition.x / 900) * 100}%`, 
                top: `${(userPosition.y / 700) * 100}%`,
                transform: 'translate(-50%, -50%)'
              }}
            ></div>
            {/* Target position */}
            <div 
              className="absolute w-2 h-2 bg-red-600 rounded-full animate-ping"
              style={{ 
                left: `${(currentItem.x_position ?? 150) / 900 * 100}%`, 
                top: `${(currentItem.y_position ?? 150) / 700 * 100}%`,
                transform: 'translate(-50%, -50%)'
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindMyIngredient;