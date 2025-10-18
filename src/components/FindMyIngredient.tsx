import React, { useState, useEffect } from 'react';
import { useShoppingContext } from '@/contexts/useShoppingContext';
import { Wallet } from 'lucide-react';
import { apiService } from '@/services/api';

const FindMyIngredient: React.FC = () => {
  const { getCurrentItem, markItemFound, getCompletedCount, getTotalCount, shoppingList, recordPurchaseAndRemove } = useShoppingContext();
  const [userPosition, setUserPosition] = useState({ x: 450, y: 600 });
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState(5000);

  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setMonthlyBudget(profile.monthlyBudget || 5000);
    }
  }, []);

  const currentItem = getCurrentItem();
  const completedCount = getCompletedCount();
  const totalCount = getTotalCount();
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Spent amount stored in localStorage
  const [spentAmount, setSpentAmount] = useState(() => {
    const saved = localStorage.getItem('monthlySpent');
    return saved ? parseFloat(saved) : 0;
  });

  const refreshMonthlySpent = () => {
    const saved = localStorage.getItem('monthlySpent');
    setSpentAmount(saved ? parseFloat(saved) : 0);
  };

  useEffect(() => {
    const handleStorageChange = () => refreshMonthlySpent();
    window.addEventListener('monthlySpentUpdated', handleStorageChange);
    return () => window.removeEventListener('monthlySpentUpdated', handleStorageChange);
  }, []);

  const budgetPercentage = (spentAmount / monthlyBudget) * 100;

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

      {/* Budget indicator */}
      <div className="mb-6 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold text-gray-700">Budsjett</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-blue-600">
              {spentAmount.toFixed(0)} / {monthlyBudget} kr
            </div>
            <div className="text-xs text-gray-600">
              {budgetPercentage.toFixed(0)}%
            </div>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
          <div 
            className={`h-1.5 rounded-full transition-all duration-300 ${
              budgetPercentage >= 75 ? 'bg-red-500' : 
              budgetPercentage >= 50 ? 'bg-orange-500' : 
              'bg-green-500'
            }`}
            style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
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
            onClick={async () => {
              setPulseAnimation(true);
              setTimeout(() => setPulseAnimation(false), 1000);
              // Update fridge, then record and remove from list
              markItemFound(currentItem.id);
              await recordPurchaseAndRemove(currentItem.id);
              refreshMonthlySpent();
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