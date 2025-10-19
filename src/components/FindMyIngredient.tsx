import React, { useState, useEffect } from 'react';
import { useDirectionWS } from '@/hooks/useDirectionWS';
import { vectorToDegrees } from '@/utils/angle';
import { Wallet, Navigation } from 'lucide-react';
import { toast } from 'sonner';

interface FindMyIngredientProps {
  wsUrl?: string;
}

const FindMyIngredient: React.FC<FindMyIngredientProps> = ({ wsUrl = "ws://localhost:8765" }) => {
  const { status, lastDirection, sendFetchClosest } = useDirectionWS(wsUrl);
  const [monthlyBudget, setMonthlyBudget] = useState(5000);

  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setMonthlyBudget(profile.monthlyBudget || 5000);
    }
  }, []);

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

  // Calculate arrow rotation from direction vector
  const arrowRotation = lastDirection 
    ? vectorToDegrees(lastDirection.dx, lastDirection.dy)
    : 0;

  const statusText = {
    connecting: "Kobler til…",
    connected: "Tilkoblet",
    disconnected: "Frakoblet",
    simulator_unavailable: "Simulator utilgjengelig"
  }[status];

  const statusColor = {
    connecting: "bg-yellow-100 text-yellow-800 border-yellow-300",
    connected: "bg-green-100 text-green-800 border-green-300",
    disconnected: "bg-red-100 text-red-800 border-red-300",
    simulator_unavailable: "bg-orange-100 text-orange-800 border-orange-300"
  }[status];

  const isButtonDisabled = status === "connecting" || status === "disconnected";

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      {/* Title */}
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Find My Ingredient</h1>
      </div>

      {/* Status Pill */}
      <div className="flex justify-center mb-4">
        <div 
          className={`px-4 py-2 rounded-full text-sm font-medium border ${statusColor}`}
          role="status"
          aria-live="polite"
        >
          {statusText}
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

      {/* Current Target */}
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600">
          Target: <span className="font-semibold text-gray-900">
            {lastDirection?.closestProductId || "—"}
          </span>
        </p>
      </div>

      {/* Large Arrow Display */}
      <div 
        className="relative w-64 h-64 mx-auto mb-6 bg-gray-50 rounded-lg border-2 border-gray-200 flex items-center justify-center"
        aria-label={`Arrow pointing ${Math.round(arrowRotation)} degrees`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <Navigation 
            size={80}
            className="text-blue-600 motion-safe:transition-transform motion-safe:duration-300"
            style={{ 
              transform: `rotate(${arrowRotation}deg)`,
              transformOrigin: 'center'
            }}
          />
        </div>
        
        {/* Degree indicator */}
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <span className="text-xs font-mono text-gray-600 bg-white px-2 py-1 rounded">
            {Math.round(arrowRotation)}°
          </span>
        </div>
      </div>

      {/* Funnet Button */}
      <button
        onClick={sendFetchClosest}
        disabled={isButtonDisabled}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 disabled:active:scale-100"
      >
        Funnet
      </button>

      {/* Helper Text */}
      <p className="text-xs text-gray-500 text-center mt-4">
        Arrow rotates toward the nearest product. 0° is →, 90° is ↑.
      </p>
    </div>
  );
};

export default FindMyIngredient;