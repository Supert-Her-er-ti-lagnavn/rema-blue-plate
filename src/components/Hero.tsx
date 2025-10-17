import { Button } from "@/components/ui/button";
import { ChefHat, ShoppingCart, Calendar } from "lucide-react";

export const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-8">
          <div className="inline-block">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
              <ShoppingCart className="w-5 h-5" />
              <span className="text-sm font-medium">Powered by Rema 1000</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Plan Your Meals,
            <br />
            <span className="text-secondary">Save Your Money</span>
          </h1>
          
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            Create delicious weekly meal plans using fresh groceries from your local Rema 1000. 
            See exactly what each meal costs before you shop.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button size="lg" variant="secondary" className="text-lg px-8 gap-2">
              <ChefHat className="w-5 h-5" />
              Start Planning
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 gap-2 bg-white/10 hover:bg-white/20 border-white/30 text-white hover:text-white">
              <Calendar className="w-5 h-5" />
              View Sample Plan
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-3xl font-bold mb-2">500+</div>
              <div className="text-primary-foreground/80">Recipes Available</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-3xl font-bold mb-2">30%</div>
              <div className="text-primary-foreground/80">Average Savings</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-3xl font-bold mb-2">10min</div>
              <div className="text-primary-foreground/80">Planning Time</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-secondary/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
    </div>
  );
};
