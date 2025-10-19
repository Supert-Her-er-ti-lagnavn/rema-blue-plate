import { Card } from "@/components/ui/card";
import { ShoppingCart, X, Check, Wallet, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShoppingContext } from "@/contexts/useShoppingContext";
import { sampleMeals } from "@/components/sampleMeals";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const ShoppingList = () => {
  const {
    shoppingList,
    removeItemFromList,
    markItemFound,
    clearShoppingList,
    getCompletedCount,
    getTotalCount,
    recordPurchaseAndRemove,
  } = useShoppingContext();

  const [monthlyBudget, setMonthlyBudget] = useState(5000);
  const [hasShownHalfBudgetWarning, setHasShownHalfBudgetWarning] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setMonthlyBudget(profile.monthlyBudget || 5000);
    }
  }, []);

  // Only multiply price by quantity if quantity is a true count (not grams/ml)
  // If quantity is 1, or a string that cannot be parsed as a number, just add price
  // Also, avoid double-counting duplicate items (same name and mealId)
  const seen = new Set<string>();
  const totalCost = shoppingList.reduce((sum, item) => {
    const key = `${item.name}|${item.mealId || ''}`;
    if (seen.has(key)) return sum;
    seen.add(key);
    // If quantity is a number and less than 20, treat as count, else just add price
    const qty = Number(item.quantity);
    if (!isNaN(qty) && qty > 1 && qty < 20) {
      return sum + (item.price * qty);
    } else {
      return sum + item.price;
    }
  }, 0);

  // Spent amount stored in localStorage
  const [spentAmount, setSpentAmount] = useState(() => {
    const saved = localStorage.getItem('monthlySpent');
    return saved ? parseFloat(saved) : 0;
  });

  const [budgetJustUpdated, setBudgetJustUpdated] = useState(false);

  const refreshMonthlySpent = () => {
    const saved = localStorage.getItem('monthlySpent');
    setSpentAmount(saved ? parseFloat(saved) : 0);
    // Trigger animation when budget updates
    setBudgetJustUpdated(true);
    setTimeout(() => setBudgetJustUpdated(false), 1000);
  };

  useEffect(() => {
    const handleStorageChange = () => refreshMonthlySpent();
    window.addEventListener('monthlySpentUpdated', handleStorageChange);
    return () => window.removeEventListener('monthlySpentUpdated', handleStorageChange);
  }, []);

  const budgetPercentage = (spentAmount / monthlyBudget) * 100;
  const halfBudgetReached = spentAmount >= monthlyBudget * 0.5;

  useEffect(() => {
    if (halfBudgetReached && !hasShownHalfBudgetWarning && spentAmount > 0) {
      toast.warning('⚠️ Budsjettvarsel', {
        description: `Du har brukt ${spentAmount.toFixed(0)} kr (${budgetPercentage.toFixed(0)}% av budsjettet ditt)`,
        duration: 5000,
      });
      setHasShownHalfBudgetWarning(true);
    }
    if (!halfBudgetReached && hasShownHalfBudgetWarning) {
      setHasShownHalfBudgetWarning(false);
    }
  }, [halfBudgetReached, spentAmount, budgetPercentage, hasShownHalfBudgetWarning]);

  return (
    <Card className="p-6 bg-card">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-full bg-primary">
          <ShoppingCart className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">Shopping List</h3>
          <p className="text-sm text-muted-foreground font-semibold">All your groceries in one place</p>
        </div>
        <Button variant="outline" size="sm" className="ml-auto" onClick={clearShoppingList}>Clear</Button>
      </div>

      {shoppingList.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p className="font-semibold">No items in your shopping list</p>
          <p className="text-sm">Add meals or ingredients to get started</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Group items by mealId and show meal name if available */}
          {Object.entries(
            shoppingList.reduce((acc, item) => {
              const key = item.mealId
                ? sampleMeals[item.mealId - 1]?.title || `Meal ${item.mealId}`
                : 'Other';
              if (!acc[key]) acc[key] = [];
              acc[key].push(item);
              return acc;
            }, {} as Record<string, typeof shoppingList>)
          ).map(([group, items]) => (
            <div key={group} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-foreground uppercase text-sm flex items-center gap-2">
                  {group}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    items.forEach(item => removeItemFromList(item.id));
                    toast.success(`Removed all items from ${group}`);
                  }}
                  className="h-6 px-2 text-xs hover:bg-red-100 hover:text-red-600"
                  title={`Remove all items from ${group}`}
                >
                  <X className="h-3 w-3 mr-1" />
                  Remove all
                </Button>
              </div>
              {items.map(item => (
                <div key={item.id} className={`flex justify-between items-center p-3 rounded-lg border group ${item.checked ? 'bg-green-100 border-green-400' : 'bg-secondary border-border'}`}>
                  <div className="flex-1">
                    <span className={`font-bold text-foreground ${item.checked ? 'line-through text-muted-foreground' : ''}`}>{item.name}</span>
                    <span className="text-sm text-muted-foreground ml-2 font-semibold">x{item.quantity}</span>
                    <span className="text-xs ml-2 text-muted-foreground">Aisle {item.aisle}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-primary text-lg">{item.price} kr</span>
                    {!item.checked && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async () => {
                          markItemFound(item.id);
                          await recordPurchaseAndRemove(item.id);
                          toast.success(`✓ ${item.name} lagt til budsjettet (${item.price} kr)`);
                        }}
                        title="Mark as found"
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        removeItemFromList(item.id);
                      }}
                      title="Remove item"
                      className="hover:bg-red-100 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-6 border-t-2 border-primary space-y-4">
        {/* Budget Summary */}
        <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-2 border-blue-200 transition-all duration-300 ${budgetJustUpdated ? 'scale-105 ring-4 ring-blue-300' : ''}`}>
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-bold text-gray-700 uppercase">Månedsbudsjett</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Handlet</span>
              <span className={`text-lg font-bold transition-all duration-300 ${budgetJustUpdated ? 'scale-110' : ''} ${halfBudgetReached ? 'text-orange-600' : 'text-blue-600'}`}>
                {spentAmount.toFixed(0)} kr
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  budgetPercentage >= 75 ? 'bg-red-500' : 
                  budgetPercentage >= 50 ? 'bg-orange-500' : 
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center text-xs text-gray-600">
              <span>0 kr</span>
              <span className="font-semibold">{budgetPercentage.toFixed(0)}%</span>
              <span>{monthlyBudget} kr</span>
            </div>

            {halfBudgetReached && (
              <div className="flex items-center gap-2 mt-2 p-2 bg-orange-100 rounded border border-orange-300">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <span className="text-xs text-orange-800 font-semibold">
                  Du har brukt over halvparten av budsjettet ditt
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Total Cost */}
        <div className="flex justify-between items-center">
          <span className="text-lg font-black text-foreground uppercase">Total Cost</span>
          <span className="text-3xl font-black text-primary">{totalCost.toFixed(2)} kr</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Items found: {getCompletedCount()} / {getTotalCount()}</span>
        </div>
      </div>
    </Card>
  );
};
