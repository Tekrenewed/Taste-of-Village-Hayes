import { MenuItem, BuilderConfig } from './types';

// FULL PRODUCTION MENU
export const MENU_ITEMS: MenuItem[] = [
  {
    "id": "f_rose_falooda",
    "name": "Rose Falooda",
    "description": "Silky noodles, crunchy seeds, and the scent of a thousand roses.",
    "price": 6.99,
    "originalPrice": 6.99,
    "category": "desserts",
    "image": "/assets/rose_falooda.jpg",
    "popular": true
  },
  {
    "id": "f_royal_heritage",
    "name": "The Royal Heritage",
    "description": "Rooh Afza blended into chilled milk, layered with rich kulfi and finished with royal dust — floral, creamy, and timeless.",
    "price": 6.49,
    "originalPrice": 6.49,
    "category": "desserts",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "f_golden_monsoon",
    "name": "The Golden Monsoon",
    "description": "Thick mango pulp layered with cream and fruity textures for a bright, refreshing finish.",
    "price": 6.49,
    "originalPrice": 6.49,
    "category": "desserts",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "f_pistachio_royale_falooda",
    "name": "Pistachio Royale Falooda",
    "description": "A pistachio-forward falooda with deep flavour and creamy layers throughout.",
    "price": 6.49,
    "originalPrice": 6.49,
    "category": "desserts",
    "image": "/assets/pistachio_royale.png",
    "popular": false
  },
  {
    "id": "f_salted_sunset",
    "name": "The Salted Sunset",
    "description": "Salted caramel and butterscotch paired with vanilla ice cream, finished with a sweet-salty crunch that’s dangerously addictive.",
    "price": 6.49,
    "originalPrice": 6.49,
    "category": "desserts",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "c_samosa_chaat",
    "name": "Samosa Chaat",
    "description": "A delicious, freshly prepared samosa chaat made to perfection.",
    "price": 6.49,
    "originalPrice": 6.49,
    "category": "starters",
    "image": "/assets/samosa_chaat.png",
    "popular": false
  },
  {
    "id": "c_dahi_bhalla",
    "name": "Dahi Bhala",
    "description": "A delicious, freshly prepared dahi bhala made to perfection.",
    "price": 5.99,
    "originalPrice": 5.99,
    "category": "starters",
    "image": "/assets/dahi_bhala.png",
    "popular": false
  },
  {
    "id": "c_papdi_chaat",
    "name": "Papri Chaat",
    "description": "A delicious, freshly prepared papri chaat made to perfection.",
    "price": 6.49,
    "originalPrice": 6.49,
    "category": "starters",
    "image": "/assets/papri_chaat.png",
    "popular": false
  },
  {
    "id": "ds_caramel_mocha_cake",
    "name": "Caramel Mocha Cake",
    "description": "A delicious, freshly prepared caramel mocha cake made to perfection.",
    "price": 6.1,
    "originalPrice": 6.1,
    "category": "desserts",
    "image": "/assets/caramel_mocha.png",
    "popular": false
  },
  {
    "id": "ds_seasonal_fruit_cake",
    "name": "Seasonal Fruit Cake",
    "description": "A delicious, freshly prepared seasonal fruit cake made to perfection.",
    "price": 6,
    "originalPrice": 6,
    "category": "desserts",
    "image": "/assets/seasonal_fruit.png",
    "popular": false
  },
  {
    "id": "ds_san_sebastian_cheesecake",
    "name": "San Sabestian Cheese Cake",
    "description": "A delicious, freshly prepared san sabastian cheesecake made to perfection.",
    "price": 9.49,
    "originalPrice": 9.49,
    "category": "desserts",
    "image": "/assets/san_sebastian.png",
    "popular": false
  },
  {
    "id": "ds_strawberry_cups",
    "name": "Strawberry Cups",
    "description": "A delicious, freshly prepared strawberry cup layered to perfection.",
    "price": 6,
    "originalPrice": 6,
    "category": "desserts",
    "image": "/assets/strawberry_cups.png",
    "popular": true
  },
  {
    "id": "ds_luxury_ice_cream",
    "name": "Ice Cream",
    "description": "Rich dairy ice cream. Choose your flavors at the counter.",
    "price": 4,
    "originalPrice": 4,
    "category": "desserts",
    "image": "https://cdn.pixabay.com/photo/2016/02/25/16/32/ice-cream-1222421_1280.jpg",
    "popular": false
  },
  {
    "id": "ds_strawberry_marshmallow_delight",
    "name": "Strawberry & Marshmallow Chocolate Delight",
    "description": "A beautiful combination of strawberry, marshmallow, and rich chocolate.",
    "price": 6.99,
    "originalPrice": 6.99,
    "category": "desserts",
    "image": "/assets/cups.png",
    "popular": false
  },
  // ─── BREAKFAST: English ───
  {
    "id": "eb_egg_shakshuka",
    "name": "Egg Shakshuka",
    "description": "Tomato Sauce with Eggs, Toast or Paratha",
    "price": 8.95,
    "category": "starters",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "eb_full_english",
    "name": "Full English Breakfast",
    "description": "2 sausages, 2 Beef Bacon (Halal) rashers, 2 eggs, 2 hash browns, grilled tomatoes, mushrooms, baked beans.",
    "price": 11.95,
    "category": "starters",
    "image": "/assets/placeholder.png",
    "popular": true
  },
  {
    "id": "eb_full_vegetarian",
    "name": "Full Vegetarian Breakfast",
    "description": "2 vegetarian sausages, 2 eggs, 2 hash browns, grilled tomatoes, mushrooms, baked beans.",
    "price": 10.95,
    "category": "starters",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "eb_eggs_benedict",
    "name": "Eggs Benedict",
    "description": "English muffin, Beef Bacon (Halal), 2 poached eggs, hollandaise sauce, chives, fresh salad.",
    "price": 9.95,
    "category": "starters",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "eb_eggs_royale",
    "name": "Eggs Royale",
    "description": "Muffin, spinach, smoked salmon, hollandaise sauce, chives, fresh salad.",
    "price": 10.95,
    "category": "starters",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "eb_avocado_toast",
    "name": "Avocado on Toast with Eggs",
    "description": "Mashed avocado, poached eggs, toast, fresh salad.",
    "price": 8.95,
    "category": "starters",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "eb_eggs_on_toast",
    "name": "Eggs on Toast",
    "description": "Poached, scrambled or fried eggs, toast, fresh salad.",
    "price": 6.95,
    "category": "starters",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  // ─── BREAKFAST: Sweet ───
  {
    "id": "sb_pancakes",
    "name": "Pancakes",
    "description": "4 pancakes with strawberries, berries or banana, honey or maple syrup.",
    "price": 7.95,
    "category": "desserts",
    "image": "/assets/placeholder.png",
    "popular": true
  },
  {
    "id": "sb_french_toast",
    "name": "French Toast",
    "description": "Sweet French toast with maple syrup or honey.",
    "price": 7.50,
    "category": "desserts",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  // ─── BREAKFAST: Desi ───
  {
    "id": "db_paratha_chana",
    "name": "Paratha with Chana Masala",
    "description": "2 parathas, chana masala, salad, chutney.",
    "price": 8.95,
    "category": "starters",
    "image": "/assets/desi_breakfast.jpg",
    "popular": true
  },
  {
    "id": "db_omelette_paratha",
    "name": "Omelette Paratha",
    "description": "Plain or desi omelette, paratha, pickle, salad.",
    "price": 8.50,
    "category": "starters",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "db_thali_breakfast",
    "name": "Thali Breakfast",
    "description": "Chana masala, 2 parathas, pickle, chutney, salad.",
    "price": 9.95,
    "category": "starters",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "db_aloo_paratha",
    "name": "Aloo Paratha",
    "description": "Spiced potato-stuffed paratha.",
    "price": 5.50,
    "category": "starters",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "db_plain_paratha",
    "name": "Plain Paratha",
    "description": "Plain buttery layered flatbread.",
    "price": 4.50,
    "category": "starters",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  // ─── BREAKFAST: Drinks ───
  {
    "id": "bd_signature_tea",
    "name": "Signature Tea",
    "description": "Our signature breakfast tea blend.",
    "price": 2.50,
    "category": "drinks",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "bd_coffee",
    "name": "Coffee",
    "description": "Fresh brewed coffee.",
    "price": 2.80,
    "category": "drinks",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "bd_mango_lassi",
    "name": "Mango Lassi",
    "description": "Creamy mango yoghurt drink.",
    "price": 3.50,
    "category": "drinks",
    "image": "/assets/placeholder.png",
    "popular": true
  },
  {
    "id": "bd_sweet_lassi",
    "name": "Traditional Sweet Lassi",
    "description": "Classic traditional sweet lassi.",
    "price": 3.20,
    "category": "drinks",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "bd_mixed_berries_smoothie",
    "name": "Mixed Berries Smoothie",
    "description": "A refreshing blend of mixed berries.",
    "price": 4.50,
    "category": "drinks",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "bd_strawberry_smoothie",
    "name": "Strawberry Smoothie",
    "description": "Fresh strawberry smoothie.",
    "price": 4.50,
    "category": "drinks",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "bd_spinach_ginger_smoothie",
    "name": "Spinach Ginger Fruit Smoothie",
    "description": "Healthy spinach and ginger fruit smoothie.",
    "price": 4.80,
    "category": "drinks",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  // ─── LUNCH / SIDES ───
  {
    "id": "l_truffle_fries",
    "name": "Truffle Fries",
    "description": "Truffle sauce, Parmesan Cheese",
    "price": 4.99,
    "category": "starters",
    "image": "/assets/placeholder.png",
    "popular": true
  },
  {
    "id": "l_onion_rings",
    "name": "Home Made Onion Rings",
    "description": "6 Battered Onion rings with Sauce",
    "price": 3.50,
    "category": "starters",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  // ─── STREET FOOD: Chaats ───
  {
    "id": "c_mixed_chaat",
    "name": "Mixed Chaat",
    "description": "A bold mix of chickpeas, potatoes, yogurt, and chutneys; chaos, but the good kind.",
    "price": 6.49,
    "category": "starters",
    "image": "/assets/placeholder.png",
    "popular": true
  },
  {
    "id": "c_dahi_bhalla",
    "name": "Dahi Bhalla",
    "description": "Soft lentil dumplings soaked in chilled yogurt, finished with sweet and spicy chutneys.",
    "price": 5.99,
    "category": "starters",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "c_samosa_chaat",
    "name": "Samosa Chaat",
    "description": "Crushed samosa layered with chickpeas, yogurt, and chutneys; comfort food.",
    "price": 6.49,
    "category": "starters",
    "image": "/assets/samosa_chaat.png",
    "popular": true
  },
  {
    "id": "c_fruit_chaat",
    "name": "Fruit Chaat",
    "description": "Fresh fruit tossed in zesty spices; light, tangy, and unexpectedly addictive.",
    "price": 6.99,
    "category": "starters",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "c_aloo_tikki_chaat",
    "name": "Aloo Tikki Chaat",
    "description": "Crispy potato patties topped with yogurt, chutneys, and crunch; hot meets cool.",
    "price": 5.99,
    "category": "starters",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "c_papdi_chaat",
    "name": "Papdi Chaat",
    "description": "Crisp wafers loaded with yogurt, chutneys, and spices; every bite a texture explosion.",
    "price": 6.49,
    "category": "starters",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "c_special_chaat",
    "name": "Falooda & Co Special Chaat",
    "description": "Signature mix, layered and loaded to hit every flavour note including Lobioa, Bhalla and Chana Chat.",
    "price": 8.49,
    "category": "starters",
    "image": "/assets/placeholder.png",
    "popular": true
  },
  // ─── LUNCH: Wraps & Sandwiches ───
  {
    "id": "l_cheesy_bun_kebab",
    "name": "Cheesy Bun Kebab",
    "description": "A true street legend; spiced shami kebab with egg, chutneys, and soft bun, messy in the best way. Served with Fries.",
    "price": 6.49,
    "category": "starters",
    "image": "/assets/placeholder.png",
    "popular": true
  },
  {
    "id": "l_shawarma_platter",
    "name": "Shawarma Platter",
    "description": "Tender, spiced filling wrapped warm, finished with a desi touch and house sauces.",
    "price": 8.49,
    "category": "starters",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  // ─── LUNCH: Fries ───
  {
    "id": "l_plain_fries",
    "name": "Plain Fries",
    "description": "Golden, crisp, and straight to the point.",
    "price": 3.99,
    "category": "starters",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "l_masala_fries",
    "name": "Masala Fries",
    "description": "Tossed in bold desi spices; crispy, punchy, and impossible to stop at one bite.",
    "price": 4.99,
    "category": "starters",
    "image": "/assets/placeholder.png",
    "popular": true
  },
  // ─── DESSERT: Meetha ───
  {
    "id": "ds_gulab_jamun",
    "name": "Gulab Jamun (3 pcs)",
    "description": "Soft, syrup-soaked dumplings that melt as soon as they hit; warm, sweet, and nostalgic. Served with Vanilla Ice cream.",
    "price": 5.49,
    "category": "desserts",
    "image": "/assets/placeholder.png",
    "popular": true
  },
  {
    "id": "ds_gajar_ka_halwa",
    "name": "Gajar Ka Halwa",
    "description": "Slow-cooked carrots enriched with khoya and nuts; rich, buttery, and deeply comforting.",
    "price": 5.99,
    "category": "desserts",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  // ─── LUNCH ───
  {
    "id": "l_fish_chips",
    "name": "Fish & Chips",
    "description": "Battered fish, steak chips, tartar sauce, peas, lemon.",
    "price": 12.95,
    "category": "starters",
    "image": "/assets/placeholder.png",
    "popular": true
  },
  {
    "id": "l_club_sandwich",
    "name": "Club Sandwich",
    "description": "Marinated chicken, cocktail sauce, served with salad or chips.",
    "price": 9.95,
    "category": "starters",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "l_croissant_sandwich",
    "name": "Croissant Sandwich",
    "description": "Marinated chicken, lettuce, cucumber, served with salad.",
    "price": 8.95,
    "category": "starters",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  // ─── SALADS ───
  {
    "id": "s_russian_salad",
    "name": "Russian Salad",
    "description": "Classic creamy Russian salad.",
    "price": 5.95,
    "category": "starters",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "s_greek_salad",
    "name": "Greek Salad",
    "description": "Fresh Greek salad with feta and olives.",
    "price": 6.95,
    "category": "starters",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "s_chicken_caesar_salad",
    "name": "Chicken Caesar Salad",
    "description": "Crisp romaine, grilled chicken, croutons and Caesar dressing.",
    "price": 8.95,
    "category": "starters",
    "image": "/assets/placeholder.png",
    "popular": true
  },
  {
    "id": "s_fruit_chaat",
    "name": "Fruit Chaat",
    "description": "Fresh fruit tossed in zesty spices for a light bite.",
    "price": 5.50,
    "category": "starters",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  // ─── CAKES ───
  {
    "id": "c_caramel_mocha",
    "name": "Caramel Mocha Cake",
    "description": "Deep coffee notes layered with soft sponge and crunchy walnuts.",
    "price": 6.10,
    "category": "desserts",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "c_nutella",
    "name": "Nutella Cake",
    "description": "Rich chocolate sponge wrapped in silky Nutella cream.",
    "price": 6.49,
    "category": "desserts",
    "image": "/assets/placeholder.png",
    "popular": true
  },
  {
    "id": "c_nutty_fudge",
    "name": "Nutty Fudge Cake",
    "description": "Dark chocolate fudge loaded with nutty crunch.",
    "price": 6.40,
    "category": "desserts",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "c_seasonal_fruit",
    "name": "Seasonal Fruit Cake",
    "description": "Light sponge layered with fresh fruits and whipped cream.",
    "price": 6.00,
    "category": "desserts",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "c_lotus_cheesecake",
    "name": "Lotus Cheesecake",
    "description": "Creamy cheesecake infused with caramelised Biscoff.",
    "price": 5.50,
    "category": "desserts",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "c_nutella_banana",
    "name": "Nutella Banana Loaf",
    "description": "Warm banana loaf with hints of Nutella.",
    "price": 4.49,
    "category": "desserts",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  // ─── SIGNATURE DESSERTS ───
  {
    "id": "sd_chocolate_volcano",
    "name": "Chocolate Volcano Delight",
    "description": "Soft sponge finished with flowing warm chocolate.",
    "price": 9.99,
    "category": "desserts",
    "image": "/assets/placeholder.png",
    "popular": true
  },
  {
    "id": "sd_peanut_butter",
    "name": "Peanut Butter Indulgence",
    "description": "Moist sponge filled with creamy peanut butter and roasted crunch.",
    "price": 8.49,
    "category": "desserts",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "sd_san_sebastian",
    "name": "San Sebastian Cheesecake",
    "description": "Lightly burnt top with a soft, creamy centre.",
    "price": 9.49,
    "category": "desserts",
    "image": "/assets/placeholder.png",
    "popular": true
  },
  {
    "id": "sd_molten_lava",
    "name": "Molten Lava",
    "description": "Warm chocolate cake with a flowing centre.",
    "price": 7.49,
    "category": "desserts",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "sd_lemon_posset",
    "name": "Signature Lemon Posset",
    "description": "With shortbread and berries.",
    "price": 5.95,
    "category": "desserts",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "sd_strawberry_parfait",
    "name": "Strawberry Parfait",
    "description": "A delightful layered strawberry parfait.",
    "price": 5.50,
    "category": "desserts",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  // ─── COOKIE DOUGH ───
  {
    "id": "cd_choc_chip",
    "name": "Chocolate Chip / Lotus Biscoff Cookie Dough",
    "description": "Served warm with vanilla ice cream.",
    "price": 6.75,
    "category": "desserts",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "cd_choc_melt",
    "name": "Chocolate Melt Cookie Dough",
    "description": "Served warm with vanilla ice cream.",
    "price": 7.20,
    "category": "desserts",
    "image": "/assets/placeholder.png",
    "popular": true
  },
  // ─── ICE CREAM ───
  {
    "id": "ic_single",
    "name": "Single Scoop",
    "description": "One scoop of our delicious ice cream. (Extra toppings +79p, Chocolate Syrup +99p)",
    "price": 2.99,
    "category": "desserts",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "ic_double",
    "name": "Two Scoops",
    "description": "Two scoops of our delicious ice cream. (Extra toppings +79p, Chocolate Syrup +99p)",
    "price": 4.99,
    "category": "desserts",
    "image": "/assets/placeholder.png",
    "popular": true
  },
  {
    "id": "ic_triple",
    "name": "Three Scoops",
    "description": "Three scoops of our delicious ice cream. (Extra toppings +79p, Chocolate Syrup +99p)",
    "price": 6.49,
    "category": "desserts",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  // ─── HOT DRINKS ───
  {
    "id": "hd_kadak_chai",
    "name": "Kadak Chai",
    "description": "Strong, familiar, and deeply comforting. The kind of chai that slows everything down.",
    "price": 2.75,
    "category": "drinks",
    "image": "/assets/placeholder.png",
    "popular": true
  },
  {
    "id": "hd_espresso",
    "name": "Espresso (Double Shot)",
    "description": "Rich double-shot espresso.",
    "price": 3.35,
    "category": "drinks",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "hd_americano",
    "name": "Americano",
    "description": "Classic espresso with hot water.",
    "price": 3.25,
    "category": "drinks",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "hd_latte",
    "name": "Latte",
    "description": "Smooth espresso with steamed milk.",
    "price": 3.95,
    "category": "drinks",
    "image": "/assets/placeholder.png",
    "popular": true
  },
  {
    "id": "hd_cappuccino",
    "name": "Cappuccino",
    "description": "Espresso with frothy steamed milk.",
    "price": 3.95,
    "category": "drinks",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "hd_mocha",
    "name": "Mocha",
    "description": "Rich espresso blended with chocolate and steamed milk.",
    "price": 5.10,
    "category": "drinks",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "hd_hot_chocolate",
    "name": "Hot Chocolate",
    "description": "Rich, creamy hot chocolate.",
    "price": 4.35,
    "category": "drinks",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  // ─── MILKSHAKES ───
  {
    "id": "ms_oreo",
    "name": "Oreo Shake",
    "description": "Creamy Oreo milkshake blended to perfection.",
    "price": 6.49,
    "category": "drinks",
    "image": "/assets/placeholder.png",
    "popular": true
  },
  {
    "id": "ms_biscoff",
    "name": "Biscoff Shake",
    "description": "Smooth, caramelised Biscoff milkshake.",
    "price": 6.49,
    "category": "drinks",
    "image": "/assets/placeholder.png",
    "popular": true
  },
  {
    "id": "ms_chocolate",
    "name": "Chocolate Shake",
    "description": "Rich chocolate milkshake.",
    "price": 6.49,
    "category": "drinks",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "ms_strawberry",
    "name": "Strawberry Shake",
    "description": "Fresh strawberry milkshake.",
    "price": 6.49,
    "category": "drinks",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "ms_pakistani_mango",
    "name": "Pakistani Mango Shake",
    "description": "Authentic Pakistani mango milkshake — rich and tropical.",
    "price": 6.99,
    "category": "drinks",
    "image": "/assets/placeholder.png",
    "popular": true
  },
  // ─── FRESH PRESSED JUICES (500ML) ───
  {
    "id": "fj_orange",
    "name": "Orange Glow",
    "description": "Juicy orange freshly squeezed with zesty vibe.",
    "price": 5.99,
    "category": "drinks",
    "image": "/assets/placeholder.png",
    "popular": true
  },
  {
    "id": "fj_pomegranate",
    "name": "Pomegranate Power",
    "description": "Sweet, rich pomegranate energy boost.",
    "price": 8.50,
    "category": "drinks",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "fj_carrot",
    "name": "Carrot Crush",
    "description": "Smooth, naturally sweet carrot juice.",
    "price": 5.49,
    "category": "drinks",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "fj_pineapple",
    "name": "Pineapple Pop",
    "description": "Made from tropical, juicy and refreshing pineapples.",
    "price": 6.49,
    "category": "drinks",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "fj_watermelon",
    "name": "Watermelon Wave",
    "description": "Light, cold, perfect for hot vibes.",
    "price": 6.49,
    "category": "drinks",
    "image": "/assets/placeholder.png",
    "popular": true
  },
  {
    "id": "fj_sugarcane",
    "name": "Sugarcane Chill",
    "description": "Fresh sugarcane with a hint of lemon — cool & crisp.",
    "price": 5.99,
    "category": "drinks",
    "image": "/assets/placeholder.png",
    "popular": true
  },
  // ─── MIX & GLOW (Fresh Blends) ───
  {
    "id": "mx_vitamin_c",
    "name": "Vitamin C Vibes",
    "description": "Carrot + orange + apple + beetroot — energizing and colourful.",
    "price": 6.49,
    "category": "drinks",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "mx_citrus_charge",
    "name": "Citrus Charge",
    "description": "Orange + carrot + lemon — bright and refreshing.",
    "price": 6.49,
    "category": "drinks",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "mx_ruby_rush",
    "name": "Ruby Rush",
    "description": "Pomegranate + orange + apple — sweet, rich & bold.",
    "price": 7.99,
    "category": "drinks",
    "image": "/assets/placeholder.png",
    "popular": true
  },
  {
    "id": "mx_tropical_mood",
    "name": "Tropical Mood",
    "description": "Pineapple + orange + watermelon — light and tropical.",
    "price": 6.99,
    "category": "drinks",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "mx_power_potion",
    "name": "Power Potion",
    "description": "Pomegranate + carrot + apple — natural energy.",
    "price": 7.99,
    "category": "drinks",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  // ─── WELLNESS SHOTS (60ML) ───
  {
    "id": "ws_green",
    "name": "Green Shot",
    "description": "Fresh greens and herbs.",
    "price": 3.49,
    "category": "drinks",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "ws_turmeric",
    "name": "Turmeric Shot",
    "description": "Turmeric, lemon, and spices.",
    "price": 3.49,
    "category": "drinks",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "ws_ginger",
    "name": "Ginger Shot",
    "description": "Fresh ginger with lemon.",
    "price": 3.49,
    "category": "drinks",
    "image": "/assets/placeholder.png",
    "popular": true
  },
  {
    "id": "ws_immune",
    "name": "Immune Booster",
    "description": "A mix of citrus, ginger, and herbs.",
    "price": 3.49,
    "category": "drinks",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  // ─── COLD BEVERAGES ───
  {
    "id": "cb_mint_margarita",
    "name": "Mint Margarita",
    "description": "Fresh mint, lemon juice, sugar, and crushed ice blended into a chilled drink.",
    "price": 5.99,
    "category": "drinks",
    "image": "/assets/placeholder.png",
    "popular": true
  },
  {
    "id": "cb_lemon_soda",
    "name": "Lemon Soda",
    "description": "Fresh lemon juice mixed with sugar, salt, and topped with fizzy soda.",
    "price": 4.99,
    "category": "drinks",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "cb_blue_lagoon",
    "name": "Blue Lagoon",
    "description": "Citrus juices mixed with blue syrup and soda.",
    "price": 6.49,
    "category": "drinks",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "cb_virgin_mojito",
    "name": "Virgin Mojito",
    "description": "Mint leaves, lime, sugar, and soda served over ice.",
    "price": 5.99,
    "category": "drinks",
    "image": "/assets/placeholder.png",
    "popular": true
  },
  {
    "id": "cb_strawberry_lemonade",
    "name": "Strawberry Lemonade",
    "description": "Strawberry puree mixed with lemon juice, sugar, and chilled water.",
    "price": 6.49,
    "category": "drinks",
    "image": "/assets/placeholder.png",
    "popular": false
  },
  {
    "id": "cb_passion_fruit",
    "name": "Passion Fruit",
    "description": "Tropical passion fruit blended and served cold.",
    "price": 6.49,
    "category": "drinks",
    "image": "/assets/placeholder.png",
    "popular": false
  }
];

export const BUILDER_CONFIG: BuilderConfig = {
  basePrice: 6.99,

  // Step 1: Base Milk — Rabri Milk is the only authentic option
  bases: [
    { id: 'b1', name: 'Rabri Milk', price: 0, description: 'Our signature slow-cooked sweetened milk — the traditional falooda foundation', tag: 'Traditional' },
  ],

  // Step 2: Falooda Noodles — the vermicelli layer
  noodles: [
    { id: 'n1', name: 'With Falooda Noodles', price: 0, description: 'Traditional thin cornstarch vermicelli', tag: 'Traditional' },
    { id: 'n2', name: 'Without Noodles', price: 0, description: 'Skip the noodles for a smoother texture' },
  ],

  // Step 3: Syrup — defines the colour and core flavour
  syrups: [
    { id: 's1', name: 'Rooh Afza', price: 0, description: 'The iconic rose syrup — sweet, floral, unmistakably falooda', tag: 'Traditional' },
    { id: 's2', name: 'No Syrup', price: 0, description: 'Let the Rabri milk and ice cream shine on their own' },
    { id: 's3', name: 'Pistachio Syrup', price: 0.50, description: 'Nutty, fragrant green drizzle', tag: 'Premium' },
    { id: 's4', name: 'Mango Syrup', price: 0.50, description: 'Sweet Alphonso-inspired tropical burst' },
    { id: 's5', name: 'Saffron Syrup', price: 1.00, description: 'Luxurious kesar-infused golden syrup', tag: 'Premium' },
  ],

  // Step 4: Ice Cream — Kulfi (traditional) vs Regular Ice Cream
  scoops: [
    { id: 'ic1', name: 'Malai Kulfi', price: 0, description: 'Dense, slow-cooked traditional frozen dessert — the authentic choice', tag: 'Traditional Kulfi' },
    { id: 'ic3', name: 'Pistachio Ice Cream', price: 0, description: 'Creamy pistachio-flavoured regular ice cream', tag: 'Ice Cream' },
    { id: 'ic4', name: 'Mango Ice Cream', price: 0, description: 'Sweet mango-flavoured regular ice cream', tag: 'Ice Cream' },
    { id: 'ic5', name: 'Vanilla Ice Cream', price: 0, description: 'Classic smooth vanilla', tag: 'Ice Cream' },
  ],

  // Step 5: Extras — jelly, sabja seeds, fruit layers (multi-select)
  extras: [
    { id: 'e1', name: 'Sabja Seeds', price: 0, description: 'Cooling, gelatinous basil seeds — a falooda signature', tag: 'Traditional' },
    { id: 'e2', name: 'Rose Jelly', price: 0.50, description: 'Soft rose-flavoured jelly cubes' },
    { id: 'e3', name: 'Mango Jelly', price: 0.50, description: 'Sweet mango-flavoured jelly cubes' },
    { id: 'e4', name: 'Strawberry Jelly', price: 0.50, description: 'Fresh strawberry-flavoured jelly cubes' },
  ],

  // Step 6: Toppings — crunchy garnishes (multi-select)
  toppings: [
    { id: 't1', name: 'Crushed Pistachios', price: 0.50, description: 'Crunchy pistachio shards', tag: 'Popular' },
    { id: 't2', name: 'Sliced Almonds', price: 0.50, description: 'Toasted almond flakes' },
    { id: 't3', name: 'Dried Rose Petals', price: 0.50, description: 'Fragrant edible rose petals' },
    { id: 't4', name: 'Tutti Frutti', price: 0.50, description: 'Colourful candied fruit pieces' },
    { id: 't5', name: 'Edible Gold Dust', price: 2.00, description: 'Pure 24k edible gold — for the ultimate luxury falooda', tag: 'Luxury' },
    { id: 't6', name: 'Vermicelli Crunch', price: 0.50, description: 'Crispy fried vermicelli topping' },
  ]
};

// ─── Chaat Builder Config ───
export interface ChaatBuilderConfig {
  basePrice: number;
  bases: { id: string; name: string; price: number; description: string; emoji: string }[];
  toppings: { id: string; name: string; price: number; description: string; emoji: string; default?: boolean; locked?: boolean }[];
  chutneys: { id: string; name: string; price: number; description: string; emoji: string; default?: boolean; locked?: boolean }[];
}

export const CHAAT_BUILDER_CONFIG: ChaatBuilderConfig = {
  basePrice: 6.49,
  bases: [
    { id: 'cb1', name: 'Samosa Chaat', price: 0, description: 'Crispy samosa pieces crushed and loaded with toppings', emoji: '🥟' },
    { id: 'cb2', name: 'Papri Chaat', price: 0, description: 'Crispy papri wafers layered with chickpeas and yoghurt', emoji: '🫓' },
  ],
  toppings: [
    { id: 'ct1', name: 'Chickpeas', price: 0, description: 'Boiled chana for texture', emoji: '🫘', default: true, locked: true },
    { id: 'ct2', name: 'Diced Onion', price: 0, description: 'Fresh crunchy onion', emoji: '🧅', default: true, locked: true },
    { id: 'ct3', name: 'Tomato', price: 0, description: 'Fresh diced tomato', emoji: '🍅', default: true, locked: true },
    { id: 'ct4', name: 'Yoghurt', price: 0, description: 'Creamy whipped dahi', emoji: '🥛', default: true, locked: true },
    { id: 'ct5', name: 'Pomegranate', price: 0, description: 'Sweet jewel-like seeds', emoji: '💎' },
    { id: 'ct6', name: 'Sev', price: 0, description: 'Crispy thin noodle strands', emoji: '🍜', default: true, locked: true },
    { id: 'ct7', name: 'Fresh Coriander', price: 0, description: 'Fragrant green garnish', emoji: '🌿', default: true, locked: true },
    { id: 'ct8', name: 'Chaat Masala', price: 0, description: 'Tangy spice blend', emoji: '✨', default: true, locked: true },
  ],
  chutneys: [
    { id: 'cc1', name: 'Tamarind Sauce', price: 0, description: 'Sweet and tangy brown sauce', emoji: '🟤', default: true },
    { id: 'cc2', name: 'Chilli Mint Sauce', price: 0, description: 'Spicy green sauce', emoji: '🟢', default: true },
    { id: 'cc4', name: 'Chilli Sauce', price: 0, description: 'Fiery hot red drizzle', emoji: '🔴' },
    { id: 'cc3', name: 'Mint Yoghurt', price: 0, description: 'Cool raita drizzle', emoji: '🫗' },
  ],
};

// ─── Breakfast Builder Config ───
export interface BreakfastBuilderConfig {
  basePrice: number;
  bases: { id: string; name: string; price: number; description: string; emoji: string }[];
  eggs: { id: string; name: string; price: number; description: string; emoji: string }[];
  breads: { id: string; name: string; price: number; description: string; emoji: string }[];
  addons: { id: string; name: string; price: number; description: string; emoji: string }[];
  removals: { id: string; name: string; price: number; description: string; emoji: string }[];
}

export const BREAKFAST_BUILDER_CONFIG: BreakfastBuilderConfig = {
  basePrice: 8.95,
  bases: [
    { id: 'bb1', name: 'Full English', price: 3.00, description: '2 sausages, 2 Beef Bacon (Halal) rashers, 2 eggs, 2 hash browns, grilled tomatoes, mushrooms, baked beans.', emoji: '🍳' },
    { id: 'bb2', name: 'Full Vegetarian', price: 0, description: 'Veggie sausage, hash browns, beans, mushrooms', emoji: '🌱' },
    { id: 'bb3', name: 'Egg Shakshuka', price: 0, description: 'Eggs poached in a spiced tomato and pepper sauce', emoji: '🥘' },
    { id: 'bb4', name: 'Build from Scratch', price: -3.00, description: 'Start with just your eggs and bread', emoji: '🛠️' },
  ],
  eggs: [
    { id: 'be1', name: 'Fried Eggs', price: 0, description: 'Sunny side up', emoji: '🍳' },
    { id: 'be2', name: 'Scrambled Eggs', price: 0, description: 'Soft and buttery', emoji: '🥣' },
    { id: 'be3', name: 'Poached Eggs', price: 0, description: 'Classic soft poach', emoji: '🥚' },
    { id: 'be4', name: 'Omelette', price: 0, description: 'Plain folded omelette', emoji: '🥞' },
  ],
  breads: [
    { id: 'bbd1', name: 'White Toast', price: 0, description: 'Buttered slice', emoji: '🍞' },
    { id: 'bbd2', name: 'Brown Toast', price: 0, description: 'Buttered slice', emoji: '🍞' },
    { id: 'bbd5', name: 'No Bread', price: 0, description: 'Keep it low-carb', emoji: '❌' },
  ],
  addons: [
    { id: 'ba1', name: 'Extra Sausage', price: 1.00, description: 'One extra premium sausage', emoji: '🌭' },
    { id: 'ba2', name: 'Hash Brown', price: 1.00, description: 'One extra crispy hash brown', emoji: '🥔' },
    { id: 'ba3', name: 'Smashed Avocado', price: 1.50, description: 'Freshly smashed seasoned avocado', emoji: '🥑' },
    { id: 'ba4', name: 'Extra Beef Bacon (Halal)', price: 1.00, description: 'One extra rasher', emoji: '🥓' },
    { id: 'ba5', name: 'Chana Masala', price: 1.00, description: 'Spiced chickpeas', emoji: '🍛' },
  ],
  removals: [
    { id: 'br1', name: 'No Sausage', price: 0, description: 'Remove sausage', emoji: '🌭' },
    { id: 'br2', name: 'No Beef Bacon', price: 0, description: 'Remove Beef Bacon (Halal)', emoji: '🥓' },
    { id: 'br3', name: 'No Hash Browns', price: 0, description: 'Remove hash browns', emoji: '🥔' },
    { id: 'br4', name: 'No Beans', price: 0, description: 'Remove beans', emoji: '🥫' },
    { id: 'br5', name: 'No Mushrooms', price: 0, description: 'Remove mushrooms', emoji: '🍄' },
    { id: 'br6', name: 'No Tomato', price: 0, description: 'Remove grilled tomato', emoji: '🍅' },
  ]
};

export const ROADMAP_QUESTIONS = [
  { id: 1, category: 'Infrastructure', question: 'Do you have a preferred local network setup for the POS printers?', status: 'Pending' },
  { id: 2, category: 'Operations', question: 'What are the specific delivery radius zones and pricing tiers?', status: 'Pending' },
  { id: 3, category: 'Integration', question: 'Do we need to migrate existing customer data from a previous system?', status: 'Pending' },
  { id: 4, category: 'Hardware', question: 'Are you using tablets or dedicated POS terminals for the staff?', status: 'Pending' }
];
