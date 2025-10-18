"""Test script to validate backend functionality."""

import sys
sys.path.insert(0, '/Users/afras/Documents/Programmering/rema-blue-plate/backend')


def test_imports():
    """Test that all modules can be imported."""
    print("Testing imports...")
    try:
        from app.config import settings
        print("  ✓ Config")
        from app.models.user import User, FamilyMember, MergedPreferences
        print("  ✓ User models")
        from app.models.recipe import EdamamRecipe
        print("  ✓ Recipe models")
        from app.models.chat import ChatRequest, ChatResponse
        print("  ✓ Chat models")
        from app.services.user_service import user_service
        print("  ✓ User service")
        from app.services.edamam_service import edamam_service
        print("  ✓ Edamam service")
        from app.services.session_service import session_service
        print("  ✓ Session service")
        from agent.agent import graph, chat_graph
        print("  ✓ Agent graphs")
        from app.api import users, recipes, agent
        print("  ✓ API routers")
        print("✅ All imports successful!\n")
        return True
    except Exception as e:
        print(f"❌ Import error: {e}\n")
        return False


def test_user_service():
    """Test user service functionality."""
    print("Testing user service...")
    try:
        from app.services.user_service import user_service

        # Test get user
        user = user_service.get_user(1)
        assert user is not None, "User 1 not found"
        assert user.name == "Anna Hansen", f"Expected 'Anna Hansen', got '{user.name}'"
        print(f"  ✓ Get user: {user.name}")

        # Test get family
        family = user_service.get_family_members(1)
        assert len(family) == 3, f"Expected 3 family members, got {len(family)}"
        print(f"  ✓ Get family: {[f.name for f in family]}")

        # Test merge preferences
        merged = user_service.merge_preferences([1, 2])
        assert len(merged.diet_labels) > 0, "No diet labels merged"
        assert len(merged.excluded_ingredients) > 0, "No excluded ingredients merged"
        print(f"  ✓ Merge preferences: {merged.diet_labels}")

        # Test fridge
        fridge = user_service.get_fridge(1)
        assert isinstance(fridge, list), "Fridge should be a list"
        print(f"  ✓ Get fridge: {fridge}")

        print("✅ User service tests passed!\n")
        return True
    except Exception as e:
        print(f"❌ User service error: {e}\n")
        import traceback
        traceback.print_exc()
        return False


def test_session_service():
    """Test session service functionality."""
    print("Testing session service...")
    try:
        from app.services.session_service import session_service
        from app.models.recipe import EdamamRecipe
        from app.models.user import MergedPreferences

        # Create mock data
        mock_recipe = EdamamRecipe(
            uri="test_uri",
            label="Test Recipe",
            image="https://example.com/image.jpg",
            source="Test Source",
            url="https://example.com",
            ingredientLines=["ingredient 1", "ingredient 2"],
            calories=500.0,
            totalTime=30.0,
            cuisineType=["Italian"],
            mealType=["Lunch"],
            dishType=["Main course"],
            healthLabels=["vegan"],
        )

        mock_prefs = MergedPreferences(
            user_ids=[1, 2],
            diet_labels=["vegan"],
            excluded_ingredients=["garlic"],
            fridge_items=[],
        )

        # Test create session
        session_id = session_service.create_session(
            user_ids=[1, 2],
            merged_preferences=mock_prefs,
            all_recipes=[mock_recipe],
            selected_recipes=[mock_recipe],
        )
        assert session_id is not None, "Session ID is None"
        print(f"  ✓ Create session: {session_id}")

        # Test get session
        session = session_service.get_session(session_id)
        assert session is not None, "Session not found"
        assert len(session.all_recipes) == 1, "Recipe count mismatch"
        print(f"  ✓ Get session: {len(session.all_recipes)} recipes")

        # Test session exists
        exists = session_service.session_exists(session_id)
        assert exists is True, "Session should exist"
        print(f"  ✓ Session exists check")

        print("✅ Session service tests passed!\n")
        return True
    except Exception as e:
        print(f"❌ Session service error: {e}\n")
        import traceback
        traceback.print_exc()
        return False


def test_agent_graphs():
    """Test that agent graphs compile successfully."""
    print("Testing agent graphs...")
    try:
        from agent.agent import graph, chat_graph

        assert graph is not None, "Main graph is None"
        print("  ✓ Main recipe selection graph compiled")

        assert chat_graph is not None, "Chat graph is None"
        print("  ✓ Chat refinement graph compiled")

        print("✅ Agent graphs tests passed!\n")
        return True
    except Exception as e:
        print(f"❌ Agent graphs error: {e}\n")
        import traceback
        traceback.print_exc()
        return False


def test_config():
    """Test configuration."""
    print("Testing configuration...")
    try:
        from app.config import settings

        print(f"  ℹ️  Edamam App ID: {'SET' if settings.EDAMAM_APP_ID else 'NOT SET'}")
        print(f"  ℹ️  Edamam App Key: {'SET' if settings.EDAMAM_APP_KEY else 'NOT SET'}")
        print(f"  ℹ️  OpenAI API Key: {'SET' if settings.OPENAI_API_KEY else 'NOT SET'}")
        print(f"  ℹ️  Users DB Path: {settings.USERS_DB_PATH}")
        print(f"  ℹ️  Max recipes fetch: {settings.MAX_RECIPES_FETCH}")

        if not settings.EDAMAM_APP_ID or not settings.EDAMAM_APP_KEY:
            print("  ⚠️  Warning: Edamam API credentials not set in .env")
        if not settings.OPENAI_API_KEY:
            print("  ⚠️  Warning: OpenAI API key not set in .env")

        print("✅ Configuration loaded!\n")
        return True
    except Exception as e:
        print(f"❌ Configuration error: {e}\n")
        return False


def main():
    """Run all tests."""
    print("\n" + "="*60)
    print("REMA BLUE PLATE BACKEND TEST SUITE")
    print("="*60 + "\n")

    results = []

    results.append(("Configuration", test_config()))
    results.append(("Imports", test_imports()))
    results.append(("User Service", test_user_service()))
    results.append(("Session Service", test_session_service()))
    results.append(("Agent Graphs", test_agent_graphs()))

    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)

    for name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{name:.<30} {status}")

    all_passed = all(result[1] for result in results)

    print("\n" + "="*60)
    if all_passed:
        print("🎉 ALL TESTS PASSED!")
        print("\nNext steps:")
        print("1. Add your API keys to .env file")
        print("2. Run: uv run python main.py")
        print("3. Visit: http://localhost:8000/docs")
    else:
        print("❌ SOME TESTS FAILED - Please review errors above")
    print("="*60 + "\n")

    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())
