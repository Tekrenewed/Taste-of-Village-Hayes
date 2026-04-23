const fs = require('fs');
let c = fs.readFileSync('src/constants.ts', 'utf8');
c = c.replace(/"category":\s*"(falooda|sweet_breakfast)"/g, '"category": "desserts"');
c = c.replace(/"category":\s*"(english_breakfast|desi_breakfast)"/g, '"category": "starters"');
c = c.replace(/"category":\s*"(breakfast_drinks)"/g, '"category": "drinks"');
fs.writeFileSync('src/constants.ts', c);
