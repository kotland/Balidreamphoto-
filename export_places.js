
const fs = require('fs');
eval(fs.readFileSync('places.js', 'utf8'));
fs.writeFileSync('places.json', JSON.stringify(PLACES, null, 2));
