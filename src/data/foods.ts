import type { FoodItem } from "@/types";

/**
 * Curated local food library with typical nutrition values per listed serving.
 * This is NOT a live USDA/Open Food Facts integration. Values are approximate
 * reference figures for common whole foods and packaged staples so logging works offline.
 * Users can create custom foods and adjust quantities.
 */
export const FOOD_DATABASE: FoodItem[] = [
  { id: "food-oats", name: "Oats, dry", servingLabel: "40g (about 1/2 cup)", servingGrams: 40, calories: 150, proteinG: 5, carbsG: 27, fatG: 3, tags: ["breakfast", "vegetarian", "vegan"] },
  { id: "food-egg", name: "Egg, whole", servingLabel: "1 large (50g)", servingGrams: 50, calories: 72, proteinG: 6.3, carbsG: 0.4, fatG: 4.8, tags: ["breakfast", "vegetarian"] },
  { id: "food-egg-white", name: "Egg white", servingLabel: "1 large (33g)", servingGrams: 33, calories: 17, proteinG: 3.6, carbsG: 0.2, fatG: 0.1, tags: ["breakfast", "vegetarian"] },
  { id: "food-greek-yogurt", name: "Greek yogurt, plain", servingLabel: "170g", servingGrams: 170, calories: 100, proteinG: 17, carbsG: 6, fatG: 0.7, tags: ["breakfast", "vegetarian"] },
  { id: "food-milk", name: "Milk, 2%", servingLabel: "240ml", servingGrams: 244, calories: 122, proteinG: 8, carbsG: 12, fatG: 4.8, tags: ["drink"] },
  { id: "food-almond-milk", name: "Almond milk, unsweetened", servingLabel: "240ml", servingGrams: 240, calories: 30, proteinG: 1, carbsG: 1, fatG: 2.5, tags: ["drink", "vegan", "lactose_intolerant"] },
  { id: "food-banana", name: "Banana", servingLabel: "1 medium (118g)", servingGrams: 118, calories: 105, proteinG: 1.3, carbsG: 27, fatG: 0.4, tags: ["snack", "vegan"] },
  { id: "food-apple", name: "Apple", servingLabel: "1 medium (182g)", servingGrams: 182, calories: 95, proteinG: 0.5, carbsG: 25, fatG: 0.3, tags: ["snack", "vegan"] },
  { id: "food-berries", name: "Mixed berries", servingLabel: "100g", servingGrams: 100, calories: 57, proteinG: 0.7, carbsG: 14, fatG: 0.3, tags: ["snack", "vegan"] },
  { id: "food-avocado", name: "Avocado", servingLabel: "1/2 fruit (68g)", servingGrams: 68, calories: 114, proteinG: 1.3, carbsG: 6, fatG: 10.5, tags: ["vegan"] },
  { id: "food-spinach", name: "Spinach, raw", servingLabel: "100g", servingGrams: 100, calories: 23, proteinG: 2.9, carbsG: 3.6, fatG: 0.4, tags: ["vegan", "leafy"] },
  { id: "food-kale", name: "Kale, raw", servingLabel: "100g", servingGrams: 100, calories: 35, proteinG: 2.9, carbsG: 4.4, fatG: 1.5, tags: ["vegan", "leafy"] },
  { id: "food-broccoli", name: "Broccoli, cooked", servingLabel: "100g", servingGrams: 100, calories: 35, proteinG: 2.4, carbsG: 7, fatG: 0.4, tags: ["vegan"] },
  { id: "food-tomato", name: "Tomato", servingLabel: "1 medium (123g)", servingGrams: 123, calories: 22, proteinG: 1.1, carbsG: 4.8, fatG: 0.2, tags: ["vegan"] },
  { id: "food-bell-pepper", name: "Bell pepper", servingLabel: "1 medium (119g)", servingGrams: 119, calories: 31, proteinG: 1, carbsG: 6, fatG: 0.3, tags: ["vegan"] },
  { id: "food-asparagus", name: "Asparagus, cooked", servingLabel: "100g", servingGrams: 100, calories: 22, proteinG: 2.4, carbsG: 4.1, fatG: 0.2, tags: ["vegan"] },
  { id: "food-sweet-potato", name: "Sweet potato, baked", servingLabel: "100g", servingGrams: 100, calories: 90, proteinG: 2, carbsG: 21, fatG: 0.2, tags: ["vegan"] },
  { id: "food-quinoa", name: "Quinoa, cooked", servingLabel: "185g (1 cup)", servingGrams: 185, calories: 222, proteinG: 8, carbsG: 39, fatG: 3.6, tags: ["vegan"] },
  { id: "food-brown-rice", name: "Brown rice, cooked", servingLabel: "195g (1 cup)", servingGrams: 195, calories: 216, proteinG: 5, carbsG: 45, fatG: 1.8, tags: ["vegan"] },
  { id: "food-white-rice", name: "White rice, cooked", servingLabel: "158g (1 cup)", servingGrams: 158, calories: 205, proteinG: 4.3, carbsG: 45, fatG: 0.4, tags: ["vegan"] },
  { id: "food-pasta", name: "Pasta, cooked", servingLabel: "140g", servingGrams: 140, calories: 220, proteinG: 8, carbsG: 43, fatG: 1.3, tags: ["vegetarian"] },
  { id: "food-sourdough", name: "Sourdough bread", servingLabel: "1 slice (60g)", servingGrams: 60, calories: 160, proteinG: 5, carbsG: 30, fatG: 1.5, tags: ["vegetarian"] },
  { id: "food-chicken", name: "Chicken breast, cooked", servingLabel: "100g", servingGrams: 100, calories: 165, proteinG: 31, carbsG: 0, fatG: 3.6, tags: ["protein"] },
  { id: "food-salmon", name: "Salmon, cooked", servingLabel: "100g", servingGrams: 100, calories: 208, proteinG: 22, carbsG: 0, fatG: 13, tags: ["protein"] },
  { id: "food-tuna", name: "Tuna, canned in water", servingLabel: "100g", servingGrams: 100, calories: 86, proteinG: 19, carbsG: 0, fatG: 1, tags: ["protein"] },
  { id: "food-tofu", name: "Tofu, firm", servingLabel: "100g", servingGrams: 100, calories: 144, proteinG: 17, carbsG: 3, fatG: 9, tags: ["vegan", "vegetarian", "protein"] },
  { id: "food-lentils", name: "Lentils, cooked", servingLabel: "100g", servingGrams: 100, calories: 116, proteinG: 9, carbsG: 20, fatG: 0.4, tags: ["vegan", "protein"] },
  { id: "food-chickpeas", name: "Chickpeas, cooked", servingLabel: "100g", servingGrams: 100, calories: 164, proteinG: 8.9, carbsG: 27, fatG: 2.6, tags: ["vegan", "protein"] },
  { id: "food-black-beans", name: "Black beans, cooked", servingLabel: "100g", servingGrams: 100, calories: 132, proteinG: 8.9, carbsG: 24, fatG: 0.5, tags: ["vegan"] },
  { id: "food-almonds", name: "Almonds", servingLabel: "28g (about 23 nuts)", servingGrams: 28, calories: 164, proteinG: 6, carbsG: 6, fatG: 14, tags: ["snack", "vegan"] },
  { id: "food-walnut", name: "Walnuts", servingLabel: "28g", servingGrams: 28, calories: 185, proteinG: 4.3, carbsG: 3.9, fatG: 18.5, tags: ["snack", "vegan"] },
  { id: "food-peanut-butter", name: "Peanut butter", servingLabel: "32g (2 tbsp)", servingGrams: 32, calories: 188, proteinG: 8, carbsG: 6, fatG: 16, tags: ["snack", "vegetarian"] },
  { id: "food-cheddar", name: "Cheddar cheese", servingLabel: "28g", servingGrams: 28, calories: 113, proteinG: 7, carbsG: 0.4, fatG: 9, tags: ["vegetarian"] },
  { id: "food-olive-oil", name: "Olive oil", servingLabel: "1 tbsp (14g)", servingGrams: 14, calories: 119, proteinG: 0, carbsG: 0, fatG: 13.5, tags: ["vegan", "fat"] },
  { id: "food-hummus", name: "Hummus", servingLabel: "30g", servingGrams: 30, calories: 50, proteinG: 2, carbsG: 4, fatG: 3, tags: ["vegan", "snack"] },
  { id: "food-protein-powder", name: "Whey protein powder", servingLabel: "30g scoop", servingGrams: 30, calories: 120, proteinG: 24, carbsG: 3, fatG: 1, tags: ["protein"] },
  { id: "food-plant-protein", name: "Plant protein powder", servingLabel: "30g scoop", servingGrams: 30, calories: 110, proteinG: 20, carbsG: 4, fatG: 2, tags: ["vegan", "protein"] },
  { id: "food-granola", name: "Granola", servingLabel: "40g", servingGrams: 40, calories: 180, proteinG: 4, carbsG: 26, fatG: 7, tags: ["breakfast", "vegetarian"] },
  { id: "food-dark-chocolate", name: "Dark chocolate 70%", servingLabel: "30g", servingGrams: 30, calories: 170, proteinG: 2, carbsG: 13, fatG: 12, tags: ["snack", "vegetarian"] },
  { id: "food-salmon-salad", name: "Salmon salad bowl", servingLabel: "1 bowl (350g)", servingGrams: 350, calories: 420, proteinG: 32, carbsG: 28, fatG: 18, tags: ["meal"] },
  { id: "food-veggie-stirfry", name: "Veggie stir-fry with tofu", servingLabel: "1 plate (400g)", servingGrams: 400, calories: 380, proteinG: 22, carbsG: 35, fatG: 16, tags: ["vegan", "meal"] },
  { id: "food-chicken-rice", name: "Chicken and rice bowl", servingLabel: "1 bowl (400g)", servingGrams: 400, calories: 520, proteinG: 40, carbsG: 55, fatG: 12, tags: ["meal"] },
];

