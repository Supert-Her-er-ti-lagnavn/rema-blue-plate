import React from 'react';
import { MealPlanningMode } from "@/components/MealPlanningMode";
import { ShoppingMode } from "@/components/ShoppingMode";
import { FridgeMode } from "@/components/FridgeMode";

interface IndexProps {
  currentMode?: 'planning' | 'shopping' | 'fridge';
}

const Index: React.FC<IndexProps> = ({ currentMode = 'planning' }) => {
  return (
    <div className="min-h-screen bg-background">
      {/* MODE SWITCHER - Clean separation */}
      {currentMode === 'shopping' ? (
        <ShoppingMode />
      ) : currentMode === 'fridge' ? (
        <FridgeMode />
      ) : (
        <MealPlanningMode />
      )}
    </div>
  );
};

export default Index;
