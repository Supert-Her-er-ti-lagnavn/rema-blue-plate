"""Service for interacting with the Edamam Recipe API."""

import httpx
from typing import List, Optional
from app.models.recipe import EdamamRecipe
from app.config import settings


class EdamamService:
    """Service for searching recipes using Edamam API."""

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
        max_results: int = 30,
    ) -> List[EdamamRecipe]:
        """
        Search for recipes using Edamam API.

        Args:
            health_labels: List of health labels (e.g., ["vegan", "dairy-free"])
            excluded: List of ingredients to exclude
            included: List of ingredients to include (if supported by Edamam)
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

        # Add health labels as multiple params
        if health_labels:
            for label in health_labels:
                params.append(("health", label))

        # Add excluded ingredients as multiple params
        if excluded:
            for ingredient in excluded:
                params.append(("excluded", ingredient))

        # Add included ingredients (if provided)
        # Note: Edamam uses 'q' parameter for search query
        if included:
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
