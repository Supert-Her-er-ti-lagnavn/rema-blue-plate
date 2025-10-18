from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import meals, shopping

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

# Include API routers with dummy data
app.include_router(meals.router, prefix="/api/v1/meals", tags=["meals"])
app.include_router(shopping.router, prefix="/api/v1/shopping", tags=["shopping"])

# API Routes
@app.get("/")
async def root():
    return {"message": "Rema 1000 Meal Planner API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)