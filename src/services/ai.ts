import type { Dish } from '../types';
import { menuData } from '../data/menu';

export interface AIRecommendation {
  dish: Dish;
  reason: string;
  matchScore: number;
}

export interface MealRecommendation {
  starter: Dish | null;
  main: Dish | null;
  dessert: Dish | null;
  drink: Dish | null;
  total: number;
  explanation: string;
}

export function recommendDishes(query: string, limit = 4): AIRecommendation[] {
  const q = query.toLowerCase();
  const keywords = q.split(/\s+/).filter(Boolean);

  const scored = menuData
    .filter((d) => d.isAvailable)
    .map((dish) => {
      let score = 0;
      const searchable = [dish.name, dish.description, ...dish.ingredients, ...dish.category, ...dish.dietary, dish.spiceLevel].join(' ').toLowerCase();

      keywords.forEach((kw) => {
        if (searchable.includes(kw)) score += 15;
        if (dish.name.toLowerCase().includes(kw)) score += 25;
      });

      if (/(spicy|hot|chili|chilli|fire)/.test(q)) {
        if (dish.spiceLevel === 'hot' || dish.spiceLevel === 'extra-hot') score += 30;
        if (dish.spiceLevel === 'medium') score += 15;
        if (dish.spiceLevel === 'mild') score -= 10;
      }
      if (/(mild|not spicy|light spice)/.test(q)) {
        if (dish.spiceLevel === 'mild') score += 30;
        if (dish.spiceLevel === 'medium') score += 10;
      }
      if (/(light|not heavy|fresh|healthy)/.test(q)) {
        if (dish.category.includes('starters') || (dish.nutrition?.calories && dish.nutrition.calories < 400)) score += 20;
      }
      if (/(vegetarian|veggie|veg )/i.test(q) || /no meat|plant/.test(q)) {
        if (dish.dietary.includes('vegetarian') || dish.dietary.includes('vegan')) score += 40;
        else score -= 50;
      }
      if (/(vegan)/.test(q)) {
        if (dish.dietary.includes('vegan')) score += 40;
        else score -= 50;
      }
      if (/(non.?veg|meat|chicken|lamb|prawn|fish|seafood)/.test(q)) {
        if (dish.dietary.includes('non-vegetarian')) score += 25;
      }
      if (/(dessert|sweet|chocolate)/.test(q)) {
        if (dish.category.includes('desserts')) score += 40;
      }
      if (/(drink|cocktail|beverage)/.test(q)) {
        if (dish.category.includes('drinks')) score += 40;
      }
      if (/(cheap|budget|under|affordable)/.test(q)) {
        if (dish.price < 400) score += 20;
        if (dish.price > 700) score -= 15;
      }
      if (/(premium|luxury|special|chef)/.test(q)) {
        if (dish.category.includes('chefs-specials') || dish.price > 700) score += 25;
      }
      if (/(protein|high protein)/.test(q)) {
        if ((dish.nutrition?.protein ?? 0) > 20) score += 30;
      }
      if (/(dairy.?free|no dairy|lactose)/.test(q)) {
        if (dish.dietary.includes('dairy-free') || dish.dietary.includes('vegan')) score += 30;
        if (/cream|butter|cheese|paneer|burrata|parmesan|milk/.test(searchable)) score -= 20;
      }

      score += dish.popularity * 0.15 + dish.rating * 3;

      const reasons: string[] = [];
      if (/(spicy|hot)/.test(q) && (dish.spiceLevel === 'hot' || dish.spiceLevel === 'medium')) reasons.push(`matches your preference for ${dish.spiceLevel} heat`);
      if ((dish.dietary.includes('vegetarian') || dish.dietary.includes('vegan')) && /(veg)/.test(q)) reasons.push('fits your dietary preference');
      if (dish.category.includes('chefs-specials')) reasons.push("a Chef's Special");
      if (dish.rating >= 4.7) reasons.push(`highly rated (${dish.rating}★)`);
      if (dish.popularity > 90) reasons.push('a guest favorite');
      if (reasons.length === 0) reasons.push('pairs well with your craving');

      return { dish, reason: reasons.slice(0, 2).join(' · '), matchScore: score };
    })
    .filter((r) => r.matchScore > 10)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);

  return scored;
}

