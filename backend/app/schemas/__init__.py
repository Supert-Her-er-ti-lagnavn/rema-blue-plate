from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class IngredientBase(BaseModel):
    name: str
    amount: str
    price: float

class IngredientCreate(IngredientBase):
    pass

class Ingredient(IngredientBase):
    id: int
    meal_id: int
    
    class Config:
        from_attributes = True

class MealBase(BaseModel):
    title: str
    image: str
    prep_time: int
    servings: int
    total_cost: float

class MealCreate(MealBase):
    ingredients: List[IngredientCreate]

class Meal(MealBase):
    id: int
    ingredients: List[Ingredient] = []
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class ShoppingListItem(BaseModel):
    ingredient_name: str
    amount: str
    price: float
    is_collected: bool = False

class ShoppingList(BaseModel):
    id: int
    user_id: int
    items: List[ShoppingListItem]
    created_at: datetime
    
    class Config:
        from_attributes = True