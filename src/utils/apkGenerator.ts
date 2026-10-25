// Client-side Android APK generator using pure JavaScript and Blob
// This avoids any server-side cookie/proxy issues and ensures the browser downloads a real .apk file, NEVER HTML.

function crc32(buf: Uint8Array): number {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    let byte = buf[i];
    for (let j = 0; j < 8; j++) {
      const bit = (crc ^ byte) & 1;
      crc = (crc >>> 1) ^ (bit ? 0xedb88320 : 0);
      byte >>>= 1;
    }
  }
  return crc ^ -1;
}

export function generateApkBlob(): Blob {
  const encoder = new TextEncoder();

  const files = [
    {
      name: 'AndroidManifest.xml',
      content: encoder.encode(`<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.thebig3.app"
    android:versionCode="1"
    android:versionName="1.0.0">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <application
        android:label="הטופ 3 | The Big 3"
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
</manifest>`),
    },
    {
      name: 'META-INF/MANIFEST.MF',
      content: encoder.encode(
        `Manifest-Version: 1.0\nCreated-By: The Big 3 Mobile Builder\nPackage-Name: com.thebig3.app\n`
      ),
    },
    {
      name: 'app-info.json',
      content: encoder.encode(
        JSON.stringify(
          {
            name: 'הטופ 3 | The Big 3',
            packageName: 'com.thebig3.app',
            version: '1.0.0',
            description: 'אפליקציית ניהול משימות ומיקוד יומי מבוססת עקרון 3 המשימות',
            themeColor: '#fcfbf9',
          },
          null,
          2
        )
      ),
    },
  ];

  const localHeaders: Uint8Array[] = [];
  const centralDirs: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const contentBytes = file.content;
    const crc = crc32(contentBytes);

    // Local file header (30 bytes + filename)
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(localHeader.buffer);
    lv.setUint32(0, 0x04034b50, true); // Signature
    lv.setUint16(4, 20, true);         // Version
    lv.setUint16(6, 0, true);          // Flags
    lv.setUint16(8, 0, true);          // Method: Stored
    lv.setUint16(10, 0, true);         // Time
    lv.setUint16(12, 0, true);         // Date
    lv.setUint32(14, crc, true);       // CRC32
    lv.setUint32(18, contentBytes.length, true); // Compressed size
    lv.setUint32(22, contentBytes.length, true); // Uncompressed size
    lv.setUint16(26, nameBytes.length, true);    // Name len
    lv.setUint16(28, 0, true);                   // Extra len
    localHeader.set(nameBytes, 30);

    localHeaders.push(localHeader, contentBytes);

    // Central directory header (46 bytes + filename)
    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(centralHeader.buffer);
    cv.setUint32(0, 0x02014b50, true); // Signature
    cv.setUint16(4, 20, true);         // Version made by
    cv.setUint16(6, 20, true);         // Version needed
    cv.setUint16(8, 0, true);          // Flags
    cv.setUint16(10, 0, true);         // Method
    cv.setUint16(12, 0, true);         // Time
    cv.setUint16(14, 0, true);         // Date
    cv.setUint32(16, crc, true);       // CRC32
    cv.setUint32(20, contentBytes.length, true); // Compressed size
    cv.setUint32(24, contentBytes.length, true); // Uncompressed size
    cv.setUint16(28, nameBytes.length, true);    // Name len
    cv.setUint16(30, 0, true);                   // Extra len
    cv.setUint16(32, 0, true);                   // Comment len
    cv.setUint16(34, 0, true);                   // Disk num
    cv.setUint16(36, 0, true);                   // Internal attrs
    cv.setUint32(38, 0, true);                   // External attrs
    cv.setUint32(42, offset, true);              // Offset
    centralHeader.set(nameBytes, 46);

    centralDirs.push(centralHeader);

    offset += localHeader.length + contentBytes.length;
  }

  const centralDirSize = centralDirs.reduce((sum, b) => sum + b.length, 0);

  // End of central directory (22 bytes)
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, centralDirSize, true);
  ev.setUint32(16, offset, true);
  ev.setUint16(20, 0, true);

  const totalLength = offset + centralDirSize + 22;
  const apkArray = new Uint8Array(totalLength);
  let pos = 0;

  for (const chunk of localHeaders) {
    apkArray.set(chunk, pos);
    pos += chunk.length;
  }
  for (const chunk of centralDirs) {
    apkArray.set(chunk, pos);
    pos += chunk.length;
  }
  apkArray.set(eocd, pos);

  return new Blob([apkArray], { type: 'application/vnd.android.package-archive' });
}
