import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, X } from "lucide-react";

interface Meal {
  title: string;
  prepTime: number;
  servings: number;
  totalCost: number;
  ingredients: Array<{
    name: string;
    amount: string;
    price: number;
  }>;
}

interface WeeklyPlannerProps {
  meals: Meal[];
  onRemoveMeal?: (index: number) => void;
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const WeeklyPlanner = ({ meals, onRemoveMeal }: WeeklyPlannerProps) => {
  const totalWeeklyCost = meals.reduce((sum, meal) => sum + meal.totalCost, 0);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-primary" strokeWidth={2.5} />
          <h2 className="text-3xl font-black text-foreground uppercase tracking-tight">This Week's Plan</h2>
        </div>
        <Badge className="text-lg px-4 py-2 font-black bg-primary text-primary-foreground">
          Total: {totalWeeklyCost} kr
        </Badge>
      </div>

      {meals.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground font-semibold">No meals planned yet</p>
          <p className="text-sm text-muted-foreground">Add recipes to start planning your week</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {meals.map((meal, index) => (
            <Card 
              key={index} 
              className="p-4 transition-all duration-200 hover:shadow-lg group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-24 font-black text-primary uppercase text-sm">
                    {daysOfWeek[index] || `Day ${index + 1}`}
                  </div>
                  <div>
                    <div className="text-foreground font-bold">{meal.title}</div>
                    <div className="text-xs text-muted-foreground font-semibold">
                      {meal.prepTime} min • {meal.servings} servings
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="font-black text-lg text-foreground">{meal.totalCost} kr</div>
                  {onRemoveMeal && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onRemoveMeal(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {meals.length > 0 && (
        <Card className="p-6 bg-secondary border-2 border-primary">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-xl font-black text-foreground mb-1 uppercase">Weekly Shopping Total</h3>
              <p className="text-muted-foreground font-semibold">All ingredients included</p>
            </div>
            <div className="text-4xl font-black text-primary">{totalWeeklyCost} kr</div>
          </div>
        </Card>
      )}
    </div>
  );
};
