import { Card } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

interface Ingredient {
  name: string;
  amount: string;
  price: number;
}

interface ShoppingListProps {
  meals: Array<{
    ingredients: Ingredient[];
  }>;
}

export const ShoppingList = ({ meals }: ShoppingListProps) => {
  // Consolidate all ingredients
  const allIngredients = meals.flatMap(meal => meal.ingredients);
  
  // Group by ingredient name
  const consolidatedIngredients = allIngredients.reduce((acc, ingredient) => {
    const existing = acc.find(item => item.name === ingredient.name);
    if (existing) {
      existing.price += ingredient.price;
    } else {
      acc.push({ ...ingredient });
    }
    return acc;
  }, [] as Ingredient[]);

  const totalCost = consolidatedIngredients.reduce((sum, item) => sum + item.price, 0);

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-accent/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-full bg-primary/10">
          <ShoppingCart className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-foreground">Shopping List</h3>
          <p className="text-sm text-muted-foreground">All groceries you need to buy</p>
        </div>
      </div>

      <div className="space-y-3">
        {consolidatedIngredients.map((ingredient, index) => (
          <div 
            key={index} 
            className="flex justify-between items-center p-3 rounded-lg bg-background/50 border border-border"
          >
            <div>
              <span className="font-medium text-foreground">{ingredient.name}</span>
              <span className="text-sm text-muted-foreground ml-2">({ingredient.amount})</span>
            </div>
            <span className="font-semibold text-primary">{ingredient.price} kr</span>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-foreground">Total Cost</span>
          <span className="text-2xl font-bold text-primary">{totalCost} kr</span>
        </div>
      </div>
    </Card>
  );
};
