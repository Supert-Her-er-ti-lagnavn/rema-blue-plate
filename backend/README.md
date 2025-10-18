# Rema 1000 Meal Planner API

## Setup Instructions

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Setup MySQL Database

```sql
CREATE DATABASE rema_meal_planner;
CREATE USER 'rema_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON rema_meal_planner.* TO 'rema_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Configure Environment

Copy `.env.example` to `.env` and update with your database credentials:

```
DATABASE_URL=mysql+pymysql://rema_user:password@localhost:3306/rema_meal_planner
```

### 4. Run the API Server

```bash
cd backend
python main.py
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Meals

- `GET /api/v1/meals/` - Get all meals
- `GET /api/v1/meals/{meal_id}` - Get specific meal
- `GET /api/v1/meals/search/{query}` - Search meals
- `POST /api/v1/meals/` - Create new meal

### Shopping

- `GET /api/v1/shopping/list` - Get shopping list
- `POST /api/v1/shopping/list/add` - Add item to shopping list
- `POST /api/v1/shopping/list/add-meal` - Add meal ingredients to shopping list
- `PUT /api/v1/shopping/list/item/{item_id}` - Update shopping item
- `DELETE /api/v1/shopping/list/item/{item_id}` - Remove shopping item
- `DELETE /api/v1/shopping/list/clear` - Clear shopping list
- `GET /api/v1/shopping/navigation` - Get store navigation

### Users

- `GET /api/v1/users/me` - Get current user
- `POST /api/v1/users/register` - Register new user
- `POST /api/v1/users/login` - Login user

## API Documentation

Visit `http://localhost:8000/docs` for interactive API documentation.

## Current Status

- ✅ Basic FastAPI setup with CORS
- ✅ Hardcoded Norwegian meal data
- ✅ Shopping list functionality
- ✅ Basic user authentication endpoints
- ✅ SQLAlchemy models for future database integration
- 🔄 Using JSON hardcoded data (ready for MySQL migration)

## Next Steps

1. Install and configure MySQL
2. Run database migrations
3. Replace hardcoded data with database queries
4. Add proper authentication with JWT tokens
5. Add input validation and error handling
