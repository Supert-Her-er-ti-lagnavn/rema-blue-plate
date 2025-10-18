"""
Simple test to verify FastAPI can be imported and run
"""

def test_imports():
    try:
        import fastapi
        print("✅ FastAPI imported successfully")
        
        import uvicorn 
        print("✅ Uvicorn imported successfully")
        
        from fastapi import FastAPI
        app = FastAPI()
        print("✅ FastAPI app created successfully")
        
        print("\n🎉 Everything looks good! FastAPI is ready to use.")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("You need to install FastAPI and Uvicorn:")
        print("pip install fastapi uvicorn")
        return False

if __name__ == "__main__":
    test_imports()