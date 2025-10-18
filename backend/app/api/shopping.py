from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
import math

router = APIRouter()

class ShoppingItem(BaseModel):
    id: int
    name: str
    quantity: int
    category: str
    aisle: int
    checked: bool = False
    price: float = 0.0
    x_position: float = 0.0  # X coordinate in store (0-900)
    y_position: float = 0.0  # Y coordinate in store (0-700)

class FindMyIngredientResponse(BaseModel):
    current_item: Optional[ShoppingItem]
    direction_angle: float  # Angle in degrees (0 = right, 90 = down, 180 = left, 270 = up)
    distance: float  # Distance to item in meters
    current_location: dict  # User's current position
    target_location: dict  # Item's location
    items: List[ShoppingItem]
    completed_items: int
    total_items: int
    progress_percentage: float

class ShoppingListResponse(BaseModel):
    items: List[ShoppingItem]
    current_item_index: int
    total_items: int
    completed_items: int

# Dummy shopping list data with store coordinates (900x700 store layout)
DUMMY_SHOPPING_LIST = [
    ShoppingItem(id=1, name="Bananer", quantity=6, category="Frukt", aisle=1, price=25.90, x_position=150, y_position=150),
    ShoppingItem(id=2, name="Epler Gala", quantity=4, category="Frukt", aisle=1, price=32.50, x_position=150, y_position=200),
    ShoppingItem(id=3, name="Salat Iceberg", quantity=1, category="Grønnsaker", aisle=1, price=18.90, x_position=150, y_position=250),
    ShoppingItem(id=4, name="Melk Tine 1L", quantity=2, category="Meieri", aisle=2, price=21.90, x_position=250, y_position=150),
    ShoppingItem(id=5, name="Gresk Yoghurt", quantity=1, category="Meieri", aisle=2, price=28.50, x_position=250, y_position=200),
    ShoppingItem(id=6, name="Ost Norvegia", quantity=1, category="Meieri", aisle=2, price=89.90, x_position=250, y_position=250),
    ShoppingItem(id=7, name="Kyllingfilet", quantity=500, category="Kjøtt", aisle=3, price=65.90, x_position=350, y_position=150),
    ShoppingItem(id=8, name="Laksfilet", quantity=300, category="Fisk", aisle=3, price=89.90, x_position=350, y_position=200),
    ShoppingItem(id=9, name="Grovbrød", quantity=1, category="Bakeri", aisle=4, price=32.90, x_position=450, y_position=150),
    ShoppingItem(id=10, name="Frossent Erter", quantity=1, category="Fryst", aisle=5, price=22.90, x_position=550, y_position=150),
    ShoppingItem(id=11, name="Pizza Grandiosa", quantity=2, category="Fryst", aisle=5, price=45.90, x_position=550, y_position=200),
    ShoppingItem(id=12, name="Ris Basmati", quantity=1, category="Tørrvarer", aisle=6, price=38.90, x_position=650, y_position=150),
    ShoppingItem(id=13, name="Pasta Penne", quantity=2, category="Tørrvarer", aisle=6, price=18.90, x_position=650, y_position=200),
    ShoppingItem(id=14, name="Appelsinjuice", quantity=1, category="Drikke", aisle=7, price=28.90, x_position=750, y_position=150),
    ShoppingItem(id=15, name="Kaffe Friele", quantity=1, category="Drikke", aisle=7, price=89.90, x_position=750, y_position=200),
    ShoppingItem(id=16, name="Mandler", quantity=1, category="Snacks", aisle=8, price=45.90, x_position=150, y_position=450),
    ShoppingItem(id=17, name="Sjokolade Freia", quantity=1, category="Snacks", aisle=8, price=32.90, x_position=250, y_position=450),
    ShoppingItem(id=18, name="Oppvaskmiddel", quantity=1, category="Husholdning", aisle=9, price=38.90, x_position=350, y_position=450),
    ShoppingItem(id=19, name="Toalettpapir", quantity=1, category="Husholdning", aisle=9, price=89.90, x_position=450, y_position=450),
]

# User's current position in the store (entrance by default)
current_user_position = {"x": 450, "y": 600}  # Near entrance

# Global state for demo - in production this would be in a database
current_item_index = 0
completed_items = set()

@router.get("/list", response_model=ShoppingListResponse)
async def get_shopping_list():
    """Get the current shopping list with next item to find"""
    global current_item_index, completed_items
    
    return ShoppingListResponse(
        items=DUMMY_SHOPPING_LIST,
        current_item_index=current_item_index,
        total_items=len(DUMMY_SHOPPING_LIST),
        completed_items=len(completed_items)
    )

