import React, { useState, useEffect } from 'react';
import { apiService, PurchasedItem } from '@/services/api';
import { ShoppingContext } from './ShoppingContextInstance';

export interface ShoppingItem {
  id: number;
  name: string;
  quantity: number;
  category: string;
  aisle: number;
  checked: boolean;
  price: number;
  mealId?: number;
  x_position?: number;
  y_position?: number;
}

export interface ShoppingContextType {
  shoppingList: ShoppingItem[];
  addItemsToShoppingList: (items: ShoppingItem[]) => void;
  markItemFound: (itemId: number) => void;
  removeItemFromList: (itemId: number) => void;
  clearShoppingList: () => void;
  getCurrentItem: () => ShoppingItem | null;
  getCompletedCount: () => number;
  getTotalCount: () => number;
  resetShoppingList: () => void;
  recordPurchaseAndRemove: (itemId: number) => Promise<void>;
}





const DEFAULT_SHOPPING_LIST: ShoppingItem[] = [
  { id: 1, name: "Bananer", quantity: 6, category: "Frukt", aisle: 1, checked: false, price: 25.90 },
  { id: 2, name: "Epler Gala", quantity: 4, category: "Frukt", aisle: 1, checked: false, price: 32.50 },
  { id: 3, name: "Salat Iceberg", quantity: 1, category: "Grønnsaker", aisle: 1, checked: false, price: 18.90 },
  { id: 4, name: "Melk Tine 1L", quantity: 2, category: "Meieri", aisle: 2, checked: false, price: 21.90 },
  { id: 5, name: "Gresk Yoghurt", quantity: 1, category: "Meieri", aisle: 2, checked: false, price: 28.50 },
  { id: 6, name: "Ost Norvegia", quantity: 1, category: "Meieri", aisle: 2, checked: false, price: 89.90 },
  { id: 7, name: "Kyllingfilet", quantity: 500, category: "Kjøtt", aisle: 3, checked: false, price: 65.90 },
  { id: 8, name: "Laksfilet", quantity: 300, category: "Fisk", aisle: 3, checked: false, price: 89.90 },
  { id: 9, name: "Grovbrød", quantity: 1, category: "Bakeri", aisle: 4, checked: false, price: 32.90 },
  { id: 10, name: "Frossent Erter", quantity: 1, category: "Fryst", aisle: 5, checked: false, price: 22.90 },
  { id: 11, name: "Pizza Grandiosa", quantity: 2, category: "Fryst", aisle: 5, checked: false, price: 45.90 },
  { id: 12, name: "Ris Basmati", quantity: 1, category: "Tørrvarer", aisle: 6, checked: false, price: 38.90 },
  { id: 13, name: "Pasta Penne", quantity: 2, category: "Tørrvarer", aisle: 6, checked: false, price: 18.90 },
  { id: 14, name: "Appelsinjuice", quantity: 1, category: "Drikke", aisle: 7, checked: false, price: 28.90 },
  { id: 15, name: "Kaffe Friele", quantity: 1, category: "Drikke", aisle: 7, checked: false, price: 89.90 },
  { id: 16, name: "Mandler", quantity: 1, category: "Snacks", aisle: 8, checked: false, price: 45.90 },
  { id: 17, name: "Sjokolade Freia", quantity: 1, category: "Snacks", aisle: 8, checked: false, price: 32.90 },
  { id: 18, name: "Oppvaskmiddel", quantity: 1, category: "Husholdning", aisle: 9, checked: false, price: 38.90 },
  { id: 19, name: "Toalettpapir", quantity: 1, category: "Husholdning", aisle: 9, checked: false, price: 89.90 },
];

export const ShoppingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem('rema-shopping-list');
    return saved ? JSON.parse(saved) : DEFAULT_SHOPPING_LIST;
  });

  useEffect(() => {
    localStorage.setItem('rema-shopping-list', JSON.stringify(shoppingList));
  }, [shoppingList]);

  const addItemsToShoppingList = (items: ShoppingItem[]) => {
    setShoppingList(currentList => {
      const newItems = items.filter(item => 
        !currentList.some(existing => existing.id === item.id)
      );
      return [...currentList, ...newItems].sort((a, b) => a.aisle - b.aisle);
    });
  };

  const markItemFound = (itemId: number) => {
    setShoppingList(currentList => {
      const updatedList = currentList.map(item =>
        item.id === itemId ? { ...item, checked: true } : item
      );
      // Find the item that was marked as found
      const foundItem = currentList.find(item => item.id === itemId);
      if (foundItem) {
        // Get fridge items from localStorage
        const fridgeItems: ShoppingItem[] = JSON.parse(localStorage.getItem('fridgeItems') || '[]');
        // Add to fridge if not already present (by name)
        if (!fridgeItems.some(i => i.name.trim().toLowerCase() === foundItem.name.trim().toLowerCase())) {
          fridgeItems.push({
            ...foundItem,
            checked: false,
          });
          localStorage.setItem('fridgeItems', JSON.stringify(fridgeItems));
        }
      }
      return updatedList;
    });
  };

  const recordPurchaseAndRemove = async (itemId: number) => {
    let purchased: ShoppingItem | undefined;
    setShoppingList(currentList => {
      purchased = currentList.find(i => i.id === itemId);
      return currentList.filter(item => item.id !== itemId);
    });
    if (purchased) {
      const payload: PurchasedItem = {
        id: purchased.id,
        name: purchased.name,
        quantity: purchased.quantity,
        category: purchased.category,
        aisle: purchased.aisle,
        price: purchased.price,
        mealId: purchased.mealId,
      };
      try {
        await apiService.recordPurchase(payload);
      } catch (e) {
        // If backend fails, re-add item to list to avoid data loss
        setShoppingList(current => [purchased as ShoppingItem, ...current]);
        throw e;
      }
    }
  };

  const removeItemFromList = (itemId: number) => {
    setShoppingList(currentList =>
      currentList.filter(item => item.id !== itemId)
    );
  };

  const clearShoppingList = () => {
    setShoppingList([]);
  };

  const getCurrentItem = () => {
    return shoppingList.find(item => !item.checked) || null;
  };

  const getCompletedCount = () => {
    return shoppingList.filter(item => item.checked).length;
  };

  const getTotalCount = () => {
    return shoppingList.length;
  };

  const resetShoppingList = () => {
    setShoppingList(DEFAULT_SHOPPING_LIST.map(item => ({ ...item, checked: false })));
  };

  const value = {
    shoppingList,
    addItemsToShoppingList,
    markItemFound,
    removeItemFromList,
    clearShoppingList,
    getCurrentItem,
    getCompletedCount,
    getTotalCount,
    resetShoppingList,
    recordPurchaseAndRemove,
  };

  return (
    <ShoppingContext.Provider value={value}>
      {children}
    </ShoppingContext.Provider>
  );
};
