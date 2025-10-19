"""Service for interacting with the Edamam Recipe API."""

import httpx
from typing import List, Optional
from app.models.recipe import EdamamRecipe
from app.config import settings


class EdamamService:
    """Service for searching recipes using Edamam API."""

    # Valid Edamam health labels (from official API documentation)
    VALID_HEALTH_LABELS = {
        "alcohol-cocktail", "alcohol-free", "celery-free", "crustacean-free",
        "dairy-free", "DASH", "egg-free", "fish-free", "fodmap-free",
        "gluten-free", "immuno-supportive", "keto-friendly", "kidney-friendly",
        "kosher", "low-potassium", "low-sugar", "lupine-free", "Mediterranean",
        "mollusk-free", "mustard-free", "No-oil-added", "paleo", "peanut-free",
        "pescatarian", "pork-free", "red-meat-free", "sesame-free",
        "shellfish-free", "soy-free", "sugar-conscious", "sulfite-free",
        "tree-nut-free", "vegan", "vegetarian", "wheat-free"
    }

    # Valid Edamam diet labels (different from health labels)
    VALID_DIET_LABELS = {
        "balanced", "high-fiber", "high-protein", "low-carb",
        "low-fat", "low-sodium"
    }

    def __init__(self):
        self.base_url = settings.EDAMAM_BASE_URL
        self.app_id = settings.EDAMAM_APP_ID
        self.app_key = settings.EDAMAM_APP_KEY
        self.client = httpx.AsyncClient(timeout=30.0)

    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()

    async def search_recipes(
        self,
        health_labels: Optional[List[str]] = None,
        excluded: Optional[List[str]] = None,
        query: Optional[str] = None,
        cuisine_type: Optional[List[str]] = None,
        meal_type: Optional[List[str]] = None,
        dish_type: Optional[List[str]] = None,
        diet: Optional[List[str]] = None,
        ingr: Optional[str] = None,
        time: Optional[str] = None,
        max_results: int = 30,
    ) -> List[EdamamRecipe]:
        """
        Search for recipes using Edamam API.

        Args:
            health_labels: List of health labels (e.g., ["vegan", "dairy-free"])
            excluded: List of ingredients to exclude
            query: Search query (e.g., "chicken", "pasta", "dinner")
            cuisine_type: List of cuisine types (e.g., ["italian", "asian"])
            meal_type: List of meal types (e.g., ["breakfast", "dinner"])
            dish_type: List of dish types (e.g., ["main course", "dessert"])
            diet: List of diet labels (e.g., ["balanced", "high-protein"])
            ingr: Ingredient count filter (e.g., "5-8", "10+")
            time: Time range in minutes (e.g., "30", "20-40")
            max_results: Maximum number of results to return

        Returns:
            List of EdamamRecipe objects
        """
        # Build params - httpx will handle lists correctly for multiple values
        params = [
            ("type", "public"),
            ("app_id", self.app_id),
            ("app_key", self.app_key),
            ("to", str(max_results)),
        ]

        # Add health labels (filter out invalid ones and diet labels)
        if health_labels:
            for label in health_labels:
                label_lower = label.lower()
                # Check if it's a valid health label
                if label_lower in self.VALID_HEALTH_LABELS or label in self.VALID_HEALTH_LABELS:
                    params.append(("health", label))
                # If it's actually a diet label, add to diet params instead
                elif label_lower in self.VALID_DIET_LABELS or label in self.VALID_DIET_LABELS:
                    params.append(("diet", label))

        # Add diet labels
        if diet:
            for diet_label in diet:
                diet_lower = diet_label.lower()
                if diet_lower in self.VALID_DIET_LABELS or diet_label in self.VALID_DIET_LABELS:
                    params.append(("diet", diet_label))

        # Add search query (required by Edamam for best results)
        params.append(("q", query if query else "recipe"))

        # Add excluded ingredients
        if excluded:
            for ingredient in excluded:
                params.append(("excluded", ingredient))

        # Add cuisine types
        if cuisine_type:
            for cuisine in cuisine_type:
                params.append(("cuisineType", cuisine))

        # Add meal types
        if meal_type:
            for meal in meal_type:
                params.append(("mealType", meal))

        # Add dish types
        if dish_type:
            for dish in dish_type:
                params.append(("dishType", dish))

        # Add ingredient count filter
        if ingr:
            params.append(("ingr", ingr))

        # Add time filter
        if time:
            params.append(("time", time))

        try:
            print(f"[EdamamService] Search params: {params}")
            response = await self.client.get(self.base_url, params=params)
            print(f"[EdamamService] Response status: {response.status_code}")
            response.raise_for_status()

            data = response.json()
            print(f"[EdamamService] Found {len(data.get('hits', []))} recipes")
            recipes = []

            # Parse Edamam response
            for hit in data.get("hits", []):
                recipe_data = hit.get("recipe", {})
                try:
                    recipe = EdamamRecipe(
                        uri=recipe_data.get("uri", ""),
                        label=recipe_data.get("label", ""),
                        image=recipe_data.get("image", ""),
                        source=recipe_data.get("source", ""),
                        url=recipe_data.get("url", ""),
                        yield_servings=recipe_data.get("yield", 4),
                        ingredientLines=recipe_data.get("ingredientLines", []),
                        calories=recipe_data.get("calories", 0),
                        totalTime=recipe_data.get("totalTime", 0),
                        cuisineType=recipe_data.get("cuisineType", []),
                        mealType=recipe_data.get("mealType", []),
                        dishType=recipe_data.get("dishType", []),
                        healthLabels=recipe_data.get("healthLabels", []),
                    )
                    recipes.append(recipe)
                except Exception:
                    continue

            return recipes

        except httpx.HTTPStatusError:
            raise
        except Exception:
            raise


# Global instance
edamam_service = EdamamService()
