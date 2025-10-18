
import React from 'react';
import { MealCard } from "@/components/MealCard";
import { ShoppingList } from "@/components/ShoppingList";
import { useShoppingContext } from "@/contexts/useShoppingContext";
import { sampleMeals } from "@/components/sampleMeals";

export interface Meal {
  title: string;
  image: string;
  prepTime: number;
  servings: number;
  totalCost: number;
  ingredients: Array<{
    name: string;
    amount: string;
    price: number;
  }>;
}

export const MealPlanningMode: React.FC = () => {
  const { addItemsToShoppingList } = useShoppingContext();


  // Utility to filter fridge items and update fridge
  const filterIngredientsWithFridge = (ingredients: { name: string; amount: string; price: number; }[]) => {
    // Get fridge items from localStorage (array of { name: string })
    const fridgeItems: { name: string }[] = JSON.parse(localStorage.getItem('fridgeItems') || '[]');
    // Lowercase names for comparison
    const fridgeItemNames = fridgeItems.map(item => item.name.trim().toLowerCase());
    // Track which fridge items are used
    const usedFromFridge: string[] = [];
    // Only add ingredients not in fridge
    const neededIngredients = ingredients.filter(ingredient => {
      const name = ingredient.name.trim().toLowerCase();
      const isInFridge = fridgeItemNames.includes(name);
      if (isInFridge) usedFromFridge.push(name);
      return !isInFridge;
    });
    // Remove used items from fridge
    if (usedFromFridge.length > 0) {
      const updatedFridge = fridgeItems.filter(item => !usedFromFridge.includes(item.name.trim().toLowerCase()));
      localStorage.setItem('fridgeItems', JSON.stringify(updatedFridge));
    }
    return neededIngredients;
  };

  // Handler to add meal, using fridge logic
  const handleAddMeal = (meal: Meal, mealIndex: number) => {
    const neededIngredients = filterIngredientsWithFridge(meal.ingredients);
    if (neededIngredients.length > 0) {
      // Generate unique ID using timestamp to allow same meal multiple times
      const timestamp = Date.now();
      addItemsToShoppingList(
        neededIngredients.map((ing, i) => ({
          id: Number(`${timestamp}${mealIndex}${i}`),
          name: ing.name,
          quantity: parseInt(ing.amount) || 1,
          category: "",
          aisle: 1,
          checked: false,
          price: ing.price,
          mealId: Number(`${timestamp}${mealIndex}`),
        }))
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 pb-24 space-y-16">
        {/* SECTION 1: MODE HEADER */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-foreground mb-2 uppercase tracking-tight">
              📅 Meal Planning
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Plan your weekly meals and discover new recipes
            </p>
          </div>
        </section>

        {/* SECTION 2: SHOPPING LIST - Now context-driven */}
        <section>
          <ShoppingList />
        </section>

        {/* SECTION 4: POPULAR RECIPES - Add to shopping list via context and fridge logic */}
        <section>
          <h2 className="text-3xl font-black text-foreground mb-8 uppercase tracking-tight">
            Popular Recipes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleMeals.map((meal, index) => (
              <MealCard key={index} {...meal} mealIndex={index + 1} handleAddMeal={() => handleAddMeal(meal, index + 1)} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

