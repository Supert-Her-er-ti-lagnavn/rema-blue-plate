"""Service for parsing ingredient strings using GPT-4."""

import os
import json
from typing import Optional, Dict
from openai import OpenAI


class IngredientParser:
    """Parse ingredient strings into structured data using GPT-4."""

    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    def parse_ingredient(self, ingredient_line: str) -> Optional[Dict]:
        """
        Parse an ingredient line into structured data.

        Returns:
            dict with keys: name, quantity, unit
            or None if parsing fails
        """
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": """You are an ingredient parser. Parse the ingredient line into JSON with these fields:
- name: the ingredient name (lowercase)
- quantity: numeric quantity (use 1.0 if not specified)
- unit: unit of measurement (e.g., "cup", "tbsp", "g", "piece")

Return ONLY valid JSON, no other text.""",
                    },
                    {"role": "user", "content": ingredient_line},
                ],
                temperature=0.3,
            )

            result_text = response.choices[0].message.content.strip()

            # Remove markdown code blocks if present
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.startswith("```"):
                result_text = result_text[3:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]

            result_text = result_text.strip()
            parsed = json.loads(result_text)

            # Validate required fields
            if "name" in parsed and "quantity" in parsed and "unit" in parsed:
                # Ensure quantity is float
                parsed["quantity"] = float(parsed["quantity"])
                return parsed

            return None

        except Exception as e:
            print(f"Error parsing ingredient '{ingredient_line}': {e}")
            # Fallback: return basic parsing
            return {
                "name": ingredient_line.lower(),
                "quantity": 1.0,
                "unit": "item",
            }


# Global instance
ingredient_parser = IngredientParser()
