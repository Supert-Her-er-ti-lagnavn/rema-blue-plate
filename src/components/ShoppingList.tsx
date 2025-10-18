import { Card } from "@/components/ui/card";
import { ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Ingredient {
  name: string;
  amount: string;
  price: number;
}

interface ShoppingListProps {
  meals: Array<{
    title?: string;
    ingredients: Ingredient[];
  }>;
  onRemoveIngredient?: (ingredientName: string) => void;
}

export const ShoppingList = ({ meals, onRemoveIngredient }: ShoppingListProps) => {
  const totalCost = meals.reduce((sum, meal) => 
    sum + meal.ingredients.reduce((mealSum, ing) => mealSum + ing.price, 0), 0
  );

  return (
    <Card className="p-6 bg-card">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-full bg-primary">
          <ShoppingCart className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">Shopping List</h3>
          <p className="text-sm text-muted-foreground font-semibold">Groceries organized by meal</p>
        </div>
      </div>

      {meals.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p className="font-semibold">No meals added yet</p>
          <p className="text-sm">Add recipes to see your shopping list</p>
        </div>
      ) : (
        <div className="space-y-6">
          {meals.map((meal, mealIndex) => (
            <div key={mealIndex} className="space-y-2">
              <h4 className="font-black text-foreground uppercase text-sm flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                  {mealIndex + 1}
                </span>
                {(meal as any).title || `Meal ${mealIndex + 1}`}
              </h4>
              <div className="space-y-2 pl-8">
                {meal.ingredients.map((ingredient, index) => (
                  <div 
                    key={index} 
                    className="flex justify-between items-center p-3 rounded-lg bg-secondary border border-border group"
                  >
                    <div className="flex-1">
                      <span className="font-bold text-foreground">{ingredient.name}</span>
                      <span className="text-sm text-muted-foreground ml-2 font-semibold">({ingredient.amount})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-primary text-lg">{ingredient.price} kr</span>
                      {onRemoveIngredient && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => onRemoveIngredient(ingredient.name)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-6 border-t-2 border-primary">
        <div className="flex justify-between items-center">
          <span className="text-lg font-black text-foreground uppercase">Total Cost</span>
          <span className="text-3xl font-black text-primary">{totalCost} kr</span>
        </div>
      </div>
    </Card>
  );
};
