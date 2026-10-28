const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

const comonaConfig = require('./comona-firebase-config.json');
const comonaApp = initializeApp(comonaConfig, 'comona');
const comonaDb = getFirestore(comonaApp);

async function printKosun() {
  const tDoc = await getDoc(doc(comonaDb, 'tenants', 'kosun'));
  console.log(JSON.stringify(tDoc.data(), null, 2));
  process.exit(0);
}
printKosun().catch(console.error);
