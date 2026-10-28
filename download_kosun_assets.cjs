const https = require('https');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public', 'cloudstore');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const assets = [
  { name: 'kosun_hero.webp', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80' },
  { name: 'kosun_logo.webp', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80' },
  { name: 'kosun_product_1.webp', url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80' },
  { name: 'kosun_product_2.webp', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80' },
  { name: 'kosun_product_3.webp', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80' },
  { name: 'kosun_product_4.webp', url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80' },
];

function download(item) {
  return new Promise((resolve, reject) => {
    const dest = path.join(dir, item.name);
    const file = fs.createWriteStream(dest);
    https.get(item.url, res => {
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('Downloaded:', item.name);
        resolve();
      });
    }).on('error', err => {
      fs.unlink(dest, () => {});
      console.error('Error downloading:', item.name, err.message);
      reject(err);
    });
  });
}

async function run() {
  for (const a of assets) {
    await download(a);
  }
  console.log('All KOSUN webp assets saved to public/cloudstore/');
}
run();
