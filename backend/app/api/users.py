from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db

router = APIRouter()

# Hardcoded user data for development
HARDCODED_USERS = [
    {
        "id": 1,
        "email": "user@rema1000.no",
        "full_name": "Test User",
        "is_active": True,
        "created_at": "2025-10-18T10:00:00Z"
    }
]

@router.get("/me")
async def get_current_user():
    """Get current user profile"""
    return HARDCODED_USERS[0]

@router.post("/register")
async def register_user(user_data: dict):
    """Register a new user"""
    # For development, just return success
    return {"message": "User registered successfully", "user_id": 1}

@router.post("/login")
async def login_user(credentials: dict):
    """Login user"""
    # For development, just return a mock token
    return {
        "access_token": "mock_token_12345",
        "token_type": "bearer",
        "user": HARDCODED_USERS[0]
    }