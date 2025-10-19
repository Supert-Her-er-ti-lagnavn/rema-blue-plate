import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

// Backend types
interface RecipeSource {
  recipe_name: string;
  quantity: number;
  count: number;
}

interface CombinedShoppingItem {
  name: string;
  total_quantity: number;
  unit: string;
  checked: boolean;
  price_per_unit: number;
  total_price: number;
  sources: RecipeSource[];
}

interface RecipeSummary {
  recipe_uri: string;
  recipe_name: string;
  recipe_image: string;
  count: number;
  date_added: string;
}

interface ShoppingListResponse {
  combined_items: CombinedShoppingItem[];
  total_cost: number;
  total_items: number;
  recipes: RecipeSummary[];
}

export function useShoppingList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch shopping list
  const { data: shoppingList, isLoading, error } = useQuery<ShoppingListResponse>({
    queryKey: ['shopping-list', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(
        `http://localhost:8000/api/shopping/${user.id}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch shopping list');
      }

      return response.json();
    },
    enabled: !!user?.id,
  });

  // Add recipe to shopping list
  const addRecipe = useMutation({
    mutationFn: async (params: { recipeUri: string; sessionId: string }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(
        `http://localhost:8000/api/shopping/${user.id}/recipes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipe_uri: params.recipeUri,
            session_id: params.sessionId,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to add recipe');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list', user?.id] });
      toast.success('Recipe added to shopping list!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add recipe');
    },
  });

  // Remove recipe
  const removeRecipe = useMutation({
    mutationFn: async (recipeUri: string) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(
        `http://localhost:8000/api/shopping/${user.id}/recipes/${encodeURIComponent(recipeUri)}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to remove recipe');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list', user?.id] });
      toast.success('Recipe removed from shopping list');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove recipe');
    },
  });

  // Toggle item checked
  const toggleItemChecked = useMutation({
    mutationFn: async (params: { itemName: string; checked: boolean }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(
        `http://localhost:8000/api/shopping/${user.id}/items/${encodeURIComponent(params.itemName)}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            checked: params.checked,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update item');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list', user?.id] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update item');
    },
  });

  // Add manual item
  const addManualItem = useMutation({
    mutationFn: async (params: { itemName: string; quantity: number; unit: string }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(
        `http://localhost:8000/api/shopping/${user.id}/items`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            item_name: params.itemName,
            quantity: params.quantity,
            unit: params.unit,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to add item');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list', user?.id] });
      toast.success('Item added to shopping list');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add item');
    },
  });

  // Move checked to fridge
  const moveToFridge = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(
        `http://localhost:8000/api/shopping/${user.id}/move-to-fridge`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to move items to fridge');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['fridge', user?.id] });
      toast.success('Checked items moved to fridge!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to move items');
    },
  });

  // Delete individual item
  const deleteItem = useMutation({
    mutationFn: async (itemName: string) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(
        `http://localhost:8000/api/shopping/${user.id}/items/${encodeURIComponent(itemName)}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list', user?.id] });
      toast.success('Item removed from shopping list');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete item');
    },
  });

  // Clear shopping list
  const clearList = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(
        `http://localhost:8000/api/shopping/${user.id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to clear shopping list');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list', user?.id] });
      toast.success('Shopping list cleared');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to clear shopping list');
    },
  });

  return {
    shoppingList,
    isLoading,
    error,
    addRecipe,
    removeRecipe,
    toggleItemChecked,
    addManualItem,
    deleteItem,
    moveToFridge,
    clearList,
  };
}
