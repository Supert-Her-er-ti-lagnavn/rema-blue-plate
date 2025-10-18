from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create FastAPI app
app = FastAPI(
    title="Rema 1000 Meal Planner API",
    description="API for meal planning and shopping functionality",
    version="1.0.0"
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sample meal data
SAMPLE_MEALS = [
    {
        "id": 1,
        "title": "Pasta Alfredo med Kylling",
        "image": "https://www.rema.no/acd-cgi/img/v1/wordpress/wp-content/uploads/2025/10/IMG_3833-1-1920x1080.jpg?width=660",
        "prep_time": 35,
        "servings": 4,
        "total_cost": 95.0,
    },
    {
        "id": 2,
        "title": "Marry Me Chicken",
        "image": "https://www.rema.no/acd-cgi/img/v1/wordpress/wp-content/uploads/2025/03/REMA1000-SP8-9-Merry-me-chicken-B-e1754460393872-1920x1080.jpg?width=660",
        "prep_time": 45,
        "servings": 4,
        "total_cost": 110.0,
    }
]

# API Routes
@app.get("/")
async def root():
    return {"message": "Rema 1000 Meal Planner API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

@app.get("/api/v1/meals/")
async def get_meals():
    return SAMPLE_MEALS

@app.get("/api/v1/meals/{meal_id}")
async def get_meal(meal_id: int):
    for meal in SAMPLE_MEALS:
        if meal["id"] == meal_id:
            return meal
    return {"error": "Meal not found"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)