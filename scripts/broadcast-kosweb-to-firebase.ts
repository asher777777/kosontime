import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { doc, setDoc } from 'firebase/firestore';
import { comonaDb, kosunDb } from '../src/lib/firebase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function broadcastKosWebToFirebase() {
  console.log('\n🚀 [KOSWEBAI Broadcaster] מתחיל שידור קולקציית KOSWEBAI ל-Firebase Firestore...');

  const jsonPath = path.resolve(__dirname, '../KOSUN2026/factory/data/kos_web_ai_collection_master.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ שגיאה: הקובץ לא נמצא בנתיב: ${jsonPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(jsonPath, 'utf-8');
  const masterData = JSON.parse(raw);
  const { _metadata, audiences, functions, sectionsCatalog, blueprintsCatalog } = masterData;

  console.log(`📦 קולקציה: ${_metadata.displayName} (גרסה ${_metadata.version})`);
  console.log(`🎯 פונקציות: ${functions.length} | מקטעים: ${sectionsCatalog.length} | תבניות: ${blueprintsCatalog.length}`);
  console.log(`👥 מצבי קהל יעד נתמכים: ${Object.keys(audiences).join(', ')}`);

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
      // 1. שידור מסמך המאסטר המלא: system_collections/kos_web_ai
      const masterDocRef = doc(db, 'system_collections', 'kos_web_ai');
      await setDoc(masterDocRef, {
        _metadata,
        metadata: {
          ..._metadata,
          syncedAt: new Date().toISOString()
        },
        audiences,
        functions,
        sectionsCatalog,
        blueprintsCatalog
      }, { merge: true });
      console.log(`   ✓ נשמר בהצלחה: system_collections/kos_web_ai`);

      // 2. שידור קטלוג המקטעים בנפרד: system_collections/kos_web_ai_sections
      const sectionsDocRef = doc(db, 'system_collections', 'kos_web_ai_sections');
      await setDoc(sectionsDocRef, {
        updatedAt: new Date().toISOString(),
        totalSections: sectionsCatalog.length,
        sections: sectionsCatalog
      }, { merge: true });
      console.log(`   ✓ נשמר בהצלחה: system_collections/kos_web_ai_sections`);

      // 3. שידור תבניות הבלופרינט בנפרד: system_collections/kos_web_ai_blueprints
      const blueprintsDocRef = doc(db, 'system_collections', 'kos_web_ai_blueprints');
      await setDoc(blueprintsDocRef, {
        updatedAt: new Date().toISOString(),
        totalBlueprints: blueprintsCatalog.length,
        blueprints: blueprintsCatalog
      }, { merge: true });
      console.log(`   ✓ נשמר בהצלחה: system_collections/kos_web_ai_blueprints`);

      // 4. שידור מצבי קהל היעד לקונפיגורציית הטננט הראשי: tenants/kosun/page_configs/kos_web_ai
      const tenantDocRef = doc(db, 'tenants', 'kosun', 'page_configs', 'kos_web_ai');
      await setDoc(tenantDocRef, {
        updatedAt: new Date().toISOString(),
        version: _metadata.version,
        audiences,
        functions,
        guestFunctions: functions.filter((f: any) => f.guestAvailable || f.audience === 'guest' || f.audience === 'both'),
        userFunctions: functions.filter((f: any) => f.userAvailable || f.audience === 'user' || f.audience === 'both')
      }, { merge: true });
      console.log(`   ✓ שודר בהצלחה לטננט: tenants/kosun/page_configs/kos_web_ai`);

    } catch (err: any) {
      console.error(`❌ שגיאה בשידור למסד ${name}:`, err.message || err);
    }
  }

  console.log('\n✨ [KOSWEBAI Broadcaster] השידור ל-Firebase הסתיים בהצלחה מלאה!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 סך הכל פונקציות ששודרו: ${functions.length}`);
  console.log(`🧩 סך הכל מקטעים ששודרו: ${sectionsCatalog.length}`);
  console.log(`📑 סך הכל תבניות ששודרו: ${blueprintsCatalog.length}`);
  console.log(`⏱️ זמן סיום: ${new Date().toLocaleString('he-IL')}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  process.exit(0);
}

broadcastKosWebToFirebase();
