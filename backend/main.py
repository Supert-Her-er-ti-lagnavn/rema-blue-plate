"""FastAPI application entry point."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import users, recipes, agent
from app.api import shopping
from app.config import settings


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    # Startup
    try:
        settings.validate()
        print("✓ Configuration validated successfully")
    except ValueError as e:
        print(f"✗ Configuration error: {e}")
        print("Please check your .env file and database setup")

    yield

    # Shutdown (if needed in future)
    pass


# Create FastAPI app
app = FastAPI(
    title="Rema Blue Plate API",
    description="AI-powered meal planning with recipe search and dietary filtering",
    version="0.1.0",
    lifespan=lifespan,
)

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this for production with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(recipes.router, prefix="/api/recipes", tags=["recipes"])
app.include_router(agent.router, prefix="/api/agent", tags=["agent"])
app.include_router(shopping.router, prefix="/api/shopping", tags=["shopping"])


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "Rema Blue Plate API",
        "version": "0.1.0",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
