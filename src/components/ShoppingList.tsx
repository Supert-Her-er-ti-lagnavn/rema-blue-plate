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

  const refreshMonthlySpent = () => {
    const saved = localStorage.getItem('monthlySpent');
    setSpentAmount(saved ? parseFloat(saved) : 0);
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
    <Card className="p-3 bg-card">
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-primary">
            <ShoppingCart className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <h3 className="text-lg font-black text-foreground uppercase tracking-tight">Shopping</h3>
          <Button variant="outline" size="sm" className="ml-auto text-xs px-2 py-1 h-7" onClick={clearShoppingList}>Clear</Button>
        </div>
      </div>

      {shoppingList.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          <p className="text-xs font-semibold">No items yet</p>
          <p className="text-xs">Add meals to start</p>
        </div>
      ) : (
        <div className="space-y-3">
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
            <div key={group} className="space-y-1">
              <h4 className="font-black text-foreground uppercase text-xs flex items-center gap-1 truncate">
                {group}
              </h4>
              {items.map(item => (
                <div key={item.id} className={`flex flex-col gap-1 p-2 rounded border group ${item.checked ? 'bg-green-100 border-green-400' : 'bg-secondary border-border'}`}>
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs font-bold text-foreground block truncate ${item.checked ? 'line-through text-muted-foreground' : ''}`}>{item.name}</span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="font-semibold">x{item.quantity}</span>
                        <span>•</span>
                        <span className="text-xs">Aisle {item.aisle}</span>
                      </div>
                    </div>
                    <span className="font-black text-primary text-xs whitespace-nowrap">{item.price} kr</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {!item.checked && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={async () => {
                          markItemFound(item.id);
                          await recordPurchaseAndRemove(item.id);
                          toast.success(`✓ ${item.name} lagt til budsjettet (${item.price} kr)`);
                        }}
                        title="Mark as found"
                      >
                        <Check className="h-3 w-3 text-green-600 mr-1" />
                        Done
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs ml-auto"
                      onClick={() => removeItemFromList(item.id)}
                      title="Remove"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-primary space-y-3">
        {/* Budget Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-2 rounded border border-blue-200">
          <div className="flex items-center gap-1 mb-2">
            <Wallet className="w-3 h-3 text-blue-600" />
            <span className="text-xs font-bold text-gray-700 uppercase">Budget</span>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Spent</span>
              <span className={`text-sm font-bold ${halfBudgetReached ? 'text-orange-600' : 'text-blue-600'}`}>
                {spentAmount.toFixed(0)} kr
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  budgetPercentage >= 75 ? 'bg-red-500' : 
                  budgetPercentage >= 50 ? 'bg-orange-500' : 
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center text-xs text-gray-600">
              <span>0</span>
              <span className="font-semibold">{budgetPercentage.toFixed(0)}%</span>
              <span>{monthlyBudget}</span>
            </div>

            {halfBudgetReached && (
              <div className="flex items-center gap-1 mt-1 p-1 bg-orange-100 rounded border border-orange-300">
                <AlertTriangle className="w-3 h-3 text-orange-600 flex-shrink-0" />
                <span className="text-xs text-orange-800 font-semibold">
                  Over 50% used
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Total Cost */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-black text-foreground uppercase">Total</span>
          <span className="text-xl font-black text-primary">{totalCost.toFixed(0)} kr</span>
        </div>
        <div className="text-xs text-muted-foreground text-center">
          Found: {getCompletedCount()} / {getTotalCount()}
        </div>
      </div>
    </Card>
  );
};
