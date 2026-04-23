const fs = require('fs');
let c = fs.readFileSync('src/constants.ts', 'utf8');
let matches = c.match(/"category":\s*"([^"]+)"/g);
let unique = [...new Set(matches)];
console.log(unique);
