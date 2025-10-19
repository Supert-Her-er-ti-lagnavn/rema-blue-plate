"""Service for interacting with the Edamam Recipe API."""

import httpx
from typing import List, Optional
from app.models.recipe import EdamamRecipe
from app.config import settings


class EdamamService:
    """Service for searching recipes using Edamam API."""

    # Valid Edamam health labels
    VALID_HEALTH_LABELS = {
        "vegan", "vegetarian", "paleo", "dairy-free", "gluten-free",
        "wheat-free", "egg-free", "peanut-free", "tree-nut-free",
        "soy-free", "fish-free", "shellfish-free", "pork-free",
        "red-meat-free", "crustacean-free", "celery-free",
        "mustard-free", "sesame-free", "lupine-free", "mollusk-free",
        "alcohol-free", "kosher"
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
        included: Optional[List[str]] = None,
        query: Optional[str] = None,
        max_results: int = 30,
    ) -> List[EdamamRecipe]:
        """
        Search for recipes using Edamam API.

        Args:
            health_labels: List of health labels (e.g., ["vegan", "dairy-free"])
            excluded: List of ingredients to exclude
            included: List of ingredients to include (if supported by Edamam)
            query: Search query (e.g., "chicken", "pasta", "dinner")
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

        # Add health labels as multiple params (filter out invalid labels)
        valid_labels_count = 0
        if health_labels:
            for label in health_labels:
                # Only add valid health labels
                if label.lower() in self.VALID_HEALTH_LABELS:
                    params.append(("health", label))
                    valid_labels_count += 1
                else:
                    print(f"Warning: Skipping invalid health label: {label}")

        # If no valid health labels, add a default search query to get general recipes
        if health_labels and valid_labels_count == 0:
            print("Warning: No valid health labels found. Searching for general recipes.")
            params.append(("q", "dinner"))

        # Add search query if provided
        # IMPORTANT: Edamam API often needs a 'q' parameter to return results
        if query:
            params.append(("q", query))
        elif not included:
            # If no query and no included ingredients, use a generic query
            # This helps Edamam return results even with just health labels
            params.append(("q", "recipe"))

        # Add excluded ingredients as multiple params
        if excluded:
            for ingredient in excluded:
                params.append(("excluded", ingredient))

        # Add included ingredients (if provided)
        # Note: Edamam uses 'q' parameter for search query
        if included:
            # If included ingredients provided, use them as the query
            # This overrides the generic "recipe" query
            params.append(("q", " ".join(included)))

        try:
            response = await self.client.get(self.base_url, params=params)
            response.raise_for_status()

            data = response.json()
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
                except Exception as e:
                    print(f"Error parsing recipe: {e}")
                    continue

            return recipes

        except httpx.HTTPStatusError as e:
            print(f"HTTP error from Edamam API: {e.response.status_code}")
            print(f"Response: {e.response.text}")
            raise
        except Exception as e:
            print(f"Error calling Edamam API: {e}")
            raise


# Global instance
edamam_service = EdamamService()
