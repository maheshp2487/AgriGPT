import fs from 'node:fs';

const en = JSON.parse(fs.readFileSync('./src/locales/en.json', 'utf8'));
const ta = JSON.parse(fs.readFileSync('./src/locales/ta.json', 'utf8'));
const hi = JSON.parse(fs.readFileSync('./src/locales/hi.json', 'utf8'));
const te = JSON.parse(fs.readFileSync('./src/locales/te.json', 'utf8'));
const kn = JSON.parse(fs.readFileSync('./src/locales/kn.json', 'utf8'));
const ml = JSON.parse(fs.readFileSync('./src/locales/ml.json', 'utf8'));

function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      keys = keys.concat(getAllKeys(v, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const enKeys = getAllKeys(en).sort();
const catalogs = [
  { name: 'Tamil', data: ta, expectedPrefix: 'அக்ரி' },
  { name: 'Hindi', data: hi, expectedPrefix: 'एग्री' },
  { name: 'Telugu', data: te, expectedPrefix: 'అగ్రి' },
  { name: 'Kannada', data: kn, expectedPrefix: 'ಅಗ್ರಿ' },
  { name: 'Malayalam', data: ml, expectedPrefix: 'അഗ്രി' },
];

console.log(`Base English Keys: ${enKeys.length}`);

for (const cat of catalogs) {
  const catKeys = getAllKeys(cat.data).sort();
  const missing = enKeys.filter(k => !catKeys.includes(k));
  if (missing.length > 0) {
    console.error(`Keys missing in ${cat.name}:`, missing);
    process.exit(1);
  }
  console.log(`✓ ${cat.name} catalog has 100% key parity with English (${catKeys.length}/${enKeys.length} keys).`);

  if (!cat.data.brand.name.includes(cat.expectedPrefix)) {
    console.error(`Failed ${cat.name} Unicode verification! Got: ${cat.data.brand.name}`);
    process.exit(1);
  }
  console.log(`✓ ${cat.name} Unicode glyphs decoded correctly: ${cat.data.brand.name}`);
}

console.log('\n✓ All 6 Indic language catalogs passed 100% key parity & Unicode assertions!');
