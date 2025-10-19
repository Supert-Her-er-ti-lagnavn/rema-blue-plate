"""Service for managing shopping lists."""

from datetime import datetime
from typing import Dict, List, Optional
from collections import defaultdict

from app.models.shopping import (
    ShoppingListResponse,
    CombinedShoppingItem,
    RecipeSummary,
    RecipeSource,
)
from app.models.recipe import EdamamRecipe
from app.services.session_service import session_service
from app.services.ingredient_parser import ingredient_parser


class ShoppingList:
    """Shopping list for a user."""

    def __init__(self, user_id: int):
        self.user_id = user_id
        self.recipes: Dict[str, dict] = {}  # recipe_uri -> {recipe_data, count, date_added}
        self.manual_items: List[CombinedShoppingItem] = []
        self.checked_items: set = set()  # Set of item names that are checked


class ShoppingService:
    """Service for shopping list operations."""

    def __init__(self):
        # Shopping lists are now loaded from user database
        pass

    def _load_from_user(self, user_id: int) -> ShoppingList:
        """Load shopping list from user database."""
        from app.services.user_service import user_service
        from app.models.recipe import EdamamRecipe

        user = user_service.get_user(user_id)
        if not user:
            raise ValueError("User not found")

        shopping_list = ShoppingList(user_id)

        # Load shopping list data from user
        sl_data = user.shopping_list if user.shopping_list else {}

        # Load recipes
        for recipe_entry in sl_data.get("recipes", []):
            recipe_uri = recipe_entry["recipe_uri"]
            # Reconstruct EdamamRecipe from stored data
            recipe = EdamamRecipe(**recipe_entry["recipe_data"])
            shopping_list.recipes[recipe_uri] = {
                "recipe": recipe,
                "count": recipe_entry.get("count", 1),
                "date_added": recipe_entry.get("date_added", datetime.now().isoformat()),
            }

        # Load manual items
        for item_data in sl_data.get("manual_items", []):
            shopping_list.manual_items.append(CombinedShoppingItem(**item_data))

        # Load checked items
        shopping_list.checked_items = set(sl_data.get("checked_items", []))

        # Load removed items (for individual item removal from recipes)
        shopping_list.removed_items = set(sl_data.get("removed_items", []))

        return shopping_list

    def _save_to_user(self, user_id: int, shopping_list: ShoppingList):
        """Save shopping list to user database."""
        from app.services.user_service import user_service

        user = user_service.get_user(user_id)
        if not user:
            raise ValueError("User not found")

        # Convert to serializable format
        user.shopping_list = {
            "recipes": [
                {
                    "recipe_uri": uri,
                    "recipe_data": data["recipe"].model_dump(mode='json'),
                    "count": data["count"],
                    "date_added": data["date_added"]
                }
                for uri, data in shopping_list.recipes.items()
            ],
            "manual_items": [item.model_dump(mode='json') for item in shopping_list.manual_items],
            "checked_items": list(shopping_list.checked_items),
            "removed_items": list(getattr(shopping_list, 'removed_items', set())),
        }

        user_service.save_users()

    def _get_or_create_list(self, user_id: int) -> ShoppingList:
        """Get or create shopping list for user."""
        return self._load_from_user(user_id)

    def add_recipe(
        self, user_id: int, recipe_uri: str, session_id: str
    ) -> ShoppingListResponse:
        """Add a recipe to the shopping list."""
        shopping_list = self._get_or_create_list(user_id)

        # Get recipe from session
        session = session_service.get_session(session_id)
        if not session:
            raise ValueError("Session not found")

        # Find recipe in session
        recipe = None
        for r in session.all_recipes:
            if r.uri == recipe_uri:
                recipe = r
                break

        if not recipe:
            raise ValueError("Recipe not found in session")

        # Add or increment recipe count
        if recipe_uri in shopping_list.recipes:
            shopping_list.recipes[recipe_uri]["count"] += 1
        else:
            shopping_list.recipes[recipe_uri] = {
                "recipe": recipe,
                "count": 1,
                "date_added": datetime.now().isoformat(),
            }

        self._save_to_user(user_id, shopping_list)
        return self.get_shopping_list(user_id)

    def remove_recipe(self, user_id: int, recipe_uri: str) -> ShoppingListResponse:
        """Remove a recipe from the shopping list."""
        shopping_list = self._get_or_create_list(user_id)

        if recipe_uri in shopping_list.recipes:
            del shopping_list.recipes[recipe_uri]

        self._save_to_user(user_id, shopping_list)
        return self.get_shopping_list(user_id)

    def toggle_item_checked(
        self, user_id: int, item_name: str, checked: bool
    ) -> ShoppingListResponse:
        """Toggle item checked status."""
        shopping_list = self._get_or_create_list(user_id)

        if checked:
            shopping_list.checked_items.add(item_name)
        else:
            shopping_list.checked_items.discard(item_name)

        self._save_to_user(user_id, shopping_list)
        return self.get_shopping_list(user_id)

    def add_manual_item(
        self, user_id: int, item_name: str, quantity: float, unit: str
    ) -> ShoppingListResponse:
        """Add a manual item to the shopping list."""
        shopping_list = self._get_or_create_list(user_id)

        # Create manual item
        manual_item = CombinedShoppingItem(
            name=item_name,
            total_quantity=quantity,
            unit=unit,
            checked=False,
            price_per_unit=0.0,
            total_price=0.0,
            sources=[],
        )

        shopping_list.manual_items.append(manual_item)

        self._save_to_user(user_id, shopping_list)
        return self.get_shopping_list(user_id)

    def delete_item(self, user_id: int, item_name: str) -> ShoppingListResponse:
        """Delete an item from the shopping list."""
        shopping_list = self._get_or_create_list(user_id)

        # Remove from manual items
        shopping_list.manual_items = [
            item for item in shopping_list.manual_items if item.name != item_name
        ]

        # Remove from checked items
        shopping_list.checked_items.discard(item_name)

        # Add to removed items set (allows removing individual recipe items)
        if not hasattr(shopping_list, 'removed_items'):
            shopping_list.removed_items = set()
        shopping_list.removed_items.add(item_name.lower())

        self._save_to_user(user_id, shopping_list)
        return self.get_shopping_list(user_id)

    def clear_shopping_list(self, user_id: int) -> ShoppingListResponse:
        """Clear the shopping list."""
        shopping_list = self._get_or_create_list(user_id)
        shopping_list.recipes = {}
        shopping_list.manual_items = []
        shopping_list.checked_items = set()

        self._save_to_user(user_id, shopping_list)
        return self.get_shopping_list(user_id)

    def move_to_fridge(self, user_id: int) -> dict:
        """Move checked items to fridge (to be implemented with user service)."""
        shopping_list = self._get_or_create_list(user_id)

        # Get checked items
        checked_items = []
        all_items = self._combine_items(shopping_list)

        for item in all_items:
            if item.checked:
                checked_items.append(f"{item.total_quantity} {item.unit} {item.name}")

        # Remove checked items from manual items
        shopping_list.manual_items = [
            item for item in shopping_list.manual_items if item.name not in shopping_list.checked_items
        ]

        # Clear checked items
        shopping_list.checked_items = set()

        return {
            "moved_count": len(checked_items),
            "items": checked_items,
        }

    def _combine_items(self, shopping_list: ShoppingList) -> List[CombinedShoppingItem]:
        """Combine ingredients from all recipes."""
        # Dictionary to accumulate ingredients: item_name -> CombinedShoppingItem
        combined: Dict[str, CombinedShoppingItem] = {}

        # Get set of removed items
        removed_items = getattr(shopping_list, 'removed_items', set())

        # Process recipes
        for recipe_uri, recipe_data in shopping_list.recipes.items():
            recipe: EdamamRecipe = recipe_data["recipe"]
            count: int = recipe_data["count"]

            # Parse each ingredient
            for ingredient_line in recipe.ingredientLines:
                parsed = ingredient_parser.parse_ingredient(ingredient_line)
                if not parsed:
                    continue

                name = parsed["name"].lower()

                # Skip items that were manually removed
                if name in removed_items:
                    continue

                # Check if we already have this ingredient
                if name in combined:
                    # Add to existing
                    combined[name].total_quantity += parsed["quantity"] * count
                    combined[name].sources.append(
                        RecipeSource(
                            recipe_name=recipe.label,
                            quantity=parsed["quantity"],
                            count=count,
                        )
                    )
                else:
                    # Create new
                    combined[name] = CombinedShoppingItem(
                        name=name,
                        total_quantity=parsed["quantity"] * count,
                        unit=parsed["unit"],
                        checked=name in shopping_list.checked_items,
                        price_per_unit=0.0,  # TODO: Add price lookup
                        total_price=0.0,
                        sources=[
                            RecipeSource(
                                recipe_name=recipe.label,
                                quantity=parsed["quantity"],
                                count=count,
                            )
                        ],
                    )

        # Add manual items
        for manual_item in shopping_list.manual_items:
            name = manual_item.name.lower()
            if name in combined:
                combined[name].total_quantity += manual_item.total_quantity
            else:
                manual_item.checked = name in shopping_list.checked_items
                combined[name] = manual_item

        # Calculate prices (placeholder for now)
        for item in combined.values():
            item.total_price = item.total_quantity * item.price_per_unit

        return list(combined.values())

    def get_shopping_list(self, user_id: int) -> ShoppingListResponse:
        """Get the complete shopping list for a user."""
        shopping_list = self._get_or_create_list(user_id)

        # Combine items
        combined_items = self._combine_items(shopping_list)

        # Calculate total cost
        total_cost = sum(item.total_price for item in combined_items)

        # Create recipe summaries
        recipes = [
            RecipeSummary(
                recipe_uri=recipe_uri,
                recipe_name=data["recipe"].label,
                recipe_image=str(data["recipe"].image),
                count=data["count"],
                date_added=data["date_added"],
            )
            for recipe_uri, data in shopping_list.recipes.items()
        ]

        return ShoppingListResponse(
            combined_items=combined_items,
            total_cost=total_cost,
            total_items=len(combined_items),
            recipes=recipes,
        )


# Global instance
shopping_service = ShoppingService()
