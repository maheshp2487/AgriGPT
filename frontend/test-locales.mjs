import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const loadLocale = (lang) => JSON.parse(fs.readFileSync(path.join(__dirname, 'src', 'locales', `${lang}.json`), 'utf8'));

const en = loadLocale('en');
const ta = loadLocale('ta');
const hi = loadLocale('hi');
const te = loadLocale('te');
const kn = loadLocale('kn');
const ml = loadLocale('ml');
const pa = loadLocale('pa');
const mr = loadLocale('mr');
const bn = loadLocale('bn');

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
  { name: 'Punjabi', data: pa, expectedPrefix: 'ਐਗਰੀ' },
  { name: 'Marathi', data: mr, expectedPrefix: 'ॲग्री' },
  { name: 'Bengali', data: bn, expectedPrefix: 'এগ্রি' },
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

console.log('\n✓ All 9 Indic language catalogs passed 100% key parity & Unicode assertions!');
