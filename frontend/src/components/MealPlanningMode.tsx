import React from 'react';
import { MealCard } from '@/components/MealCard';
import { MealPlanningLayout } from '@/components/MealPlanningLayout';
import { FamilySelector } from '@/components/FamilySelector';
import { ShoppingListPreview } from '@/components/ShoppingListPreview';
import { ChatPanel } from '@/components/ChatPanel';
import { useRecipeSearch } from '@/hooks/useRecipeSearch';
import { sampleMeals } from '@/components/sampleMeals';
import { Loader2 } from 'lucide-react';

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
  const {
    sessionId,
    recipes,
    isLoading,
    searchRecipes,
    updateRecipes,
  } = useRecipeSearch();

  const handleSearch = async (selectedUserIds: number[]) => {
    await searchRecipes(selectedUserIds);
  };

  const handleRecipesUpdate = (newRecipes: any[]) => {
    updateRecipes(newRecipes);
  };

  // Use backend recipes if available, otherwise show sample meals as default
  const displayRecipes = recipes.length > 0 ? recipes : sampleMeals;
  const isBackendRecipes = recipes.length > 0;

  return (
    <MealPlanningLayout
      leftPanel={
        <>
          <FamilySelector onSearch={handleSearch} isSearching={isLoading} />
          <div className="border-t pt-4">
            <ShoppingListPreview />
          </div>
        </>
      }
      mainContent={
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-black text-foreground mb-2 uppercase tracking-tight">
              📅 {isBackendRecipes ? 'AI-Selected Recipes' : 'Sample Recipes'}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {isBackendRecipes
                ? 'These recipes match your family\'s preferences'
                : 'Select family members and search to get personalized recipes'}
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600 font-medium">Searching recipes...</p>
              <p className="text-sm text-gray-500 mt-2">
                AI is selecting the best recipes for you
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isBackendRecipes
                ? recipes.map((recipe, index) => (
                    <MealCard
                      key={recipe.uri}
                      title={recipe.label}
                      image={recipe.image}
                      prepTime={recipe.totalTime || 30}
                      servings={recipe.yield_servings || 4}
                      totalCost={recipe.ingredientLines.length * 20} // Mock cost
                      ingredients={recipe.ingredientLines.map((line, idx) => ({
                        name: line,
                        amount: "1",
                        price: 20,
                      }))}
                      mealIndex={index + 1}
                      handleAddMeal={() => {}}
                      recipeUri={recipe.uri}
                      sessionId={sessionId}
                    />
                  ))
                : sampleMeals.map((meal, index) => (
                    <MealCard
                      key={index}
                      {...meal}
                      mealIndex={index + 1}
                      handleAddMeal={() => {}}
                      sessionId={null}
                    />
                  ))}
            </div>
          )}

          {!isBackendRecipes && !isLoading && (
            <div className="text-center py-8 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-900 font-medium mb-2">
                👈 Select your family and search for personalized recipes!
              </p>
              <p className="text-blue-700 text-sm">
                AI will find recipes matching everyone's dietary preferences
              </p>
            </div>
          )}
        </div>
      }
      rightPanel={
        <ChatPanel
          sessionId={sessionId}
          onRecipesUpdate={handleRecipesUpdate}
        />
      }
    />
  );
};
