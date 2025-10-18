# Rema Blue Plate - Backend API

A FastAPI backend for meal planning with Norwegian Rema 1000 groceries.

## Quick Start

### 1. Install Python Dependencies

```bash
cd backend
py -m pip install -r requirements.txt
```

### 2. Test the Setup

```bash
py test_simple.py
```

### 3. Run the API Server

```bash
py main.py
```

The API will be available at `http://localhost:8000`

## ✅ Ready-to-Use Features

- **No database setup required** - Uses hardcoded Norwegian meal data
- **CORS configured** - Ready for React frontend connection
- **Sample meal data** - Pasta Alfredo, Marry Me Chicken, Tacosuppe, etc.
- **Interactive docs** - Visit `/docs` for API testing

## API Endpoints

### Core Endpoints

- `GET /` - API status and welcome message
- `GET /health` - Health check endpoint

### Meals (Available Now)

- `GET /api/v1/meals/` - Get all Norwegian meals with prices
- `GET /api/v1/meals/{meal_id}` - Get specific meal details

### Future Endpoints (Ready to implement)

- Shopping list management
- User authentication
- Meal search and filtering

## 🚀 Testing the API

### Interactive Documentation

Visit `http://localhost:8000/docs` for Swagger UI

### Quick Test URLs

- `http://localhost:8000/` - Welcome message
- `http://localhost:8000/health` - Health check
- `http://localhost:8000/api/v1/meals/` - All meals
- `http://localhost:8000/api/v1/meals/1` - Pasta Alfredo details

## 📋 Current Status

- ✅ FastAPI server with hot reload
- ✅ CORS configured for React frontend
- ✅ Norwegian meal data with Rema 1000 images
- ✅ Clean, minimal setup - no database required
- ✅ Working with Python 3.11 using `py` command

## 🎯 Perfect for Hackathons

- **Zero database setup** - Just run and go!
- **Sample data included** - Real Norwegian meals
- **Frontend ready** - CORS configured for localhost:5173
- **Extensible** - Easy to add features as needed

## 💡 Troubleshooting

If you get "failed to locate pyvenv.cfg" error, use `py` instead of `python`:

- ✅ `py main.py`
- ❌ `python main.py`
