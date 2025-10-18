import React from 'react';
import { ShoppingList } from "@/components/ShoppingList";
import { MealCard } from "@/components/MealCard";
import { WeeklyPlanner } from "@/components/WeeklyPlanner";

const sampleMeals = [
  {
    title: "Chicken Tikka Masala",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
    prepTime: 45,
    servings: 4,
    totalCost: 89,
    ingredients: [
      { name: "Chicken breast", amount: "500g", price: 45 },
      { name: "Tikka masala sauce", amount: "1 jar", price: 25 },
      { name: "Rice", amount: "300g", price: 12 },
      { name: "Naan bread", amount: "4 pcs", price: 7 },
    ],
  },
  {
    title: "Spaghetti Carbonara",
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&q=80",
    prepTime: 25,
    servings: 4,
    totalCost: 65,
    ingredients: [
      { name: "Spaghetti", amount: "400g", price: 15 },
      { name: "Bacon", amount: "200g", price: 28 },
      { name: "Eggs", amount: "4 pcs", price: 12 },
      { name: "Parmesan", amount: "100g", price: 10 },
    ],
  },
  {
    title: "Salmon with Vegetables",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80",
    prepTime: 30,
    servings: 4,
    totalCost: 125,
    ingredients: [
      { name: "Salmon fillets", amount: "600g", price: 85 },
      { name: "Broccoli", amount: "400g", price: 18 },
      { name: "Potatoes", amount: "500g", price: 15 },
      { name: "Lemon", amount: "2 pcs", price: 7 },
    ],
  },
];

export const MealPlanningMode: React.FC = () => {
  return (
    <>
      {/* CONTENT WRAPPER */}
      <div className="max-w-7xl mx-auto px-4 py-8 pb-24 space-y-16">
        
        {/* SECTION 1: MEAL PLANNING HEADER */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-foreground mb-2 uppercase tracking-tight">
              📅 Meal Planning
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Plan your weekly meals and discover new recipes
            </p>
          </div>
        </section>

        {/* SECTION 2: SHOPPING LIST - Easy to replace */}
        <section>
          <ShoppingList meals={sampleMeals} />
        </section>

        {/* SECTION 3: POPULAR RECIPES - Easy to replace */}
        <section>
          <h2 className="text-3xl font-black text-foreground mb-8 uppercase tracking-tight">
            Popular Recipes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleMeals.map((meal, index) => (
              <MealCard key={index} {...meal} />
            ))}
          </div>
        </section>

        {/* SECTION 4: WEEKLY PLANNER - Easy to replace */}
        <section>
          <WeeklyPlanner />
        </section>

        {/* 
        NEW SECTIONS CAN BE ADDED HERE
        Just copy-paste new <section> blocks:
        
        <section>
          <YourNewComponent />
        </section>
        */}
        
      </div>
    </>
  );
};