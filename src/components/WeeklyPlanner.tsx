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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-primary" strokeWidth={2.5} />
          <h2 className="text-3xl font-black text-foreground uppercase tracking-tight">This Week's Plan</h2>
        </div>
        <Badge className="text-lg px-4 py-2 font-black bg-primary text-primary-foreground">
          Total: {totalWeeklyCost} kr
        </Badge>
      </div>

      <div className="grid gap-3">
        {weeklyMeals.map((item, index) => (
          <Card 
            key={index} 
            className="p-4 transition-all duration-200 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-24 font-black text-primary uppercase text-sm">{item.day}</div>
                <div className="text-foreground font-bold">{item.meal}</div>
              </div>
              <div className="font-black text-lg text-foreground">{item.cost} kr</div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-secondary border-2 border-primary">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-xl font-black text-foreground mb-1 uppercase">Weekly Shopping Total</h3>
            <p className="text-muted-foreground font-semibold">All ingredients included</p>
          </div>
          <div className="text-4xl font-black text-primary">{totalWeeklyCost} kr</div>
        </div>
      </Card>
    </div>
  );
};
