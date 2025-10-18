import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Plus } from "lucide-react";
import { useShoppingContext } from "@/contexts/useShoppingContext";

interface Ingredient {
  name: string;
  amount: string;
  price: number;
}


interface MealCardProps {
  title: string;
  image: string;
  prepTime: number;
  servings: number;
  ingredients: Ingredient[];
  totalCost: number;
  mealIndex?: number;
  handleAddMeal?: () => void;
}


export const MealCard = ({ title, image, prepTime, servings, ingredients, totalCost, mealIndex, handleAddMeal }: MealCardProps) => {
  const { addItemsToShoppingList } = useShoppingContext();

  // Use custom handler if provided (for fridge logic), else fallback to default
  const onAdd = handleAddMeal || (() => {
    addItemsToShoppingList(
      ingredients.map((ing, i) => ({
        id: Number(`${mealIndex || 0}${i + 1}${ing.name.length}${title.length}`),
        name: ing.name,
        quantity: parseInt(ing.amount) || 1,
        category: "",
        aisle: 1,
        checked: false,
        price: ing.price,
        mealId: mealIndex || 0,
      }))
    );
  });

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg">
      <div className="aspect-video relative overflow-hidden bg-muted">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4">
          <Badge className="bg-primary text-primary-foreground font-bold text-base px-3 py-1">
            {totalCost} kr
          </Badge>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        <h3 className="text-xl font-black text-foreground uppercase tracking-tight">{title}</h3>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground font-semibold">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{prepTime} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{servings} servings</span>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-bold text-foreground uppercase text-sm">Ingredients:</h4>
          <ul className="space-y-1.5">
            {ingredients.map((ingredient, index) => (
              <li key={index} className="flex justify-between text-sm border-b border-border pb-1.5">
                <span className="text-foreground font-medium">
                  {ingredient.amount} {ingredient.name}
                </span>
                <span className="font-bold text-foreground">{ingredient.price} kr</span>
              </li>
            ))}
          </ul>
        </div>

        <Button 
          className="w-full gap-2 font-bold uppercase text-sm" 
          variant="default"
          onClick={onAdd}
        >
          <Plus className="w-4 h-4" />
          Add to Meal Plan
        </Button>
      </div>
    </Card>
  );
};
