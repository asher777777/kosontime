const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, getDoc } = require('firebase/firestore');

const kosunConfig = require('./firebase-applet-config.json');
const comonaConfig = require('./comona-firebase-config.json');

const kosunApp = initializeApp(kosunConfig, 'kosun');
const kosunDb = getFirestore(kosunApp, kosunConfig.firestoreDatabaseId);

const comonaApp = initializeApp(comonaConfig, 'comona');
const comonaDb = getFirestore(comonaApp);

async function check() {
  const tDoc = await getDoc(doc(comonaDb, 'tenants', 'kosun'));
  console.log('kosun tenant in comonaDb exists?:', tDoc.exists(), tDoc.data()?.name);
  process.exit(0);
}
check().catch(console.error);
