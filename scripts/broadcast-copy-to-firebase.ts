import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { doc, setDoc } from 'firebase/firestore';
import { comonaDb, kosunDb } from '../src/lib/firebase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function broadcastCopyToFirebase() {
  console.log('\n🚀 [KOSUN Copy Broadcaster] מתחיל שידור קולקציית הקופי ל-Firebase...');
  
  // 1. קריאת קובץ ה-JSON המרכזי
  const jsonPath = path.resolve(__dirname, '../KOSUN2026/factory/data/kosun_copy_master.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ שגיאה: הקובץ לא נמצא בנתיב: ${jsonPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(jsonPath, 'utf-8');
  const masterData = JSON.parse(raw);
  const { _metadata, terms } = masterData;

  const termKeys = Object.keys(terms);
  console.log(`📦 נטענו ${termKeys.length} מונחים מתוך גרסה ${_metadata.version} (${_metadata.lastUpdated})`);
  console.log(`🎯 ארכיטיפי שוק נתמכים: ${_metadata.supportedArchetypes.join(', ')}`);

  const databases = [
    { name: 'COMONA (GlowManage)', db: comonaDb },
    { name: 'KOSUN (Applet DB)', db: kosunDb }
  ];

  for (const { name, db } of databases) {
    if (!db) {
      console.warn(`⚠️ [${name}] לא מחובר, מדלג...`);
      continue;
    }
    console.log(`\n📡 משדר למסד הנתונים: ${name}...`);

    try {
      // 1. שידור מסמך המאסטר המלא של כל המונחים: system_collections/terminology
      const masterDocRef = doc(db, 'system_collections', 'terminology');
      await setDoc(masterDocRef, {
        metadata: {
          ..._metadata,
          syncedAt: new Date().toISOString()
        },
        terms: terms
      }, { merge: true });
      console.log(`   ✓ נשמר בהצלחה: system_collections/terminology`);

      // 2. פירוק ושידור מסמך ייעודי לכל ארכיטיפ שוק: market_archetypes/{archetypeId}
      for (const arch of _metadata.supportedArchetypes) {
        const archTerms: Record<string, string> = {};
        for (const [key, item] of Object.entries(terms) as any) {
          archTerms[key] = (item.archetypeOverrides && item.archetypeOverrides[arch]) || item.systemDefault;
        }

        const archDocRef = doc(db, 'market_archetypes', arch);
        await setDoc(archDocRef, {
          archetypeId: arch,
          updatedAt: new Date().toISOString(),
          termsCount: Object.keys(archTerms).length,
          terms: archTerms
        }, { merge: true });
        console.log(`   ✓ שודר ארכיטיפ שוק: market_archetypes/${arch} (${Object.keys(archTerms).length} מונחים)`);
      }

      // 3. שידור דריסת ברירת מחדל לטננט הראשי (kosun): tenants/kosun/page_configs/terminology
      const tenantDocRef = doc(db, 'tenants', 'kosun', 'page_configs', 'terminology');
      await setDoc(tenantDocRef, {
        updatedAt: new Date().toISOString(),
        version: _metadata.version,
        terms: terms
      }, { merge: true });
      console.log(`   ✓ שודר קונפיגורציית עמוד לטננט: tenants/kosun/page_configs/terminology`);

    } catch (err: any) {
      console.error(`❌ שגיאה בשידור למסד ${name}:`, err.message || err);
    }
  }

  console.log('\n✨ [KOSUN Copy Broadcaster] השידור הסתיים בהצלחה מלאה!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 סך הכל מונחים שודרו: ${termKeys.length}`);
  console.log(`🌐 ארכיטיפים שנוצרו ב-Firestore: ${_metadata.supportedArchetypes.length}`);
  console.log(`⏱️ זמן סיום: ${new Date().toLocaleString('he-IL')}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  process.exit(0);
}

broadcastCopyToFirebase();
