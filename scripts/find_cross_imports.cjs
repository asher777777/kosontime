const fs = require('fs');
const path = require('path');

const modolsDir = path.join(__dirname, '../src/modols');
const modules = fs.readdirSync(modolsDir).filter(f => {
  const p = path.join(modolsDir, f);
  return fs.statSync(p).isDirectory() && f !== 'KOSDESYN' && f !== 'workbench';
});

function getFiles(dir) {
  let res = [];
  for (const f of fs.readdirSync(dir)) {
    if (['node_modules', 'dist', 'dev-dist', 'scripts'].includes(f)) continue;
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) res = res.concat(getFiles(p));
    else if (/\.(ts|tsx)$/.test(f)) res.push(p);
  }
  return res;
}

const crossImports = [];

for (const mod of modules) {
  const modFiles = getFiles(path.join(modolsDir, mod));
  for (const file of modFiles) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    const importRegex = /(?:import|export)\s+(?:(?:\*|[a-zA-Z0-9_{},\s*]+)\s+from\s+)?['"]([^'"]+)['"]/gm;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const imp = match[1];
      for (const otherMod of modules) {
        if (otherMod === mod) continue;
        if (imp.includes('/' + otherMod) || imp.endsWith('/' + otherMod)) {
          crossImports.push({
            fromMod: mod,
            toMod: otherMod,
            file: path.relative(path.join(__dirname, '..'), file).replace(/\\/g, '/'),
            imp
          });
        }
      }
    }
  }
}

console.log('Total cross-module direct imports found:', crossImports.length);
for (const ci of crossImports) {
  console.log(`[${ci.fromMod} -> ${ci.toMod}] in ${ci.file}:\n   "${ci.imp}"`);
}