export function recommendMeal(prefs: { mood?: string; vegetarian?: boolean; spiceLevel?: string; budget?: number; mealType?: string }): MealRecommendation {
  let pool = menuData.filter((d) => d.isAvailable);
  if (prefs.vegetarian) pool = pool.filter((d) => d.dietary.includes('vegetarian') || d.dietary.includes('vegan'));
  if (prefs.spiceLevel === 'mild') pool = pool.filter((d) => d.spiceLevel === 'mild' || d.spiceLevel === 'medium');
  else if (prefs.spiceLevel === 'hot') pool = pool.filter((d) => d.spiceLevel === 'medium' || d.spiceLevel === 'hot' || d.spiceLevel === 'extra-hot');

  const pick = (cats: string[], excludeIds: string[] = []) => {
    const candidates = pool.filter((d) => d.category.some((c) => cats.includes(c)) && !excludeIds.includes(d.id)).sort((a, b) => b.popularity - a.popularity);
    return candidates[0] || null;
  };

  const starter = pick(['starters']);
  const main = pick(['main-course', 'chefs-specials'], starter ? [starter.id] : []);
  const dessert = pick(['desserts'], [starter?.id, main?.id].filter(Boolean) as string[]);
  const drink = pick(['drinks']);

  const items = [starter, main, dessert, drink].filter(Boolean) as Dish[];
  const total = items.reduce((s, d) => s + d.price, 0);

  let explanation = 'Based on your preferences, we curated a balanced Lumora experience.';
  if (prefs.mood) explanation += ` Perfect for a ${prefs.mood} mood.`;
  if (prefs.vegetarian) explanation += ' All vegetarian selections.';
  if (prefs.spiceLevel) explanation += ` Spice profile: ${prefs.spiceLevel}.`;

  return { starter, main, dessert, drink, total, explanation };
}

export function answerDietaryQuery(query: string): { answer: string; dishes: Dish[] } {
  const q = query.toLowerCase();
  let dishes = menuData.filter((d) => d.isAvailable);
  let answer = '';

  if (/(high protein|protein)/.test(q)) {
    dishes = dishes.filter((d) => (d.nutrition?.protein ?? 0) >= 18 || d.dietary.includes('non-vegetarian')).sort((a, b) => (b.nutrition?.protein ?? 0) - (a.nutrition?.protein ?? 0)).slice(0, 6);
    answer = 'Here are high-protein options from our menu. Many grilled and tandoor preparations are excellent sources of protein.';
  } else if (/(dairy|lactose|no dairy|dairy.?free)/.test(q)) {
    dishes = dishes.filter((d) => d.dietary.includes('dairy-free') || d.dietary.includes('vegan') || !/cream|butter|cheese|paneer|burrata|parmesan|milk|yogurt|ghee/.test((d.ingredients.join(' ') + d.description).toLowerCase())).slice(0, 8);
    answer = 'These dishes appear free of major dairy ingredients based on kitchen data. Always confirm with staff for severe allergies.';
  } else if (/(vegetarian|veggie)/.test(q) && !/non/.test(q)) {
    dishes = dishes.filter((d) => d.dietary.includes('vegetarian') || d.dietary.includes('vegan')).slice(0, 10);
    answer = 'Our vegetarian selection spans Indian, Asian and Continental kitchens.';
  } else if (/(vegan)/.test(q)) {
    dishes = dishes.filter((d) => d.dietary.includes('vegan')).slice(0, 8);
    answer = 'Fully plant-based options from the Lumora kitchen.';
  } else if (/(mild|not spicy|low spice)/.test(q)) {
    dishes = dishes.filter((d) => d.spiceLevel === 'mild').slice(0, 8);
    answer = 'These dishes are prepared with mild seasoning.';
  } else if (/(under|less than|below).*(500|₹500|rs\.?\s*500)/.test(q) || /budget/.test(q)) {
    dishes = dishes.filter((d) => d.price <= 500).sort((a, b) => a.price - b.price).slice(0, 10);
    answer = 'Dishes priced at ₹500 or under.';
  } else if (/(spicy|hot)/.test(q)) {
    dishes = dishes.filter((d) => d.spiceLevel === 'hot' || d.spiceLevel === 'extra-hot').slice(0, 8);
    answer = 'For those who love heat — these plates bring bold spice.';
  } else {
    const recs = recommendDishes(query, 6);
    dishes = recs.map((r) => r.dish);
    answer = `Based on “${query}”, here are the most relevant dishes from our menu.`;
  }

  return { answer, dishes };
}
