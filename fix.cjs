const fs = require('fs');
let c = fs.readFileSync('src/constants.ts', 'utf8');
c = c.replace(/"category":\s*"(lunch|chaat|salad|sides)"/g, '"category": "starters"');
c = c.replace(/"category":\s*"(dessert|cake|signature_desserts|ice_cream)"/g, '"category": "desserts"');
c = c.replace(/"category":\s*"(hot_drinks|milkshakes|fresh_juice|juice_blends|wellness_shots|cold_beverages|beverage|mocktails)"/g, '"category": "drinks"');
c = c.replace(/"category":\s*"(breads)"/g, '"category": "naan_breads"');
fs.writeFileSync('src/constants.ts', c);