@router.post("/items/{item_id}/complete")
async def mark_item_complete(item_id: int):
    """Mark an item as completed and move to next item"""
    global current_item_index, completed_items
    
    # Find the item in the list
    item_index = None
    for i, item in enumerate(DUMMY_SHOPPING_LIST):
        if item.id == item_id:
            item_index = i
            break
    
    if item_index is None:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Mark as completed
    completed_items.add(item_id)
    
    # Move to next item if this was the current item
    if item_index == current_item_index and current_item_index < len(DUMMY_SHOPPING_LIST) - 1:
        current_item_index += 1
    
    return {
        "message": "Item marked as complete", 
        "next_item_index": current_item_index,
        "completed_count": len(completed_items)
    }

@router.get("/progress")
async def get_shopping_progress():
    """Get current shopping progress"""
    global current_item_index, completed_items
    
    total_items = len(DUMMY_SHOPPING_LIST)
    completed_count = len(completed_items)
    
    return {
        "total_items": total_items,
        "completed_items": completed_count,
        "current_item_index": current_item_index,
        "progress_percentage": (completed_count / total_items) * 100 if total_items > 0 else 0
    }

@router.post("/reset")
async def reset_shopping_list():
    """Reset the shopping list progress - for testing"""
    global current_item_index, completed_items
    
    current_item_index = 0
    completed_items.clear()
    
    return {"message": "Shopping list reset successfully"}

@router.get("/find-my-ingredient", response_model=FindMyIngredientResponse)
async def find_my_ingredient():
    """Get Find My Ingredient data - like Find My AirPods but for shopping items"""
    import math
    global current_item_index, completed_items, current_user_position
    
    # Get current item to find
    current_item = None
    if current_item_index < len(DUMMY_SHOPPING_LIST):
        current_item = DUMMY_SHOPPING_LIST[current_item_index]
        
        # Skip completed items
        while current_item and current_item.id in completed_items:
            current_item_index += 1
            if current_item_index < len(DUMMY_SHOPPING_LIST):
                current_item = DUMMY_SHOPPING_LIST[current_item_index]
            else:
                current_item = None
                break
    
    if not current_item:
        # Shopping complete!
        return FindMyIngredientResponse(
            current_item=None,
            direction_angle=0,
            distance=0,
            current_location=current_user_position,
            target_location={"x": 0, "y": 0},
            items=DUMMY_SHOPPING_LIST,
            completed_items=len(completed_items),
            total_items=len(DUMMY_SHOPPING_LIST),
            progress_percentage=100.0
        )
    
    # Calculate direction and distance to current item
    dx = current_item.x_position - current_user_position["x"]
    dy = current_item.y_position - current_user_position["y"]
    
    # Calculate angle (0 = right, 90 = down, 180 = left, 270 = up)
    angle_rad = math.atan2(dy, dx)
    angle_deg = math.degrees(angle_rad)
    # Normalize to 0-360 range
    if angle_deg < 0:
        angle_deg += 360
    
    # Calculate distance in meters (assuming 1 pixel = 0.5 meters)
    distance_pixels = math.sqrt(dx*dx + dy*dy)
    distance_meters = distance_pixels * 0.5
    
    return FindMyIngredientResponse(
        current_item=current_item,
        direction_angle=angle_deg,
        distance=round(distance_meters, 1),
        current_location=current_user_position,
        target_location={"x": current_item.x_position, "y": current_item.y_position},
        items=DUMMY_SHOPPING_LIST,
        completed_items=len(completed_items),
        total_items=len(DUMMY_SHOPPING_LIST),
        progress_percentage=(len(completed_items) / len(DUMMY_SHOPPING_LIST)) * 100
    )

@router.post("/update-position")
async def update_user_position(position: dict):
    """Update user's current position in the store"""
    global current_user_position
    
    current_user_position["x"] = position.get("x", current_user_position["x"])
    current_user_position["y"] = position.get("y", current_user_position["y"])
    
    return {
        "message": "Position updated", 
        "current_position": current_user_position
    }

@router.get("/navigation")
async def get_store_navigation():
    """Get store navigation data for shopping mode"""
    uncollected_items = len([item for item in DUMMY_SHOPPING_LIST if item.id not in completed_items])
    
    return {
        "current_location": "entrance",
        "available_directions": ["north", "east", "west"],
        "nearby_sections": ["produce", "dairy", "meat"],
        "estimated_shopping_time": f"{uncollected_items * 1.5:.0f} minutes",
        "items_remaining": uncollected_items
    }