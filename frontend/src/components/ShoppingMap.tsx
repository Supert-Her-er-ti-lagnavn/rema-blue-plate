import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useShoppingContext } from '@/contexts/useShoppingContext';

interface ShoppingItem {
  id: number;
  name: string;
  quantity: number;
  category: string;
  aisle: number;
  checked: boolean;
  price: number;
}

interface ShoppingListResponse {
  items: ShoppingItem[];
  current_item_index: number;
  total_items: number;
  completed_items: number;
}

// Store layout configuration - Rema 1000 inspired layout
const STORE_LAYOUT = {
  width: 900,
  height: 700,
  aisles: [
    { id: 1, name: 'Frukt & Grønt', x: 100, y: 100, width: 180, height: 80, color: '#22c55e' },
    { id: 2, name: 'Meieri', x: 320, y: 100, width: 180, height: 80, color: '#3b82f6' },
    { id: 3, name: 'Kjøtt & Fisk', x: 540, y: 100, width: 180, height: 80, color: '#dc2626' },
    { id: 4, name: 'Bakeri', x: 100, y: 220, width: 180, height: 80, color: '#f59e0b' },
    { id: 5, name: 'Fryst', x: 320, y: 220, width: 180, height: 80, color: '#06b6d4' },
    { id: 6, name: 'Tørrvarer', x: 540, y: 220, width: 180, height: 80, color: '#8b5cf6' },
    { id: 7, name: 'Drikke', x: 100, y: 340, width: 180, height: 80, color: '#10b981' },
    { id: 8, name: 'Snacks', x: 320, y: 340, width: 180, height: 80, color: '#f97316' },
    { id: 9, name: 'Husholdning', x: 540, y: 340, width: 180, height: 80, color: '#6b7280' },
  ],
  entrance: { x: 80, y: 600 },
  checkout: { x: 750, y: 600 }
};

// Dummy fallback data in case API fails
const FALLBACK_SHOPPING_DATA: ShoppingListResponse = {
  items: [
    { id: 1, name: "Bananer", quantity: 6, category: "Frukt", aisle: 1, checked: false, price: 25.90 },
    { id: 2, name: "Melk Tine 1L", quantity: 2, category: "Meieri", aisle: 2, checked: false, price: 21.90 },
    { id: 3, name: "Kyllingfilet", quantity: 1, category: "Kjøtt", aisle: 3, checked: false, price: 65.90 },
    { id: 4, name: "Grovbrød", quantity: 1, category: "Bakeri", aisle: 4, checked: false, price: 32.90 },
    { id: 5, name: "Pizza Grandiosa", quantity: 1, category: "Fryst", aisle: 5, checked: false, price: 45.90 },
  ],
  current_item_index: 0,
  total_items: 5,
  completed_items: 0
};

