const fs = require('fs');
const path = require('path');

const NEW_MENU_RAW = [
  // DESI HANDI
  { name: 'Chana Masala', price: 5.99, category: 'curries' },
  { name: 'Muttar Paneer', price: 7.49, category: 'curries' },
  { name: 'Aloo Gobi', price: 5.00, category: 'curries' },
  { name: 'Saag Paneer', price: 7.49, category: 'curries' },
  { name: 'Tadka Daal', price: 5.00, category: 'curries' },
  { name: 'Chana Daal', price: 5.00, category: 'curries' },
  { name: 'Kidney Beans (Rajma)', price: 5.00, category: 'curries' },
  { name: 'Bhindi', price: 7.49, category: 'curries' },
  { name: 'Daal Makhni', price: 7.49, category: 'curries' },
  { name: 'Mushroom Karahi', price: 7.99, category: 'karahi' },
  { name: 'Kadhi Pakoda', price: 6.99, category: 'curries' },
  { name: 'Paneer Tikka Masala', price: 8.49, category: 'curries' },

  // KARAHI E KHAAS
  { name: 'Shinwari Chicken (1/2KG)', price: 19.99, category: 'karahi' },
  { name: 'Shinwari Chicken (1KG)', price: 26.99, category: 'karahi' },
  { name: 'Lamb Charsi Karahi (1/2KG)', price: 24.99, category: 'karahi' },
  { name: 'Lamb Charsi Karahi (1KG)', price: 37.00, category: 'karahi' },
  { name: 'White Chicken Karahi (1/2KG)', price: 19.99, category: 'karahi' },
  { name: 'White Chicken Karahi (1KG)', price: 26.99, category: 'karahi' },
  { name: 'Kebab Masala', price: 14.99, category: 'karahi' },
  { name: 'Tawa Fish Karahi', price: 14.99, category: 'karahi' },

  // TASTE OF VILLAGE WEEKEND SPECIALS
  { name: 'Chicken Pulao', price: 7.49, category: 'specials' },
  { name: 'Halwa Puri', price: 7.49, category: 'specials' },
  { name: 'Fruit Chaat (Regular)', price: 5.99, category: 'specials' },
  { name: 'Fruit Chaat (Large)', price: 7.99, category: 'specials' },
  { name: 'Cholay Bhaturay', price: 7.99, category: 'specials' },

  // CURRIES/SAALAN SE
  { name: 'Lamb Nihari', price: 11.49, category: 'curries' },
  { name: 'Lamb Karahi (On the bone)', price: 9.49, category: 'karahi' },
  { name: 'Lamb Haleem', price: 9.49, category: 'curries' },
  { name: 'Lamb Paya', price: 9.49, category: 'curries' },
  { name: 'Lamb Curry', price: 9.99, category: 'curries' },
  { name: 'Lamb Qeema', price: 8.99, category: 'curries' },
  { name: 'Daal Gosht', price: 9.49, category: 'curries' },
  { name: 'Saag Gosht', price: 9.49, category: 'curries' },
  { name: 'Chicken Curry (Boneless)', price: 8.49, category: 'curries' },
  { name: 'Chana Chicken', price: 8.49, category: 'curries' },
  { name: 'Chicken Karahi', price: 8.49, category: 'karahi' },
  { name: 'Chilli Chicken', price: 8.49, category: 'curries' },
  { name: 'Saag Chicken', price: 8.49, category: 'curries' },
  { name: 'Butter Chicken', price: 8.49, category: 'curries' },
  { name: 'Chicken Tikka Masala', price: 9.99, category: 'curries' },
  { name: 'Achari Chicken', price: 8.99, category: 'curries' },
  { name: 'Chicken Jalfrezi', price: 8.99, category: 'curries' },

  // TALA'A HUA ZAIQAH
  { name: 'Talii Hui Machli (1PC)', price: 8.49, category: 'starters' },
  { name: 'Chaplii Kebab Chicken', price: 4.99, category: 'starters' },
  { name: 'Chaplii Kebab Lamb', price: 6.49, category: 'starters' },
  { name: 'Aloo Tikki (3PC)', price: 4.49, category: 'starters' },
  { name: 'Sam-o-say (3PC)', price: 4.49, category: 'starters' },
  { name: 'Chicken Pakoras (1/2KG)', price: 9.49, category: 'starters' },
  { name: 'Chicken Pakoras (1KG)', price: 17.49, category: 'starters' },
  { name: 'Talii Fish Pakora (1/4KG)', price: 5.49, category: 'starters' },
  { name: 'Talii Fish Pakora (1/2KG)', price: 8.99, category: 'starters' },
  { name: 'Talii Fish Pakora (1KG)', price: 17.49, category: 'starters' },

  // NAAN N ROTI
  { name: 'Roti', price: 0.99, category: 'bread' },
  { name: 'Naan', price: 0.99, category: 'bread' },
  { name: 'Ajwain Naan', price: 1.99, category: 'bread' },
  { name: 'Zeera Naan', price: 1.99, category: 'bread' },
  { name: 'Garlic', price: 1.99, category: 'bread' },
  { name: 'Garlic and Chilli Naan', price: 2.49, category: 'bread' },
  { name: 'Cheese Garlic Naan', price: 2.99, category: 'bread' },
  { name: 'Cheese Naan', price: 3.79, category: 'bread' },
  { name: 'Qeema Naan', price: 4.79, category: 'bread' },
  { name: 'Chilli Naan', price: 1.99, category: 'bread' },

  // LAHORI / AMRITSARI KULCHAS
  { name: 'Plain Kulcha', price: 2.49, category: 'bread' },
  { name: 'Onion Kulcha', price: 3.49, category: 'bread' },
  { name: 'Paneer Kulcha', price: 3.99, category: 'bread' },
  { name: 'Aalo Kulcha', price: 3.49, category: 'bread' },
  { name: 'Gobi Kulcha', price: 3.49, category: 'bread' },
  { name: 'Mix Kulcha', price: 3.99, category: 'bread' },

  // PARATHA
  { name: 'Lachha Paratha', price: 2.49, category: 'bread' },
  { name: 'Tandoori Paratha', price: 2.49, category: 'bread' },
  { name: 'Aloo Stuffed Paratha', price: 3.49, category: 'bread' },
  { name: 'Gobi Stuffed Paratha', price: 3.49, category: 'bread' },
  { name: 'Paneer Paratha', price: 3.99, category: 'bread' },
  { name: 'Mooli Stuffed Paratha', price: 3.99, category: 'bread' },
  { name: 'Mixed Paratha', price: 3.99, category: 'bread' },
  { name: 'Cheese Stuffed Paratha', price: 3.99, category: 'bread' },
  { name: 'Chicken Cheese Paratha', price: 4.99, category: 'bread' },
  { name: 'Anda Paratha', price: 4.99, category: 'bread' },

  // VILLAGE SPECIAL PLATTERS
  { name: 'Village Special Platter (Serves 2)', price: 19.99, description: '1 Chicken Biryani, 2 Pcs Kebab (Lamb), 2 Naan, Raita, Salad, Chana Daal', category: 'platters' },
  { name: 'Village Special Platter (Serves 4)', price: 29.99, description: 'Veg Pulao, Chicken Karahi, 2 Kulcha, 2 Roti, Raita, Salad, 1.5L Drink, 2 Kheer', category: 'platters' },
  
  // RICE PLATTERS
  { name: 'Rice Platter (Serves 2)', price: 24.99, description: 'Pilau Rice, 4pc Kebab, 1 Skewer Chicken Tikka, 1 Chapal Kebab, Mint Sauce, Chilli Sauce, Sweet Sauce, Salad, 2 Can Drinks', category: 'platters' },

  // BRUNCH
  { name: 'Village Rice Brunch Offer', price: 7.99, description: 'Pilau Rice, 2 Shami Kebab, Can Drink (From 12pm to 3pm)', category: 'brunch' },
  { name: 'Village Brunch Special (Mon-Thu)', price: 19.99, description: 'Pilau Rice, 4pc Kebab, 1 Skewer Chicken Tikka, 1 Chapal Kebab, Mint Sauce, Chilli Sauce, Sweet Sauce, Salad, 2 Can Drinks', category: 'brunch' },
  { name: 'Weekend Brunch (Fri-Sun)', price: 19.99, description: '2 Puri, Halwa, Chana Masala, Aloo Gobi or Tarka Dal, 2 Naan, 1 Can, 1 Lassi, Salad & Raita (Serves 2-3 Persons)', category: 'brunch' },

  // DESSERTS
  { name: 'Gajar Halwa (Regular)', price: 3.49, category: 'desserts' },
  { name: 'Gajar Halwa (Medium)', price: 6.99, category: 'desserts' },
  { name: 'Gajar Halwa (Large)', price: 8.99, category: 'desserts' },
  { name: 'Gajar Halwa with 2pc Gulab Jamun', price: 4.99, category: 'desserts' },
  { name: 'Gulab Jamun (3PC)', price: 2.99, category: 'desserts' },
  { name: 'Gulab Jamun (1/2 KG)', price: 8.98, category: 'desserts' },
  { name: 'Gulab Jamun (1KG)', price: 16.99, category: 'desserts' },
  { name: 'Ras Malai (2PC)', price: 2.99, category: 'desserts' },
  { name: 'Kheer', price: 2.99, category: 'desserts' },
  { name: 'Gulab Jamun (2PC) with Kulfi, Pistachio or Mango Ice Cream', price: 3.99, category: 'desserts' },
  { name: 'Sooji Halwa (Weekend Only)', price: 2.99, category: 'desserts' },
  { name: 'Gajar Halwa Rabri', price: 5.99, category: 'desserts' },
  { name: 'Gulab Jamun (3PC) with Rabri & Gajar Halwa', price: 4.99, category: 'desserts' },

  // BBQ / TANDOORI SE
  { name: 'Kebab (1PC)', price: 2.00, category: 'bbq' },
  { name: 'Lamb Seekh Kebab (4PC)', price: 6.49, category: 'bbq' },
  { name: 'Lamb Tikka (1 Skewer)', price: 7.99, category: 'bbq' },
  { name: 'Lamb Chops (4PC)', price: 7.99, category: 'bbq' },
  { name: 'Chilli Paneer', price: 7.49, category: 'bbq' },
  { name: 'Chicken Wings (5PC)', price: 6.99, category: 'bbq' },
  { name: 'Chicken Tikka', price: 7.49, category: 'bbq' },
  { name: 'Malai Tikka', price: 7.49, category: 'bbq' },
  { name: 'Paneer Tikka (1 Skewer)', price: 6.99, category: 'bbq' },
  { name: 'Haryali Tikka', price: 7.49, category: 'bbq' },

  // BBQ PLATTERS
  { name: 'Mughlai Khaas', price: 59.49, description: 'Mughlai chicken tikka, 4pc kebab, 4pc lamb chops, lamb tikka, 4pc haryali tikka, malai tikka, chicken wings, 2 naan, salad, mint sauce, chilli sauce, 1.5L drink.', category: 'platters' },
  { name: 'Murgh Nashist', price: 29.49, description: '1 Chicken tikka, 2pc kebab, lamb tikka, 2pc lamb chops, salad, mint sauce, chilli sauce, 1.5L drink and Rice or Naan.', category: 'platters' },
  { name: 'Tandoor E Khaas (Serves 2)', price: 18.49, description: '1 Chicken tikka, 2pc kebab, lamb tikka, 2pc lamb chops, salad, mint sauce, chilli sauce, 1.5L drink and Rice or Naan.', category: 'platters' },

  // BURGER & NOODLES
  { name: 'Desi Noodle Burger', price: 5.49, description: 'Aloo Tikki, Paneer Tikki, Veg Noodles, Salad & Sauces', category: 'burgers_noodles' },
  { name: 'Aloo Tikki Burger', price: 4.99, description: 'Bun, aloo tikki, salad & sauces', category: 'burgers_noodles' },
  { name: 'Paneer Tikki Burger', price: 4.99, description: 'Bun, paneer tikki, salad & sauces', category: 'burgers_noodles' },
  { name: 'Veggie Noodles', price: 6.49, description: 'Desi styled noodles stir fried with veggies & Sauces', category: 'burgers_noodles' },
  { name: 'Chicken Noodles', price: 7.49, description: 'Desi styled noodles stir fried with veggies, chicken & sauces', category: 'burgers_noodles' },

  // CHATKARA JUNCTION
  { name: 'Sev Puri (6PC)', price: 4.99, category: 'chaat' },
  { name: 'Sev Puri (12PC)', price: 8.99, category: 'chaat' },
  { name: 'Gol Gappe (6PC)', price: 4.99, category: 'chaat' },
  { name: 'Gol Gappe (12PC)', price: 8.99, category: 'chaat' },
  { name: 'Dahi Bhalla Chaat (Regular)', price: 4.99, category: 'chaat' },
  { name: 'Dahi Bhalla Chaat (Large)', price: 5.99, category: 'chaat' },
  { name: 'Papri Chaat (Regular)', price: 4.99, category: 'chaat' },
  { name: 'Papri Chaat (Large)', price: 5.99, category: 'chaat' },
  { name: 'Aloo Tikki Chaat (Regular)', price: 4.99, category: 'chaat' },
  { name: 'Aloo Tikki Chaat (Large)', price: 5.99, category: 'chaat' },
  { name: 'Mixed Chaat (Regular)', price: 5.49, category: 'chaat' },
  { name: 'Mixed Chaat (Large)', price: 6.49, category: 'chaat' },
  { name: 'Samosa Chaat (Regular)', price: 4.99, category: 'chaat' },
  { name: 'Samosa Chaat (Large)', price: 5.99, category: 'chaat' },

  // ROLLS
  { name: 'Kebab Roll', price: 6.49, description: 'A flavourful roll filled with juicy kebab, crunchy veggies, and tangy sauce.', category: 'rolls' },
  { name: 'Lamb Tikka Roll', price: 8.99, description: 'A flavourful roll filled with juicy lamb tikka, crunchy veggies, and tangy sauce.', category: 'rolls' },
  { name: 'Mixed Roll', price: 9.99, description: 'A flavourful roll filled with juicy mixed meat, crunchy veggies, and tangy sauce.', category: 'rolls' },
  { name: 'Chicken Tikka Roll', price: 8.49, description: 'A flavourful roll filled with juicy chicken tikka, crunchy veggies, and tangy sauce.', category: 'rolls' },
  { name: 'Paneer Tikka Roll', price: 7.49, description: 'A flavourful roll filled with juicy paneer tikka, crunchy veggies, and tangy sauce.', category: 'rolls' },

  // BIRYANI & RICE
  { name: 'Plain Rice', price: 4.49, category: 'rice' },
  { name: 'Vegetable Rice', price: 4.49, category: 'rice' },
  { name: 'Chicken Biryani', price: 6.49, category: 'rice' },
  { name: 'Lamb Biryani', price: 7.49, category: 'rice' },
  { name: 'Vegetable Biryani', price: 6.49, category: 'rice' },
  { name: 'Chicken Tikka Biryani', price: 8.99, category: 'rice' },
  { name: 'Chicken Pulao (Weekend Only)', price: 6.49, category: 'rice' },
  { name: 'Fried Rice', price: 5.99, category: 'rice' },
  { name: 'Chicken Fried Rice', price: 7.49, category: 'rice' },
];