export interface CaffeineDrink {
  id: string;
  name: string;
  defaultMl: number;
  caffeineMgPerServing: number;
  servingLabel: string;
  /** When set, the drink is only offered in these app languages. */
  locales?: Array<"en" | "es" | "tr" | "fi">;
  aliases?: string[];
}

export const CAFFEINE_DRINKS: CaffeineDrink[] = [
  { id: "caf-espresso", name: "Espresso", defaultMl: 30, caffeineMgPerServing: 63, servingLabel: "1 shot (30ml)" },
  { id: "caf-latte", name: "Latte", defaultMl: 240, caffeineMgPerServing: 75, servingLabel: "1 cup (240ml)" },
  { id: "caf-cappuccino", name: "Cappuccino", defaultMl: 180, caffeineMgPerServing: 75, servingLabel: "1 cup (180ml)" },
  { id: "caf-cold-brew", name: "Cold brew", defaultMl: 240, caffeineMgPerServing: 200, servingLabel: "240ml" },
  { id: "caf-iced-coffee", name: "Iced coffee", defaultMl: 240, caffeineMgPerServing: 120, servingLabel: "240ml" },
  { id: "caf-green-tea", name: "Green tea", defaultMl: 240, caffeineMgPerServing: 28, servingLabel: "1 cup (240ml)" },
  { id: "caf-matcha", name: "Matcha", defaultMl: 240, caffeineMgPerServing: 70, servingLabel: "1 cup" },
  { id: "caf-black-tea", name: "Black tea", defaultMl: 240, caffeineMgPerServing: 47, servingLabel: "1 cup (240ml)" },
  { id: "caf-energy", name: "Energy drink", defaultMl: 250, caffeineMgPerServing: 80, servingLabel: "250ml can" },
  { id: "caf-soda", name: "Cola / soft drink", defaultMl: 355, caffeineMgPerServing: 34, servingLabel: "355ml can" },
  {
    id: "caf-mate",
    name: "Mate",
    defaultMl: 150,
    caffeineMgPerServing: 80,
    servingLabel: "1 mate",
    locales: ["es"],
    aliases: ["yerba", "yerba mate", "mate argentino"],
  },
  {
    id: "caf-turkish-coffee",
    name: "Turkish coffee",
    defaultMl: 60,
    caffeineMgPerServing: 60,
    servingLabel: "1 fincan",
    locales: ["tr"],
    aliases: ["türk kahvesi", "turk kahvesi", "kahve"],
  },
];

export function drinksForLanguage(language: "en" | "es" | "tr" | "fi"): CaffeineDrink[] {
  return CAFFEINE_DRINKS.filter((d) => !d.locales || d.locales.includes(language));
}

export function allFoods(custom: FoodItem[] = []): FoodItem[] {
  return [...FOOD_DATABASE, ...custom];
}

export function findFood(id: string, custom: FoodItem[] = []): FoodItem | undefined {
  return allFoods(custom).find((f) => f.id === id);
}

export function searchFoods(query: string, custom: FoodItem[] = []): FoodItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return allFoods(custom).slice(0, 40);
  return allFoods(custom).filter((f) => f.name.toLowerCase().includes(q));
}

export function scaleFood(food: FoodItem, multiplier: number) {
  return {
    calories: Math.round(food.calories * multiplier * 10) / 10,
    proteinG: Math.round(food.proteinG * multiplier * 10) / 10,
    carbsG: Math.round(food.carbsG * multiplier * 10) / 10,
    fatG: Math.round(food.fatG * multiplier * 10) / 10,
    grams: Math.round(food.servingGrams * multiplier * 10) / 10,
  };
}
