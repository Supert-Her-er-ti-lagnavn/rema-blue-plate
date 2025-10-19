import { useState } from 'react';
import { toast } from 'sonner';

interface EdamamRecipe {
  uri: string;
  label: string;
  image: string;
  source: string;
  url: string;
  yield_servings: number;
  ingredientLines: string[];
  calories: number;
  totalTime: number;
  cuisineType: string[];
  mealType: string[];
  dishType: string[];
  healthLabels: string[];
}

interface SearchRecipesResponse {
  session_id: string;
  search_results: EdamamRecipe[];
  selected_recipes: EdamamRecipe[];
  merged_preferences: {
    user_ids: number[];
    diet_labels: string[];
    excluded_ingredients: string[];
  };
}

export function useRecipeSearch() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<EdamamRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchRecipes = async (userIds: number[]) => {
    if (userIds.length === 0) {
      toast.error('Please select at least one person');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/recipes/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_ids: userIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to search recipes');
      }

      const data: SearchRecipesResponse = await response.json();

      setSessionId(data.session_id);
      setRecipes(data.selected_recipes); // Use AI-selected recipes

      toast.success(
        `Found ${data.selected_recipes.length} recipes matching your preferences!`
      );

      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to search recipes';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateRecipes = (newRecipes: EdamamRecipe[]) => {
    setRecipes(newRecipes);
  };

  const clearSearch = () => {
    setSessionId(null);
    setRecipes([]);
    setError(null);
  };

  return {
    sessionId,
    recipes,
    isLoading,
    error,
    searchRecipes,
    updateRecipes,
    clearSearch,
  };
}
