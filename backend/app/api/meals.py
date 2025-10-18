from fastapi import APIRouter

router = APIRouter()

# Hardcoded Norwegian meal data for testing
MEALS_DATA = [
    {
        "id": 1,
        "title": "Pasta Alfredo med Kylling",
        "image": "https://www.rema.no/acd-cgi/img/v1/wordpress/wp-content/uploads/2025/10/IMG_3833-1-1920x1080.jpg?width=660",
        "prep_time": 35,
        "servings": 4,
        "total_cost": 95.0,
        "ingredients": [
            {"id": 1, "meal_id": 1, "name": "Kyllingfilet", "amount": "500g", "price": 55.0},
            {"id": 2, "meal_id": 1, "name": "Pasta", "amount": "400g", "price": 15.0},
            {"id": 3, "meal_id": 1, "name": "Fløte", "amount": "3 dl", "price": 18.0},
            {"id": 4, "meal_id": 1, "name": "Parmesan", "amount": "100g", "price": 7.0},
        ],
        "created_at": "2025-10-18T10:00:00Z",
        "updated_at": "2025-10-18T10:00:00Z"
    },
    {
        "id": 2,
        "title": "Marry Me Chicken",
        "image": "https://www.rema.no/acd-cgi/img/v1/wordpress/wp-content/uploads/2025/03/REMA1000-SP8-9-Merry-me-chicken-B-e1754460393872-1920x1080.jpg?width=660",
        "prep_time": 45,
        "servings": 4,
        "total_cost": 110.0,
        "ingredients": [
            {"id": 5, "meal_id": 2, "name": "Kyllingfilet", "amount": "600g", "price": 65.0},
            {"id": 6, "meal_id": 2, "name": "Soltørkede tomater", "amount": "100g", "price": 22.0},
            {"id": 7, "meal_id": 2, "name": "Fløte", "amount": "3 dl", "price": 18.0},
            {"id": 8, "meal_id": 2, "name": "Hvitløk", "amount": "3 fedd", "price": 5.0},
        ],
        "created_at": "2025-10-18T10:00:00Z",
        "updated_at": "2025-10-18T10:00:00Z"
    },
    {
        "id": 3,
        "title": "Tacosuppe",
        "image": "https://www.rema.no/acd-cgi/img/v1/wordpress/wp-content/uploads/2024/10/IMG_1757-1-1920x1080.jpg?width=660",
        "prep_time": 30,
        "servings": 4,
        "total_cost": 85.0,
        "ingredients": [
            {"id": 9, "meal_id": 3, "name": "Kjøttdeig", "amount": "500g", "price": 45.0},
            {"id": 10, "meal_id": 3, "name": "Taco krydder", "amount": "1 pk", "price": 12.0},
            {"id": 11, "meal_id": 3, "name": "Tomater på boks", "amount": "400g", "price": 15.0},
            {"id": 12, "meal_id": 3, "name": "Mais", "amount": "1 boks", "price": 13.0},
        ],
        "created_at": "2025-10-18T10:00:00Z",
        "updated_at": "2025-10-18T10:00:00Z"
    },
    {
        "id": 4,
        "title": "Kylling med Pesto og Ris",
        "image": "https://www.rema.no/acd-cgi/img/v1/wordpress/wp-content/uploads/2025/08/Bilde-3305-1-1920x1080.jpg?width=660",
        "prep_time": 90,
        "servings": 4,
        "total_cost": 105.0,
        "ingredients": [
            {"id": 13, "meal_id": 4, "name": "Kyllinglår", "amount": "800g", "price": 60.0},
            {"id": 14, "meal_id": 4, "name": "Pesto", "amount": "1 glass", "price": 28.0},
            {"id": 15, "meal_id": 4, "name": "Ris", "amount": "300g", "price": 12.0},
            {"id": 16, "meal_id": 4, "name": "Grønnsaker", "amount": "400g", "price": 5.0},
        ],
        "created_at": "2025-10-18T10:00:00Z",
        "updated_at": "2025-10-18T10:00:00Z"
    },
    {
        "id": 5,
        "title": "Kebab i Langpanne",
        "image": "https://www.rema.no/acd-cgi/img/v1/wordpress/wp-content/uploads/2025/08/Bilde-3247-1-1920x1080.jpg?width=660",
        "prep_time": 30,
        "servings": 4,
        "total_cost": 92.0,
        "ingredients": [
            {"id": 17, "meal_id": 5, "name": "Kjøttdeig", "amount": "600g", "price": 54.0},
            {"id": 18, "meal_id": 5, "name": "Kebabkrydder", "amount": "1 pk", "price": 15.0},
            {"id": 19, "meal_id": 5, "name": "Paprika", "amount": "2 stk", "price": 18.0},
            {"id": 20, "meal_id": 5, "name": "Hvitløk", "amount": "3 fedd", "price": 5.0},
        ],
        "created_at": "2025-10-18T10:00:00Z",
        "updated_at": "2025-10-18T10:00:00Z"
    }
]

@router.get("/")
async def get_meals():
    """Get all available meals"""
    return MEALS_DATA

@router.get("/{meal_id}")
async def get_meal(meal_id: int):
    """Get a specific meal by ID"""
    meal = next((meal for meal in MEALS_DATA if meal["id"] == meal_id), None)
    if not meal:
        return {"error": "Meal not found"}
    return meal

@router.get("/search/{query}")
async def search_meals(query: str):
    """Search meals by title or ingredients"""
    query = query.lower()
    filtered_meals = []
    
    for meal in MEALS_DATA:
        # Search in title
        if query in meal["title"].lower():
            filtered_meals.append(meal)
            continue
            
        # Search in ingredients
        for ingredient in meal["ingredients"]:
            if query in ingredient["name"].lower():
                filtered_meals.append(meal)
                break
    
    return filtered_meals

@router.post("/")
async def create_meal(meal: dict):
    """Create a new meal (for future use)"""
    # For now, just return the meal with a new ID
    new_id = max(m["id"] for m in MEALS_DATA) + 1
    new_meal = {**meal, "id": new_id}
    return new_meal