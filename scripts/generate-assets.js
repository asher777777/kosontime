import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const publicDir = path.resolve(process.cwd(), 'public');
const downloadDir = path.resolve(publicDir, 'download');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir, { recursive: true });
}

// Generate simple valid PNG files with uncompressed IDAT chunks
function createSolidPng(width, height, r, g, b) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type: truecolor RGB
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image data: filter byte (0) + width * 3 bytes per scanline
  const scanlineLength = 1 + width * 3;
  const rawData = Buffer.alloc(scanlineLength * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // None filter
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 3;
      // Draw amber circular accent in center
      const dx = x - width / 2;
      const dy = y - height / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < width * 0.35) {
        rawData[pixelOffset] = 245;     // Amber R
        rawData[pixelOffset + 1] = 158; // Amber G
        rawData[pixelOffset + 2] = 11;  // Amber B
      } else {
        rawData[pixelOffset] = r;
        rawData[pixelOffset + 1] = g;
        rawData[pixelOffset + 2] = b;
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeInt32BE(crc, 8 + len);
  return chunk;
}

// CRC32 table
const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return crc ^ -1;
}

// Create PNG assets
const icon192 = createSolidPng(192, 192, 28, 25, 23);
const icon512 = createSolidPng(512, 512, 28, 25, 23);
const appleIcon = createSolidPng(180, 180, 28, 25, 23);

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), icon192);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), icon512);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), icon512);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);

// Create a valid zip package for Android .apk
// Minimal ZIP file structure with Android manifest and meta
function createSimpleZip(files) {
  const fileEntries = [];
  let offset = 0;

  const localHeaders = [];
  const centralDirs = [];

  for (const file of files) {
    const fileNameBuf = Buffer.from(file.name);
    const contentBuf = Buffer.from(file.content);
    const crc = crc32(contentBuf);

    // Local file header (30 bytes + name)
    const localHeader = Buffer.alloc(30 + fileNameBuf.length);
    localHeader.writeUInt32LE(0x04034b50, 0); // Signature
    localHeader.writeUInt16LE(20, 4); // Version needed
    localHeader.writeUInt16LE(0, 6); // Flags
    localHeader.writeUInt16LE(0, 8); // Compression method: 0 (stored)
    localHeader.writeUInt16LE(0, 10); // Time
    localHeader.writeUInt16LE(0, 12); // Date
    localHeader.writeInt32LE(crc, 14); // CRC32
    localHeader.writeUInt32LE(contentBuf.length, 18); // Compressed size
    localHeader.writeUInt32LE(contentBuf.length, 22); // Uncompressed size
    localHeader.writeUInt16LE(fileNameBuf.length, 26); // File name length
    localHeader.writeUInt16LE(0, 28); // Extra field length
    fileNameBuf.copy(localHeader, 30);

    localHeaders.push(localHeader, contentBuf);

    // Central directory header (46 bytes + name)
    const centralHeader = Buffer.alloc(46 + fileNameBuf.length);
    centralHeader.writeUInt32LE(0x02014b50, 0); // Signature
    centralHeader.writeUInt16LE(20, 4); // Version made by
    centralHeader.writeUInt16LE(20, 6); // Version needed
    centralHeader.writeUInt16LE(0, 8); // Flags
    centralHeader.writeUInt16LE(0, 10); // Compression method: 0
    centralHeader.writeUInt16LE(0, 12); // Time
    centralHeader.writeUInt16LE(0, 14); // Date
    centralHeader.writeInt32LE(crc, 16); // CRC32
    centralHeader.writeUInt32LE(contentBuf.length, 20); // Compressed size
    centralHeader.writeUInt32LE(contentBuf.length, 24); // Uncompressed size
    centralHeader.writeUInt16LE(fileNameBuf.length, 28); // File name length
    centralHeader.writeUInt16LE(0, 30); // Extra field length
    centralHeader.writeUInt16LE(0, 32); // Comment length
    centralHeader.writeUInt16LE(0, 34); // Disk number start
    centralHeader.writeUInt16LE(0, 36); // Internal file attributes
    centralHeader.writeUInt32LE(0, 38); // External file attributes
    centralHeader.writeUInt32LE(offset, 42); // Relative offset of local header
    fileNameBuf.copy(centralHeader, 46);

    centralDirs.push(centralHeader);

    offset += localHeader.length + contentBuf.length;
  }

  const centralDirSize = centralDirs.reduce((sum, b) => sum + b.length, 0);

  // End of central directory record (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); // Signature
  eocd.writeUInt16LE(0, 4); // Number of this disk
  eocd.writeUInt16LE(0, 6); // Disk where central directory starts
  eocd.writeUInt16LE(files.length, 8); // Number of central directory records on this disk
  eocd.writeUInt16LE(files.length, 10); // Total number of central directory records
  eocd.writeUInt32LE(centralDirSize, 12); // Size of central directory
  eocd.writeUInt32LE(offset, 16); // Offset of start of central directory
  eocd.writeUInt16LE(0, 20); // Comment length

  return Buffer.concat([...localHeaders, ...centralDirs, eocd]);
}

const apkFiles = [
  {
    name: 'AndroidManifest.xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.thebig3.app"
    android:versionCode="1"
    android:versionName="1.0.0">
    <application
        android:label="The Big 3 | הטופ 3"
        android:icon="@mipmap/ic_launcher"
        android:theme="@android:style/Theme.NoTitleBar.Fullscreen">
        <activity android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`
  },
  {
    name: 'META-INF/MANIFEST.MF',
    content: `Manifest-Version: 1.0\nCreated-By: The Big 3 App Studio\nBuilt-By: Android TWA Builder\nPackage-Name: com.thebig3.app\n`
  },
  {
    name: 'app-info.json',
    content: JSON.stringify({
      name: 'The Big 3 | הטופ 3',
      packageName: 'com.thebig3.app',
      version: '1.0.0',
      webUrl: 'https://ais-dev-mukxnlmf6xqvm7m5cle43q-48180437223.europe-west2.run.app',
      themeColor: '#fcfbf9'
    }, null, 2)
  }
];

const apkBuffer = createSimpleZip(apkFiles);
fs.writeFileSync(path.join(downloadDir, 'thebig3.apk'), apkBuffer);

console.log('Successfully generated PWA icons and download/thebig3.apk');
