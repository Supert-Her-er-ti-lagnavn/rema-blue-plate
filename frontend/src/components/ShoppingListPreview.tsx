import { useShoppingList } from '../hooks/useShoppingList';
import { ShoppingCart, Loader2, X, Check } from 'lucide-react';

export function ShoppingListPreview() {
  const { shoppingList, isLoading, toggleItemChecked, deleteItem, removeRecipe } = useShoppingList();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!shoppingList || shoppingList.total_items === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 border-b pb-2">
          <ShoppingCart size={16} />
          <span>Shopping List</span>
        </div>
        <div className="text-center py-8">
          <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">No items yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Add recipes to get started
          </p>
        </div>
      </div>
    );
  }

  const handleToggleCheck = (itemName: string, currentChecked: boolean) => {
    toggleItemChecked.mutate({ itemName, checked: !currentChecked });
  };

  const handleDeleteItem = (itemName: string) => {
    deleteItem.mutate(itemName);
  };

  const handleRemoveRecipe = (recipeUri: string, recipeName: string) => {
    removeRecipe.mutate(recipeUri);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 border-b pb-2">
        <ShoppingCart size={16} />
        <span>Shopping List</span>
      </div>

      {/* Recipes Summary */}
      <div className="space-y-2 max-h-[200px] overflow-y-auto">
        {shoppingList.recipes.map((recipe) => (
          <div
            key={recipe.recipe_uri}
            className="p-2 bg-gray-50 rounded border border-gray-200 group hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-start gap-2">
              {recipe.recipe_image && (
                <img
                  src={recipe.recipe_image}
                  alt={recipe.recipe_name}
                  className="w-10 h-10 rounded object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">
                  {recipe.recipe_name}
                </p>
                {recipe.count > 1 && (
                  <p className="text-xs text-gray-500">×{recipe.count}</p>
                )}
              </div>
              <button
                onClick={() => handleRemoveRecipe(recipe.recipe_uri, recipe.recipe_name)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded flex-shrink-0"
                aria-label={`Remove ${recipe.recipe_name}`}
                title="Remove recipe and all its items"
              >
                <X className="w-3 h-3 text-red-600" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* All Items with Checkboxes and Delete */}
      <div className="space-y-1 max-h-[400px] overflow-y-auto">
        <p className="text-xs font-semibold text-gray-600 mb-2">Items:</p>
        {shoppingList.combined_items.map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded group"
          >
            <button
              onClick={() => handleToggleCheck(item.name, item.checked)}
              className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                item.checked
                  ? 'bg-green-500 border-green-600'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              aria-label={item.checked ? 'Uncheck item' : 'Check item'}
            >
              {item.checked && <Check className="w-3 h-3 text-white" />}
            </button>
            <span
              className={`flex-1 text-xs ${
                item.checked ? 'line-through text-gray-400' : 'text-gray-700'
              }`}
            >
              {item.total_quantity} {item.unit} {item.name}
            </span>
            <button
              onClick={() => handleDeleteItem(item.name)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded"
              aria-label="Delete item"
            >
              <X className="w-3 h-3 text-red-600" />
            </button>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="pt-2 border-t space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Total Items:</span>
          <span className="font-semibold text-gray-900">
            {shoppingList.total_items}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Total Cost:</span>
          <span className="font-semibold text-gray-900">
            {shoppingList.total_cost.toFixed(0)} kr
          </span>
        </div>
      </div>
    </div>
  );
}
