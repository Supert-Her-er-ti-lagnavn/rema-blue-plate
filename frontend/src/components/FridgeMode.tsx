import React, { useState, useEffect } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface FridgeItem {
  id: string;
  name: string;
  amount: string;
  addedDate: string;
}

export const FridgeMode: React.FC = () => {
  const [fridgeItems, setFridgeItems] = useState<FridgeItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('fridgeItems');
    if (stored) {
      setFridgeItems(JSON.parse(stored));
    }
  }, []);

  const saveFridgeItems = (items: FridgeItem[]) => {
    localStorage.setItem('fridgeItems', JSON.stringify(items));
    setFridgeItems(items);
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) {
      toast.error('Please enter an ingredient name');
      return;
    }

    // Use ingredient name as ID
    const newId = newItemName.trim().toLowerCase();

    const newItem: FridgeItem = {
      id: newId,
      name: newItemName.trim(),
      amount: newItemAmount.trim() || '1x',
      addedDate: new Date().toISOString(),
    };

    saveFridgeItems([...fridgeItems, newItem]);
    setNewItemName('');
    setNewItemAmount('');
    toast.success(`Added ${newItem.name} to fridge`);
  };

  const handleRemoveItem = (id: string) => {
    const item = fridgeItems.find(i => i.id === id);
    saveFridgeItems(fridgeItems.filter(i => i.id !== id));
    if (item) {
      toast.success(`Removed ${item.name} from fridge`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 pb-24">
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-foreground mb-2 uppercase tracking-tight">
              🧊 My Fridge
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Track what ingredients you have at home
            </p>
          </div>
        </section>

        <section className="max-w-2xl mx-auto">
          <Card className="p-6 mb-8">
            <h3 className="text-xl font-bold mb-4">Add Ingredient</h3>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Ingredient name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="text"
                placeholder="Amount"
                value={newItemAmount}
                onChange={(e) => setNewItemAmount(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                className="w-32 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button onClick={handleAddItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </Card>

          <div className="space-y-4">
            {fridgeItems.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  Your fridge is empty. Add ingredients you have at home!
                </p>
              </Card>
            ) : (
              fridgeItems.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">{item.amount}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default FridgeMode;