let oldMenu = [];
try {
  oldMenu = JSON.parse(fs.readFileSync(path.join(__dirname, 'src', 'data', 'tov-menu.json'), 'utf8'));
} catch (e) {
  console.log('No old menu found or unparseable');
}

const finalMenu = NEW_MENU_RAW.map((item, index) => {
  // Try to find a matching image from the old menu
  let image = '/assets/placeholder.png';
  let desc = item.description || '';
  
  if (oldMenu.length > 0) {
    // Exact or partial name match
    const match = oldMenu.find(oldItem => 
      oldItem.name.toLowerCase() === item.name.toLowerCase() || 
      item.name.toLowerCase().includes(oldItem.name.toLowerCase()) ||
      oldItem.name.toLowerCase().includes(item.name.toLowerCase())
    );
    
    if (match) {
      if (match.image && match.image !== '/assets/placeholder.png') {
        image = match.image;
      }
      if (!desc && match.description) {
        desc = match.description; // steal description if we don't have one
      }
    }
  }

  return {
    id: `tov_v2_${index}`,
    name: item.name,
    description: desc,
    price: item.price,
    originalPrice: item.price,
    category: item.category,
    image: image,
    popular: false
  };
});

fs.writeFileSync(path.join(__dirname, 'src', 'data', 'tov-menu.json'), JSON.stringify(finalMenu, null, 2));
console.log(`Successfully generated new tov-menu.json with ${finalMenu.length} items`);
