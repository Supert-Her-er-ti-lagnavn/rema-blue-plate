// API service for connecting React frontend to FastAPI backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

class ApiService {
  private async fetchApi(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Meals API
  async getMeals(): Promise<Meal[]> {
    return this.fetchApi('/meals/');
  }

  async getMeal(mealId: number): Promise<Meal> {
    return this.fetchApi(`/meals/${mealId}`);
  }

  async searchMeals(query: string): Promise<Meal[]> {
    return this.fetchApi(`/meals/search/${encodeURIComponent(query)}`);
  }

  async createMeal(meal: Omit<Meal, 'id' | 'created_at' | 'updated_at'>): Promise<Meal> {
    return this.fetchApi('/meals/', {
      method: 'POST',
      body: JSON.stringify(meal),
    });
  }

  // Shopping API
  async getShoppingList(): Promise<ShoppingList> {
    return this.fetchApi('/shopping/list');
  }

  async markItemComplete(itemId: number): Promise<{ message: string; next_item_index: number; completed_count: number }> {
    return this.fetchApi(`/shopping/items/${itemId}/complete`, {
      method: 'POST',
    });
  }

  async getShoppingProgress(): Promise<{ total_items: number; completed_items: number; current_item_index: number; progress_percentage: number }> {
    return this.fetchApi('/shopping/progress');
  }

  async resetShoppingList(): Promise<{ message: string }> {
    return this.fetchApi('/shopping/reset', {
      method: 'POST',
    });
  }

  async getStoreNavigation(): Promise<{ current_location: string; available_directions: string[]; nearby_sections: string[]; estimated_shopping_time: string; items_remaining: number }> {
    return this.fetchApi('/shopping/navigation');
  }

  async getFindMyIngredient(): Promise<FindMyIngredientResponse> {
    return this.fetchApi('/shopping/find-my-ingredient');
  }

  async updateUserPosition(position: { x: number; y: number }): Promise<{ message: string; current_position: { x: number; y: number } }> {
    return this.fetchApi('/shopping/update-position', {
      method: 'POST',
      body: JSON.stringify(position),
    });
  }

  // Purchases API
  async recordPurchase(item: PurchasedItem): Promise<{ message: string; count_this_month: number }> {
    return this.fetchApi('/shopping/purchases', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async getCurrentMonthPurchases(): Promise<{ items: PurchasedItem[]; total_spent: number }> {
    return this.fetchApi('/shopping/purchases/current-month');
  }

  // Users API
  async getCurrentUser(): Promise<User> {
    return this.fetchApi('/users/me');
  }

  async registerUser(userData: UserRegistration): Promise<{ message: string; user_id: number }> {
    return this.fetchApi('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async loginUser(credentials: UserCredentials): Promise<LoginResponse> {
    return this.fetchApi('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Health check
  async healthCheck(): Promise<HealthStatus> {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'unhealthy' };
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export types for TypeScript
export interface Meal {
  id: number;
  title: string;
  image: string;
  prep_time: number;
  servings: number;
  total_cost: number;
  ingredients: Ingredient[];
  created_at: string;
  updated_at: string;
}

export interface Ingredient {
  id: number;
  meal_id: number;
  name: string;
  amount: string;
  price: number;
}

export interface ShoppingListItem {
  id: number;
  ingredient_name: string;
  amount: string;
  price: number;
  is_collected: boolean;
  meal_source?: string;
}

export interface ShoppingList {
  id: number;
  user_id: number;
  items: ShoppingListItem[];
  total_cost: number;
  total_items: number;
}

export interface User {
  id: number;
  email: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
}

// Additional interfaces
export interface UserRegistration {
  email: string;
  password: string;
  full_name?: string;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp?: string;
}

export interface StoreNavigation {
  current_location: string;
  available_directions: string[];
  nearby_sections: string[];
  estimated_shopping_time: string;
  items_remaining: number;
}

export interface FindMyIngredientItem extends ShoppingListItem {
  x_position: number;
  y_position: number;
}

export interface FindMyIngredientResponse {
  current_item: FindMyIngredientItem | null;
  direction_angle: number;
  distance: number;
  current_location: { x: number; y: number };
  target_location: { x: number; y: number };
  items: FindMyIngredientItem[];
  completed_items: number;
  total_items: number;
  progress_percentage: number;
}

export interface PurchasedItem {
  id: number;
  name: string;
  quantity: number;
  category: string;
  aisle: number;
  price: number;
  mealId?: number;
  purchased_at?: string;
}