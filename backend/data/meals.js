/**
 * Starter meal catalog used by `npm run seed`.
 * Nutrition values are typical approximations per serving for planning purposes.
 * Fields: name, category, dietaryType, calories, protein, carbohydrates, fats (g),
 * ingredients, allergens, servingSize, description.
 */
const meal = (name, category, dietaryType, [calories, protein, carbohydrates, fats], ingredients, allergens, servingSize, description) => ({
  name,
  category,
  dietaryType,
  calories,
  protein,
  carbohydrates,
  fats,
  ingredients,
  allergens,
  servingSize,
  description,
});

export const meals = [
  // ---------------- Breakfast ----------------
  meal('Vegetable Poha', 'breakfast', 'vegan', [280, 6, 48, 7], ['flattened rice', 'onion', 'green peas', 'peanuts', 'curry leaves', 'lemon'], ['peanuts'], '1 plate (200 g)', 'Light flattened-rice breakfast tempered with mustard and curry leaves.'),
  meal('Masala Oats', 'breakfast', 'vegan', [250, 9, 40, 6], ['rolled oats', 'tomato', 'carrot', 'green peas', 'spices'], ['gluten'], '1 bowl (250 g)', 'Savory oats cooked with vegetables and warm spices.'),
  meal('Moong Dal Chilla', 'breakfast', 'vegan', [290, 16, 38, 8], ['moong dal', 'onion', 'coriander', 'green chili', 'mint chutney'], [], '2 chillas', 'Protein-rich lentil pancakes with mint chutney.'),
  meal('Greek Yogurt Parfait', 'breakfast', 'vegetarian', [320, 20, 40, 9], ['greek yogurt', 'granola', 'mixed berries', 'honey'], ['dairy', 'nuts', 'gluten'], '1 jar (300 g)', 'Layers of thick yogurt, crunchy granola and berries.'),
  meal('Paneer Stuffed Paratha', 'breakfast', 'vegetarian', [420, 18, 48, 17], ['whole wheat flour', 'paneer', 'onion', 'coriander', 'ghee'], ['dairy', 'gluten'], '2 parathas', 'Whole-wheat flatbread stuffed with spiced cottage cheese.'),
  meal('Idli with Sambar', 'breakfast', 'vegan', [300, 11, 56, 3], ['idli rice', 'urad dal', 'toor dal', 'mixed vegetables', 'tamarind'], [], '3 idlis + 1 bowl sambar', 'Steamed rice-lentil cakes with vegetable lentil stew.'),
  meal('Masala Omelette with Toast', 'breakfast', 'eggetarian', [340, 21, 26, 16], ['eggs', 'onion', 'tomato', 'green chili', 'whole wheat bread'], ['eggs', 'gluten'], '2 eggs + 2 slices', 'Fluffy spiced omelette with whole-wheat toast.'),
  meal('Egg Bhurji Wrap', 'breakfast', 'eggetarian', [380, 22, 34, 17], ['eggs', 'whole wheat roti', 'onion', 'capsicum', 'spices'], ['eggs', 'gluten'], '1 wrap', 'Indian-style scrambled eggs rolled in a roti.'),
  meal('Peanut Butter Banana Toast', 'breakfast', 'vegan', [360, 12, 46, 15], ['whole grain bread', 'peanut butter', 'banana', 'chia seeds'], ['peanuts', 'gluten'], '2 slices', 'Whole-grain toast with peanut butter and banana.'),
  meal('Chicken Sausage Veggie Scramble', 'breakfast', 'non_vegetarian', [410, 30, 14, 26], ['chicken sausage', 'eggs', 'spinach', 'bell pepper'], ['eggs'], '1 plate', 'High-protein scramble with sausage and greens.'),
  meal('Smoked Salmon Avocado Toast', 'breakfast', 'non_vegetarian', [390, 22, 30, 20], ['sourdough bread', 'smoked salmon', 'avocado', 'lemon'], ['fish', 'gluten'], '2 slices', 'Sourdough topped with avocado and smoked salmon.'),
  meal('Tofu Scramble Bowl', 'breakfast', 'vegan', [310, 22, 18, 17], ['firm tofu', 'spinach', 'turmeric', 'onion', 'cherry tomatoes'], ['soy'], '1 bowl', 'Turmeric tofu scramble with sautéed vegetables.'),
  meal('Ragi Dosa with Coconut Chutney', 'breakfast', 'vegan', [270, 7, 44, 8], ['ragi flour', 'rice flour', 'coconut', 'curry leaves'], [], '2 dosas', 'Finger-millet crepes with fresh coconut chutney.'),
  meal('Overnight Oats with Almonds', 'breakfast', 'vegetarian', [350, 13, 48, 12], ['rolled oats', 'milk', 'almonds', 'chia seeds', 'apple'], ['dairy', 'nuts', 'gluten'], '1 jar (300 g)', 'No-cook oats soaked overnight with fruit and nuts.'),

  // ---------------- Lunch ----------------
  meal('Rajma Chawal', 'lunch', 'vegan', [520, 19, 88, 9], ['kidney beans', 'basmati rice', 'tomato', 'onion', 'spices'], [], '1 plate', 'Comforting kidney-bean curry with steamed rice.'),
  meal('Dal Tadka with Jeera Rice', 'lunch', 'vegan', [480, 17, 80, 10], ['toor dal', 'basmati rice', 'cumin', 'garlic', 'tomato'], [], '1 plate', 'Tempered yellow lentils with cumin rice.'),
  meal('Paneer Tikka Bowl', 'lunch', 'vegetarian', [520, 30, 42, 26], ['paneer', 'bell peppers', 'brown rice', 'yogurt marinade', 'onion'], ['dairy'], '1 bowl', 'Grilled paneer tikka over brown rice and peppers.'),
  meal('Chole with Brown Rice', 'lunch', 'vegan', [510, 18, 84, 11], ['chickpeas', 'brown rice', 'onion', 'tomato', 'spices'], [], '1 plate', 'Spiced chickpea curry with fibre-rich brown rice.'),
  meal('Quinoa Chickpea Salad', 'lunch', 'vegan', [430, 17, 55, 15], ['quinoa', 'chickpeas', 'cucumber', 'cherry tomatoes', 'olive oil', 'lemon'], [], '1 large bowl', 'Zesty salad with quinoa, chickpeas and crunchy vegetables.'),
  meal('Grilled Chicken with Roti & Salad', 'lunch', 'non_vegetarian', [540, 44, 48, 17], ['chicken breast', 'whole wheat roti', 'cucumber', 'onion', 'yogurt dip'], ['gluten', 'dairy'], '150 g chicken + 2 rotis', 'Lean grilled chicken with rotis and fresh salad.'),
  meal('Egg Curry with Rice', 'lunch', 'eggetarian', [530, 22, 66, 19], ['eggs', 'basmati rice', 'onion', 'tomato', 'spices'], ['eggs'], '2 eggs + 1 cup rice', 'Boiled eggs simmered in onion-tomato gravy.'),
  meal('Fish Curry with Rice', 'lunch', 'non_vegetarian', [510, 34, 60, 13], ['basa fish', 'rice', 'coconut milk', 'tamarind', 'spices'], ['fish'], '1 plate', 'Tangy coastal-style fish curry with rice.'),
  meal('Veg Pulao with Raita', 'lunch', 'vegetarian', [460, 12, 74, 13], ['basmati rice', 'mixed vegetables', 'whole spices', 'yogurt', 'cucumber'], ['dairy'], '1 plate', 'Fragrant vegetable rice with cooling cucumber raita.'),
  meal('Chicken Burrito Bowl', 'lunch', 'non_vegetarian', [590, 42, 62, 18], ['chicken', 'brown rice', 'black beans', 'corn', 'salsa', 'lettuce'], [], '1 bowl', 'Mexican-style bowl with chicken, beans and salsa.'),
  meal('Palak Tofu with Roti', 'lunch', 'vegan', [470, 25, 46, 20], ['tofu', 'spinach', 'whole wheat roti', 'garlic', 'onion'], ['soy', 'gluten'], '1 bowl + 2 rotis', 'Creamy spinach gravy with tofu cubes.'),
  meal('Mixed Veg Khichdi', 'lunch', 'vegan', [420, 15, 70, 8], ['rice', 'moong dal', 'carrot', 'green peas', 'turmeric'], [], '1 bowl (350 g)', 'One-pot rice and lentil comfort food.'),
  meal('Egg Fried Rice with Veggies', 'lunch', 'eggetarian', [500, 18, 70, 16], ['rice', 'eggs', 'carrot', 'beans', 'spring onion', 'soy sauce'], ['eggs', 'soy'], '1 plate', 'Wok-tossed rice with egg and crunchy vegetables.'),

  // ---------------- Snacks ----------------
  meal('Roasted Makhana', 'snacks', 'vegetarian', [140, 5, 22, 4], ['fox nuts', 'ghee', 'rock salt'], ['dairy'], '1 cup (30 g)', 'Crunchy roasted lotus seeds.'),
  meal('Seasonal Fruit Bowl', 'snacks', 'vegan', [120, 2, 30, 0.5], ['apple', 'papaya', 'pomegranate', 'orange'], [], '1 bowl (250 g)', 'Fresh cut seasonal fruits.'),
  meal('Sprouts Chaat', 'snacks', 'vegan', [180, 11, 28, 2], ['moong sprouts', 'onion', 'tomato', 'lemon', 'chaat masala'], [], '1 bowl', 'Tangy sprouted-moong salad.'),
  meal('Hummus with Veggie Sticks', 'snacks', 'vegan', [190, 6, 18, 11], ['chickpeas', 'tahini', 'carrots', 'cucumber'], ['sesame'], '4 tbsp + veggies', 'Creamy hummus with crunchy vegetable sticks.'),
  meal('Greek Yogurt with Honey', 'snacks', 'vegetarian', [150, 14, 16, 3], ['greek yogurt', 'honey', 'cinnamon'], ['dairy'], '1 cup (170 g)', 'Thick, protein-rich yogurt with a drizzle of honey.'),
  meal('Boiled Eggs with Pepper', 'snacks', 'eggetarian', [155, 13, 1, 11], ['eggs', 'black pepper', 'salt'], ['eggs'], '2 eggs', 'Simple, high-protein snack.'),
  meal('Mixed Nuts', 'snacks', 'vegan', [200, 6, 8, 17], ['almonds', 'walnuts', 'cashews'], ['nuts'], '1 handful (35 g)', 'Energy-dense mix of healthy fats.'),
  meal('Banana Oat Protein Smoothie', 'snacks', 'vegetarian', [240, 24, 26, 5], ['whey protein', 'milk', 'banana', 'oats'], ['dairy', 'gluten'], '1 glass (350 ml)', 'Filling post-workout smoothie.'),
  meal('Roasted Chana', 'snacks', 'vegan', [160, 9, 24, 3], ['roasted chickpeas', 'spices'], [], '1/2 cup (40 g)', 'Crunchy roasted chickpeas.'),
  meal('Chicken Tikka Bites', 'snacks', 'non_vegetarian', [210, 30, 4, 8], ['chicken breast', 'yogurt', 'spices', 'lemon'], ['dairy'], '6 pieces', 'Tandoori-spiced grilled chicken bites.'),
  meal('Peanut Chikki', 'snacks', 'vegan', [180, 5, 20, 9], ['peanuts', 'jaggery'], ['peanuts'], '2 small pieces', 'Traditional peanut and jaggery brittle.'),
  meal('Tuna Cucumber Bites', 'snacks', 'non_vegetarian', [150, 20, 4, 6], ['tuna', 'cucumber', 'greek yogurt', 'dill'], ['fish', 'dairy'], '6 bites', 'Light tuna salad served on cucumber rounds.'),
  meal('Masala Buttermilk (Chaas)', 'snacks', 'vegetarian', [70, 3, 6, 3], ['yogurt', 'water', 'roasted cumin', 'mint'], ['dairy'], '1 glass (250 ml)', 'Cooling spiced buttermilk.'),

  // ---------------- Dinner ----------------
  meal('Grilled Paneer with Sautéed Veggies', 'dinner', 'vegetarian', [450, 28, 18, 29], ['paneer', 'zucchini', 'bell pepper', 'broccoli', 'olive oil'], ['dairy'], '150 g paneer + veggies', 'Low-carb, high-protein grilled paneer plate.'),
  meal('Moong Dal with Roti & Sabzi', 'dinner', 'vegan', [450, 19, 68, 10], ['moong dal', 'whole wheat roti', 'seasonal vegetables'], ['gluten'], '1 bowl dal + 2 rotis', 'Classic home-style balanced dinner.'),
  meal('Tofu Stir-Fry with Brown Rice', 'dinner', 'vegan', [480, 24, 58, 16], ['tofu', 'broccoli', 'bell pepper', 'soy sauce', 'brown rice'], ['soy'], '1 plate', 'Quick wok stir-fry with tofu and greens.'),
  meal('Baked Salmon with Quinoa', 'dinner', 'non_vegetarian', [560, 40, 38, 26], ['salmon', 'quinoa', 'asparagus', 'lemon', 'olive oil'], ['fish'], '150 g salmon + 1 cup quinoa', 'Omega-3 rich salmon with fluffy quinoa.'),
  meal('Chicken Soup with Multigrain Bread', 'dinner', 'non_vegetarian', [380, 32, 34, 11], ['chicken', 'carrot', 'celery', 'onion', 'multigrain bread'], ['gluten'], '1 large bowl + 1 slice', 'Warm, light chicken and vegetable soup.'),
  meal('Vegetable Upma', 'dinner', 'vegan', [340, 9, 54, 10], ['semolina', 'mixed vegetables', 'mustard seeds', 'curry leaves'], ['gluten'], '1 bowl (250 g)', 'Savory semolina cooked with vegetables.'),
  meal('Egg Bhurji with Roti', 'dinner', 'eggetarian', [430, 22, 40, 20], ['eggs', 'whole wheat roti', 'onion', 'tomato'], ['eggs', 'gluten'], '2 eggs + 2 rotis', 'Spiced scrambled eggs with soft rotis.'),
  meal('Chicken Curry with Roti', 'dinner', 'non_vegetarian', [560, 40, 46, 22], ['chicken', 'whole wheat roti', 'onion', 'tomato', 'spices'], ['gluten'], '1 bowl + 2 rotis', 'Home-style chicken curry.'),
  meal('Lentil Soup with Garlic Toast', 'dinner', 'vegan', [390, 18, 58, 9], ['red lentils', 'carrot', 'garlic', 'whole wheat bread'], ['gluten'], '1 bowl + 2 slices', 'Hearty red-lentil soup.'),
  meal('Palak Paneer with Jowar Roti', 'dinner', 'vegetarian', [500, 24, 44, 25], ['spinach', 'paneer', 'jowar flour', 'garlic', 'cream'], ['dairy'], '1 bowl + 2 rotis', 'Spinach and cottage cheese curry with millet rotis.'),
  meal('Vegetable Daliya', 'dinner', 'vegan', [360, 12, 62, 7], ['broken wheat', 'mixed vegetables', 'spices'], ['gluten'], '1 bowl (300 g)', 'Wholesome broken-wheat porridge with vegetables.'),
  meal('Shakshuka with Pita', 'dinner', 'eggetarian', [450, 21, 42, 21], ['eggs', 'tomato', 'bell pepper', 'onion', 'pita bread'], ['eggs', 'gluten'], '2 eggs + 1 pita', 'Eggs poached in spiced tomato-pepper sauce.'),
  meal('Grilled Fish with Veggies', 'dinner', 'non_vegetarian', [400, 38, 16, 20], ['basa fish', 'broccoli', 'carrot', 'lemon', 'olive oil'], ['fish'], '180 g fish + veggies', 'Lemon-herb grilled fish with steamed vegetables.'),
];
