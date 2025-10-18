import { useState } from "react";
import { Hero } from "@/components/Hero";
import { MealCard } from "@/components/MealCard";
import { WeeklyPlanner } from "@/components/WeeklyPlanner";
import { ShoppingList } from "@/components/ShoppingList";

interface Meal {
  title: string;
  image: string;
  prepTime: number;
  servings: number;
  totalCost: number;
  ingredients: Array<{
    name: string;
    amount: string;
    price: number;
  }>;
}

const sampleMeals: Meal[] = [
  {
    title: "Pasta Alfredo med Kylling",
    image: "https://www.rema.no/acd-cgi/img/v1/wordpress/wp-content/uploads/2025/10/IMG_3833-1-1920x1080.jpg?width=660",
    prepTime: 35,
    servings: 4,
    totalCost: 95,
    ingredients: [
      { name: "Kyllingfilet", amount: "500g", price: 55 },
      { name: "Pasta", amount: "400g", price: 15 },
      { name: "Fløte", amount: "3 dl", price: 18 },
      { name: "Parmesan", amount: "100g", price: 7 },
    ],
  },
  {
    title: "Marry Me Chicken",
    image: "https://www.rema.no/acd-cgi/img/v1/wordpress/wp-content/uploads/2025/03/REMA1000-SP8-9-Merry-me-chicken-B-e1754460393872-1920x1080.jpg?width=660",
    prepTime: 45,
    servings: 4,
    totalCost: 110,
    ingredients: [
      { name: "Kyllingfilet", amount: "600g", price: 65 },
      { name: "Soltørkede tomater", amount: "100g", price: 22 },
      { name: "Fløte", amount: "3 dl", price: 18 },
      { name: "Hvitløk", amount: "3 fedd", price: 5 },
    ],
  },
  {
    title: "Tacosuppe",
    image: "https://www.rema.no/acd-cgi/img/v1/wordpress/wp-content/uploads/2024/10/IMG_1757-1-1920x1080.jpg?width=660",
    prepTime: 30,
    servings: 4,
    totalCost: 85,
    ingredients: [
      { name: "Kjøttdeig", amount: "500g", price: 45 },
      { name: "Taco krydder", amount: "1 pk", price: 12 },
      { name: "Tomater på boks", amount: "400g", price: 15 },
      { name: "Mais", amount: "1 boks", price: 13 },
    ],
  },
  {
    title: "Kylling med Pesto og Ris",
    image: "https://www.rema.no/acd-cgi/img/v1/wordpress/wp-content/uploads/2025/08/Bilde-3305-1-1920x1080.jpg?width=660",
    prepTime: 90,
    servings: 4,
    totalCost: 105,
    ingredients: [
      { name: "Kyllinglår", amount: "800g", price: 60 },
      { name: "Pesto", amount: "1 glass", price: 28 },
      { name: "Ris", amount: "300g", price: 12 },
      { name: "Grønnsaker", amount: "400g", price: 5 },
    ],
  },
  {
    title: "Kebab i Langpanne",
    image: "https://www.rema.no/acd-cgi/img/v1/wordpress/wp-content/uploads/2025/08/Bilde-3247-1-1920x1080.jpg?width=660",
    prepTime: 30,
    servings: 4,
    totalCost: 92,
    ingredients: [
      { name: "Kjøttdeig", amount: "600g", price: 54 },
      { name: "Kebabkrydder", amount: "1 pk", price: 15 },
      { name: "Paprika", amount: "2 stk", price: 18 },
      { name: "Hvitløk", amount: "3 fedd", price: 5 },
    ],
  },
  {
    title: "Ovnsbakt Gyoza i Red Curry",
    image: "https://www.rema.no/acd-cgi/img/v1/wordpress/wp-content/uploads/2025/09/Bilde-3771-1-1920x1080.jpg?width=660",
    prepTime: 35,
    servings: 4,
    totalCost: 78,
    ingredients: [
      { name: "Gyoza", amount: "1 pk", price: 45 },
      { name: "Red curry paste", amount: "2 ss", price: 8 },
      { name: "Kokosmelk", amount: "400ml", price: 20 },
      { name: "Grønnsaker", amount: "200g", price: 5 },
    ],
  },
  {
    title: "BBQ Chicken Tenders",
    image: "https://www.rema.no/acd-cgi/img/v1/wordpress/wp-content/uploads/2025/03/IMG-4159-fra-Google-Disk-1-1-e1742285896240-1920x1080.jpg?width=660",
    prepTime: 45,
    servings: 4,
    totalCost: 88,
    ingredients: [
      { name: "Kyllingfilet", amount: "600g", price: 65 },
      { name: "BBQ saus", amount: "200ml", price: 18 },
      { name: "Mel", amount: "2 dl", price: 3 },
      { name: "Egg", amount: "2 stk", price: 2 },
    ],
  },
  {
    title: "Shakshuka",
    image: "https://www.rema.no/acd-cgi/img/v1/wordpress/wp-content/uploads/2024/04/IMG_1181.jpg?width=660",
    prepTime: 20,
    servings: 4,
    totalCost: 65,
    ingredients: [
      { name: "Egg", amount: "6 stk", price: 18 },
      { name: "Tomater", amount: "400g", price: 25 },
      { name: "Paprika", amount: "2 stk", price: 18 },
      { name: "Løk", amount: "1 stk", price: 4 },
    ],
  },
  {
    title: "Blomkålbiff",
    image: "https://www.rema.no/acd-cgi/img/v1/wordpress/wp-content/uploads/2024/09/IMG_1815-1-1920x1080.jpg?width=660",
    prepTime: 20,
    servings: 4,
    totalCost: 55,
    ingredients: [
      { name: "Blomkål", amount: "1 stk", price: 35 },
      { name: "Olje", amount: "3 ss", price: 5 },
      { name: "Krydder", amount: "1 pk", price: 12 },
      { name: "Sitron", amount: "1 stk", price: 3 },
    ],
  },
];

const Index = () => {
  const [addedMeals, setAddedMeals] = useState<Meal[]>([]);

  const handleAddMeal = (meal: Meal) => {
    setAddedMeals([...addedMeals, meal]);
  };

  const handleRemoveIngredient = (ingredientName: string) => {
    // Remove all instances of this ingredient from all meals
    const updatedMeals = addedMeals.map(meal => ({
      ...meal,
      ingredients: meal.ingredients.filter(ing => ing.name !== ingredientName)
    })).filter(meal => meal.ingredients.length > 0); // Remove meals with no ingredients
    
    setAddedMeals(updatedMeals);
  };

  return (
    <div className="min-h-screen bg-background">
      <Hero />
      
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-16">
        <section>
          <ShoppingList meals={addedMeals} onRemoveIngredient={handleRemoveIngredient} />
        </section>

        <section>
          <h2 className="text-3xl font-black text-foreground mb-8 uppercase tracking-tight">Popular Recipes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleMeals.map((meal, index) => (
              <MealCard key={index} {...meal} onAddMeal={() => handleAddMeal(meal)} />
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
