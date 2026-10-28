const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'KOSUN2026', 'factory', 'data', 'kosun_copy_master.json');
const master = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Fix all terms that have 'default' / 'archetypes' to 'systemDefault' / 'archetypeOverrides'
for (const [key, term] of Object.entries(master.terms)) {
  if (term.default && !term.systemDefault) {
    term.systemDefault = term.default;
    delete term.default;
  }
  if (term.archetypes && !term.archetypeOverrides) {
    term.archetypeOverrides = term.archetypes;
    delete term.archetypes;
  }
  if (!term.id) term.id = key;
  if (!term.areaId) term.areaId = key.startsWith('sec_events') ? 'sec_eventsListing' : key.startsWith('sec_contact') ? 'sec_contact' : 'sec_general';
  if (!term.pageId) term.pageId = 'global';
}

master._metadata.totalTerms = Object.keys(master.terms).length;
master._metadata.lastUpdated = new Date().toISOString();

fs.writeFileSync(filePath, JSON.stringify(master, null, 2), 'utf8');
console.log('Fixed terms schema. Total terms count:', master._metadata.totalTerms);
