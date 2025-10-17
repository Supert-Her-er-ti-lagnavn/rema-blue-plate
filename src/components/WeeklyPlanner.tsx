import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

interface DayMeal {
  day: string;
  meal: string;
  cost: number;
}

const weeklyMeals: DayMeal[] = [
  { day: "Monday", meal: "Chicken Tikka Masala", cost: 89 },
  { day: "Tuesday", meal: "Spaghetti Carbonara", cost: 65 },
  { day: "Wednesday", meal: "Salmon with Vegetables", cost: 125 },
  { day: "Thursday", meal: "Beef Tacos", cost: 78 },
  { day: "Friday", meal: "Margherita Pizza", cost: 52 },
  { day: "Saturday", meal: "Thai Green Curry", cost: 95 },
  { day: "Sunday", meal: "Roasted Chicken Dinner", cost: 110 },
];

export const WeeklyPlanner = () => {
  const totalWeeklyCost = weeklyMeals.reduce((sum, meal) => sum + meal.cost, 0);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-primary" />
          <h2 className="text-3xl font-bold text-foreground">This Week's Plan</h2>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          Total: {totalWeeklyCost} kr
        </Badge>
      </div>

      <div className="grid gap-3">
        {weeklyMeals.map((item, index) => (
          <Card 
            key={index} 
            className="p-4 transition-all duration-200 hover:shadow-[var(--shadow-card)] bg-gradient-to-r from-card to-accent/10"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-24 font-semibold text-primary">{item.day}</div>
                <div className="text-foreground font-medium">{item.meal}</div>
              </div>
              <div className="font-bold text-lg text-foreground">{item.cost} kr</div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-1">Weekly Shopping Total</h3>
            <p className="text-muted-foreground">All ingredients included</p>
          </div>
          <div className="text-4xl font-bold text-primary">{totalWeeklyCost} kr</div>
        </div>
      </Card>
    </div>
  );
};
