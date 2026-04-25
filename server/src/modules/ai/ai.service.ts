const NON_VEG_TOKENS = [
  "chicken",
  "mutton",
  "lamb",
  "beef",
  "pork",
  "fish",
  "prawn",
  "shrimp",
  "egg",
  "keema",
  "meat",
  "tuna",
  "salmon",
  "crab",
  "lobster",
];

const HIGH_PROTEIN_TOKENS = [
  "chicken",
  "mutton",
  "egg",
  "paneer",
  "dal",
  "lentil",
  "chana",
  "rajma",
  "tofu",
  "sprouts",
  "fish",
  "prawn",
];

const KETO_TOKENS = [
  "grilled",
  "steamed",
  "chicken",
  "mutton",
  "paneer",
  "eggs",
  "fish",
  "salad",
  "greens",
];

const ANTI_KETO_TOKENS = [
  "rice",
  "biryani",
  "roti",
  "paratha",
  "naan",
  "puri",
  "bread",
  "pasta",
  "maida",
  "sugar",
];

export type NutritionResult = {
  calories: number;
  healthScore: number;
  isVeg: boolean;
  tags: string[];
};

export const estimateNutrition = (dishName: string): NutritionResult => {
  const name = dishName.toLowerCase();

  let calories = 200;
  let score = 7;

  if (name.includes("fried") || name.includes("deep fry")) {
    calories += 150;
    score -= 2;
  }
  if (name.includes("grilled") || name.includes("steamed")) {
    calories -= 30;
    score += 1;
  }

  if (name.includes("paneer")) {
    calories += 120;
    score += 1;
  }
  if (name.includes("butter") || name.includes("cream")) {
    calories += 100;
    score -= 1;
  }
  if (name.includes("salad") || name.includes("greens")) {
    calories -= 50;
    score += 2;
  }
  if (
    name.includes("dal") ||
    name.includes("lentil") ||
    name.includes("chana") ||
    name.includes("rajma")
  ) {
    calories += 60;
    score += 2;
  }
  if (name.includes("rice") || name.includes("biryani")) {
    calories += 80;
    score -= 1;
  }
  if (
    name.includes("chicken") ||
    name.includes("mutton") ||
    name.includes("lamb")
  ) {
    calories += 90;
    score += 0.5;
  }
  if (
    name.includes("fish") ||
    name.includes("prawn") ||
    name.includes("shrimp")
  ) {
    calories += 70;
    score += 1;
  }
  if (name.includes("egg")) {
    calories += 70;
    score += 0.5;
  }
  if (name.includes("cheese")) {
    calories += 80;
    score -= 0.5;
  }
  if (name.includes("tofu") || name.includes("sprouts")) {
    calories += 50;
    score += 1.5;
  }

  if (
    name.includes("paratha") ||
    name.includes("naan") ||
    name.includes("puri") ||
    name.includes("roti")
  ) {
    calories += 80;
    score -= 0.9;
  }

  if (
    name.includes("halwa") ||
    name.includes("kheer") ||
    name.includes("gulab") ||
    name.includes("ladoo") ||
    name.includes("sweet")
  ) {
    calories += 120;
    score -= 2;
  }

  calories = Math.max(50, calories);
  score = Math.max(1, Math.min(10, score));
  const healthScore = parseFloat(score.toFixed(1));

  const isVeg = !NON_VEG_TOKENS.some((token) => name.includes(token));

  const tags: string[] = [];

  if (isVeg) tags.push("Veg");
  else tags.push("Non-Veg");

  const isHighProtein = HIGH_PROTEIN_TOKENS.some((token) =>
    name.includes(token),
  );
  if (isHighProtein) tags.push("High Protein");

  if (calories <= 300) tags.push("Low Calorie");

  const hasKetoToken = KETO_TOKENS.some((t) => name.includes(t));
  const hasAntiKeto = ANTI_KETO_TOKENS.some((t) => name.includes(t));
  if (hasKetoToken && !hasAntiKeto) tags.push("Keto");

  if (healthScore >= 8) tags.push("Healthy");

  return { calories, healthScore, isVeg, tags };
};
