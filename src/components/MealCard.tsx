import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Plus } from "lucide-react";

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
}

export const MealCard = ({ title, image, prepTime, servings, ingredients, totalCost }: MealCardProps) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-hover)] bg-gradient-to-br from-card to-accent/20">
      <div className="aspect-video relative overflow-hidden bg-muted">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute top-4 right-4">
          <Badge className="bg-secondary text-secondary-foreground">
            {totalCost} kr
          </Badge>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        <h3 className="text-2xl font-bold text-foreground">{title}</h3>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
          <h4 className="font-semibold text-foreground">Ingredients:</h4>
          <ul className="space-y-1">
            {ingredients.map((ingredient, index) => (
              <li key={index} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {ingredient.amount} {ingredient.name}
                </span>
                <span className="font-medium text-foreground">{ingredient.price} kr</span>
              </li>
            ))}
          </ul>
        </div>

        <Button className="w-full gap-2" variant="default">
          <Plus className="w-4 h-4" />
          Add to Meal Plan
        </Button>
      </div>
    </Card>
  );
};
