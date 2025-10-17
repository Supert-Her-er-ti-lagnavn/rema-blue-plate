import { Hero } from "@/components/Hero";
import { MealCard } from "@/components/MealCard";
import { WeeklyPlanner } from "@/components/WeeklyPlanner";
import { ShoppingList } from "@/components/ShoppingList";

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

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-16">
        <section>
          <ShoppingList meals={sampleMeals} />
        </section>

        <section>
          <h2 className="text-3xl font-bold text-foreground mb-8">Popular Recipes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleMeals.map((meal, index) => (
              <MealCard key={index} {...meal} />
            ))}
          </div>
        </section>

        <section>
          <WeeklyPlanner />
        </section>
      </div>
    </div>
  );
};

export default Index;
