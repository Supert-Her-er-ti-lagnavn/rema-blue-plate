import React from 'react';
import { MealPlanningMode } from "@/components/MealPlanningMode";
import { ShoppingMode } from "@/components/ShoppingMode";

interface IndexProps {
  isShoppingMode?: boolean;
}

const Index: React.FC<IndexProps> = ({ isShoppingMode = false }) => {
  return (
    <div className="min-h-screen bg-background">
      {/* MODE SWITCHER - Clean separation */}
      {isShoppingMode ? (
        <ShoppingMode />
      ) : (
        <MealPlanningMode />
      )}
    </div>
  );
};

export default Index;
