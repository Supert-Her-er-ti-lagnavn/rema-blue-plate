import React, { useState } from 'react';
import { useShoppingContext } from '@/contexts/useShoppingContext';
import FindMyIngredient from '../components/FindMyIngredient';

const ShoppingPage: React.FC = () => {
  const { shoppingList } = useShoppingContext();
  // Optionally, show a message if the list is empty
  if (shoppingList.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Handlelisten er tom</h1>
          <p className="text-gray-600">Legg til ingredienser fra måltidsplanleggeren for å begynne å handle!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🛒 Rema 1000 Shopping</h1>
          <p className="text-gray-600">Find your ingredients with ease</p>
        </div>

        {/* Content - Always show Find My Ingredient */}
        <div className="max-w-lg mx-auto">
          <FindMyIngredient />
        </div>
      </div>
    </div>
  );
};

export default ShoppingPage;