import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Plus, Check } from "lucide-react";
import { useShoppingContext } from "@/contexts/useShoppingContext";
import { useShoppingList } from "@/hooks/useShoppingList";
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
  recipeUri?: string;
  sessionId?: string | null;
}


export const MealCard = ({
  title,
  image,
  prepTime,
  servings,
  ingredients,
  totalCost,
  mealIndex,
  handleAddMeal,
  recipeUri,
  sessionId
}: MealCardProps) => {
  const { addItemsToShoppingList } = useShoppingContext();
  const { addRecipe } = useShoppingList();
  const { showFridgeNotification } = useNotification();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  // Wrap handler to always trigger animations
  const onAdd = async () => {
    console.log('[MealCard] Adding recipe:', title);
    console.log('[MealCard] recipeUri:', recipeUri);
    console.log('[MealCard] sessionId:', sessionId);

    setIsAdding(true);

    try {
      // If we have recipeUri and sessionId, use backend
      if (recipeUri && sessionId) {
        console.log('[MealCard] Using backend system');
        await addRecipe.mutateAsync({
          recipeUri,
          sessionId,
        });
        console.log('[MealCard] Backend add successful');
      } else if (handleAddMeal) {
        // Use custom handler (for fridge logic with sample meals)
        console.log('[MealCard] Using custom handler');
        handleAddMeal();
      } else {
        // Default handler for sample meals
        console.log('[MealCard] Using localStorage system');
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
        toast.success('Recipe added to shopping list!');
      }

      showFridgeNotification();

      setTimeout(() => {
        setIsAdding(false);
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 1000);
      }, 300);
    } catch (error) {
      console.error('[MealCard] Error adding recipe:', error);
      setIsAdding(false);
      // Error toast is already handled in useShoppingList
    }
  };

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
          className={`w-full gap-2 font-bold uppercase text-sm transition-all duration-300 ${
            isAdding ? 'animate-pulse scale-95' : ''
          } ${
            justAdded ? 'animate-scale-in bg-green-600 hover:bg-green-600' : ''
          }`}
          variant="default"
          onClick={onAdd}
          disabled={isAdding}
        >
          {justAdded ? (
            <>
              <Check className="w-4 h-4" />
              Lagt til!
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              {isAdding ? 'Legger til...' : 'Legg til i handlelisten'}
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};
