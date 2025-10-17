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
    <Card className="p-6 bg-card">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-full bg-primary">
          <ShoppingCart className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">Shopping List</h3>
          <p className="text-sm text-muted-foreground font-semibold">All groceries you need to buy</p>
        </div>
      </div>

      <div className="space-y-2">
        {consolidatedIngredients.map((ingredient, index) => (
          <div 
            key={index} 
            className="flex justify-between items-center p-3 rounded-lg bg-secondary border border-border"
          >
            <div>
              <span className="font-bold text-foreground">{ingredient.name}</span>
              <span className="text-sm text-muted-foreground ml-2 font-semibold">({ingredient.amount})</span>
            </div>
            <span className="font-black text-primary text-lg">{ingredient.price} kr</span>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t-2 border-primary">
        <div className="flex justify-between items-center">
          <span className="text-lg font-black text-foreground uppercase">Total Cost</span>
          <span className="text-3xl font-black text-primary">{totalCost} kr</span>
        </div>
      </div>
    </Card>
  );
};
