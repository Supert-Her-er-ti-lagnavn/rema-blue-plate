# Rema Blue Plate - Backend API

A FastAPI backend for meal planning with Norwegian Rema 1000 groceries.

## 🚀 Quick Start

### 1. Create Virtual Environment

From the **project root** directory:

```bash
# Create virtual environment
py -m venv venv

# Activate virtual environment
venv\Scripts\Activate
```

You should see `(venv)` in your terminal prompt when activated.

### 2. Install Dependencies

```bash
# Make sure venv is activated first!
pip install fastapi uvicorn[standard]
```

Or install from requirements file:

```bash
cd backend
pip install -r requirements.txt
```

### 3. Test the Setup

```bash
# From backend directory with venv activated
python test_simple.py
```

### 4. Start the Backend Server

```bash
# From backend directory with venv activated
python main.py
```

The API will be available at `http://localhost:8000`

## ⚠️ Important Notes

- **Always activate the virtual environment first**: `venv\Scripts\Activate`
- **Use `python` (not `py`) when venv is activated**
- **Deactivate with**: `deactivate`

## ✅ Ready-to-Use Features

- **Virtual environment isolated** - Clean dependencies
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

### Virtual Environment Issues

- **"failed to locate pyvenv.cfg"**: Make sure virtual environment is activated
- **Import errors**: Activate venv first, then install dependencies
- **Wrong Python**: Use `python` (not `py`) when venv is activated

### Quick Fix Commands

```bash
# If you get errors, try this sequence:
cd ..                          # Go to project root
venv\Scripts\Activate          # Activate venv
cd backend                     # Go to backend
python test_simple.py          # Test setup
python main.py                 # Start server
```

### Alternative (Global Install)

If virtual environment causes issues, you can use global install:

```bash
py -m pip install fastapi uvicorn[standard]
py main.py
```

## 🎯 Development Workflow

1. **Activate venv**: `venv\Scripts\Activate` (from project root)
2. **Go to backend**: `cd backend`
3. **Start server**: `python main.py`
4. **Test in browser**: http://localhost:8000
5. **Stop server**: `Ctrl+C`
6. **Deactivate**: `deactivate`