const ShoppingMap: React.FC = () => {
  const [completedItems, setCompletedItems] = useState<Set<number>>(new Set());
  const queryClient = useQueryClient();
  const { markItemFound, recordPurchaseAndRemove } = useShoppingContext();

  // Fetch shopping list from API with fallback
  const { data: shoppingData, isLoading, error } = useQuery({
    queryKey: ['shopping-list'],
    queryFn: async (): Promise<ShoppingListResponse> => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/shopping/list`);
        if (!response.ok) {
          throw new Error('Failed to fetch shopping list');
        }
        return response.json();
      } catch (error) {
        console.warn('API failed, using fallback data:', error);
        return FALLBACK_SHOPPING_DATA;
      }
    },
    refetchInterval: 10000, // Refetch every 10 seconds
    retry: 1,
    staleTime: 5000
  });

  // Mutation to mark item as complete
  const markCompleteMutation = useMutation({
    mutationFn: async (itemId: number) => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/shopping/items/${itemId}/complete`, {
          method: 'POST',
        });
        if (!response.ok) {
          throw new Error('Failed to mark item complete');
        }
        return response.json();
      } catch (error) {
        console.warn('API call failed, using local state');
        return { message: 'Marked locally' };
      }
    },
    onSuccess: async (_, itemId) => {
      setCompletedItems(prev => new Set([...prev, itemId]));
      queryClient.invalidateQueries({ queryKey: ['shopping-list'] });
      try {
        // Update fridge and remove from context list while recording purchase
        markItemFound(itemId);
        await recordPurchaseAndRemove(itemId);
      } catch (e) {
        // ignore to keep map flow smooth
      }
    }
  });

  // Reset mutation for testing
  const resetMutation = useMutation({
    mutationFn: async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/shopping/reset`, {
          method: 'POST',
        });
        if (!response.ok) {
          throw new Error('Failed to reset');
        }
        return response.json();
      } catch (error) {
        console.warn('Reset API failed, resetting locally');
        return { message: 'Reset locally' };
      }
    },
    onSuccess: () => {
      setCompletedItems(new Set());
      queryClient.invalidateQueries({ queryKey: ['shopping-list'] });
    }
  });

  const currentData = shoppingData || FALLBACK_SHOPPING_DATA;
  const currentItem = currentData.items[currentData.current_item_index];
  
  const nextItems = currentData.items.slice(
    currentData.current_item_index + 1, 
    currentData.current_item_index + 4
  ).filter(item => !completedItems.has(item.id));

  const getAisleById = (aisleId: number) => {
    return STORE_LAYOUT.aisles.find(aisle => aisle.id === aisleId);
  };

  const currentAisle = currentItem ? getAisleById(currentItem.aisle) : null;
  const totalPrice = currentData.items.reduce((sum, item) => sum + item.price, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading handleliste...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Rema 1000 Butikk</h1>
        <button
          onClick={() => resetMutation.mutate()}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm"
          disabled={resetMutation.isPending}
        >
          Reset Liste
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          ⚠️ API ikke tilgjengelig - bruker dummy data
        </div>
      )}
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Store Map */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Butikklayout</h2>
            <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden">
              <svg 
                width={STORE_LAYOUT.width} 
                height={STORE_LAYOUT.height}
                className="w-full h-auto"
                viewBox={`0 0 ${STORE_LAYOUT.width} ${STORE_LAYOUT.height}`}
              >
                {/* Store background */}
                <rect 
                  width={STORE_LAYOUT.width} 
                  height={STORE_LAYOUT.height} 
                  fill="#f8f9fa" 
                  stroke="#dee2e6" 
                  strokeWidth="3"
                  rx="10"
                />
                
                {/* Aisles */}
                {STORE_LAYOUT.aisles.map((aisle) => (
                  <g key={aisle.id}>
                    <rect
                      x={aisle.x}
                      y={aisle.y}
                      width={aisle.width}
                      height={aisle.height}
                      fill={currentAisle?.id === aisle.id ? aisle.color : '#e5e7eb'}
                      stroke={currentAisle?.id === aisle.id ? '#1f2937' : '#9ca3af'}
                      strokeWidth={currentAisle?.id === aisle.id ? "3" : "2"}
                      rx="8"
                      className="transition-all duration-500"
                      opacity={currentAisle?.id === aisle.id ? "1" : "0.8"}
                    />
                    <text
                      x={aisle.x + aisle.width / 2}
                      y={aisle.y + aisle.height / 2 - 8}
                      textAnchor="middle"
                      className="text-sm font-bold fill-white"
                      style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.5))' }}
                    >
                      {aisle.name}
                    </text>
                    <text
                      x={aisle.x + aisle.width / 2}
                      y={aisle.y + aisle.height / 2 + 8}
                      textAnchor="middle"
                      className="text-xs font-semibold fill-white"
                      style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.5))' }}
                    >
                      Gang {aisle.id}
                    </text>
                  </g>
                ))}
                
                {/* Entrance */}
                <g>
                  <circle
                    cx={STORE_LAYOUT.entrance.x}
                    cy={STORE_LAYOUT.entrance.y}
                    r="25"
                    fill="#22c55e"
                    stroke="#16a34a"
                    strokeWidth="3"
                  />
                  <text
                    x={STORE_LAYOUT.entrance.x}
                    y={STORE_LAYOUT.entrance.y + 5}
                    textAnchor="middle"
                    className="text-sm font-bold fill-white"
                  >
                    INN
                  </text>
                  <text
                    x={STORE_LAYOUT.entrance.x}
                    y={STORE_LAYOUT.entrance.y + 45}
                    textAnchor="middle"
                    className="text-sm font-semibold fill-green-700"
                  >
                    Inngang
                  </text>
                </g>
                
                {/* Checkout */}
                <g>
                  <rect
                    x={STORE_LAYOUT.checkout.x - 35}
                    y={STORE_LAYOUT.checkout.y - 20}
                    width="70"
                    height="40"
                    fill="#f59e0b"
                    stroke="#d97706"
                    strokeWidth="3"
                    rx="8"
                  />
                  <text
                    x={STORE_LAYOUT.checkout.x}
                    y={STORE_LAYOUT.checkout.y + 5}
                    textAnchor="middle"
                    className="text-sm font-bold fill-white"
                  >
                    KASSE
                  </text>
                  <text
                    x={STORE_LAYOUT.checkout.x}
                    y={STORE_LAYOUT.checkout.y + 45}
                    textAnchor="middle"
                    className="text-sm font-semibold fill-amber-700"
                  >
                    Betaling
                  </text>
                </g>

                {/* Current item pulsing indicator */}
                {currentAisle && (
                  <circle
                    cx={currentAisle.x + currentAisle.width / 2}
                    cy={currentAisle.y + currentAisle.height / 2}
                    r="12"
                    fill="#dc2626"
                    className="animate-pulse"
                    style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))' }}
                  />
                )}

                {/* Shopping path line */}
                {currentAisle && (
                  <line
                    x1={STORE_LAYOUT.entrance.x}
                    y1={STORE_LAYOUT.entrance.y}
                    x2={currentAisle.x + currentAisle.width / 2}
                    y2={currentAisle.y + currentAisle.height / 2}
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeDasharray="10,5"
                    className="animate-pulse"
                    opacity="0.7"
                  />
                )}
              </svg>
            </div>
          </div>
        </div>

        {/* Shopping List Panel */}
        <div className="space-y-4">
          {/* Current Item */}
          {currentItem && !completedItems.has(currentItem.id) && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">🎯 Neste vare</h3>
              <div className="space-y-3">
                <div className="text-xl font-bold text-blue-800">{currentItem.name}</div>
                <div className="grid grid-cols-2 gap-2 text-sm text-blue-600">
                  <div>Antall: {currentItem.quantity}</div>
                  <div>Gang {currentItem.aisle}</div>
                  <div>Kategori: {currentItem.category}</div>
                  <div className="font-semibold">kr {currentItem.price.toFixed(2)}</div>
                </div>
                <button
                  onClick={() => markCompleteMutation.mutate(currentItem.id)}
                  disabled={markCompleteMutation.isPending}
                  className="w-full mt-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {markCompleteMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Legger til...
                    </>
                  ) : (
                    <>
                      ✅ Funnet vare
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Upcoming Items */}
          {nextItems && nextItems.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">📋 Kommende varer</h3>
              <div className="space-y-2">
                {nextItems.map((item, index) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{item.name}</div>
                      <div className="text-xs text-gray-500">Gang {item.aisle} • {item.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">×{item.quantity}</div>
                      <div className="text-xs text-gray-600">kr {item.price.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">📊 Fremdrift</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Fullført</span>
                <span className="font-semibold">
                  {currentData.completed_items + completedItems.size} / {currentData.total_items}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500" 
                  style={{ 
                    width: `${((currentData.completed_items + completedItems.size) / currentData.total_items) * 100}%` 
                  }}
                ></div>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span>Total pris</span>
                  <span className="font-bold text-lg">kr {totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Completion Message */}
          {currentData.completed_items + completedItems.size === currentData.total_items && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-900 mb-2">🎉 Gratulerer!</h3>
              <p className="text-green-700">Du har funnet alle varene på listen din!</p>
              <p className="text-sm text-green-600 mt-2">Gå til kassen for å betale.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingMap;