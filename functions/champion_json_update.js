const fs = require('fs');
const filePath = '../src/assets/json/moba/champions.json';

// Read the JSON file
const jsonData = fs.readFileSync(filePath, 'utf8');
const data = JSON.parse(jsonData);

// Iterate over each object in the JSON data
Object.values(data).forEach(obj => {
  // Replace the existing synergies and counters properties with the new structure
  obj.synergies = {
    top: { s: [], a: [], b: [], c: [], d: [] },
    jungle: { s: [], a: [], b: [], c: [], d: [] },
    mid: { s: [], a: [], b: [], c: [], d: [] },
    adc: { s: [], a: [], b: [], c: [], d: [] },
    support: { s: [], a: [], b: [], c: [], d: [] }
  };
  obj.counters = {
    top: { s: [], a: [], b: [], c: [], d: [] },
    jungle: { s: [], a: [], b: [], c: [], d: [] },
    mid: { s: [], a: [], b: [], c: [], d: [] },
    adc: { s: [], a: [], b: [], c: [], d: [] },
    support: { s: [], a: [], b: [], c: [], d: [] }
  };
});

// Write the modified JSON data back to the file
fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
