import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Plus } from "lucide-react";
import { useShoppingContext } from "@/contexts/useShoppingContext";
import { toast } from "sonner";
import { useState } from "react";
import { useNotification } from "@/contexts/NotificationContext";

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
  const { showFridgeNotification } = useNotification();
  const [isAdding, setIsAdding] = useState(false);

  // Use custom handler if provided (for fridge logic), else fallback to default
  const onAdd = handleAddMeal || (() => {
    setIsAdding(true);
    
    addItemsToShoppingList(
      ingredients.map((ing, i) => ({
        id: Number(`${mealIndex || 0}${i + 1}${ing.name.length}${title.length}${Date.now()}`),
        name: ing.name,
        quantity: parseInt(ing.amount) || 1,
        category: "",
        aisle: 1,
        checked: false,
        price: ing.price,
        mealId: mealIndex || 0,
      }))
    );

    showFridgeNotification();

    setTimeout(() => {
      setIsAdding(false);
    }, 300);
  });

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg">
      <div className="aspect-video relative overflow-hidden bg-muted">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge className="bg-primary text-primary-foreground font-bold text-sm px-2 py-1">
            {totalCost} kr
          </Badge>
        </div>
      </div>
      
      <div className="p-3 space-y-2">
        <h3 className="text-base font-black text-foreground uppercase tracking-tight">{title}</h3>
        
        <div className="flex items-center gap-3 text-xs text-muted-foreground font-semibold">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{prepTime} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{servings} servings</span>
          </div>
        </div>

        <div className="space-y-1">
          <h4 className="font-bold text-foreground uppercase text-xs">Ingredients:</h4>
          <ul className="space-y-1">
            {ingredients.map((ingredient, index) => (
              <li key={index} className="flex justify-between text-xs border-b border-border pb-1">
                <span className="text-foreground font-medium truncate">
                  {ingredient.amount} {ingredient.name}
                </span>
                <span className="font-bold text-foreground whitespace-nowrap ml-2">{ingredient.price} kr</span>
              </li>
            ))}
          </ul>
        </div>

        <Button 
          className={`w-full gap-1 font-bold uppercase text-xs transition-all py-2 ${isAdding ? 'animate-scale-in' : ''}`}
          variant="default"
          onClick={onAdd}
          disabled={isAdding}
        >
          <Plus className="w-3 h-3" />
          {isAdding ? 'Adding...' : 'Add to List'}
        </Button>
      </div>
    </Card>
  );
};
