import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

// 1. קונפיגורציית פרויקט KOSUN (המערכת המקומית)
import kosunConfig from '../../firebase-applet-config.json';
// 2. קונפיגורציית פרויקט COMONA / GlowManage (קמונה)
import comonaConfig from '../../comona-firebase-config.json';

// --- אתחול KOSUN App ---
const kosunApp = !getApps().some(app => app.name === '[DEFAULT]')
  ? initializeApp(kosunConfig)
  : getApp();

export const kosunDb = getFirestore(kosunApp, kosunConfig.firestoreDatabaseId);
export const kosunAuth = getAuth(kosunApp);

// תאימות לאחור
export const db = kosunDb;
export const auth = kosunAuth;

// --- אתחול COMONA (GlowManage) App במקביל! ---
const comonaApp = !getApps().some(app => app.name === 'comona')
  ? initializeApp(comonaConfig, 'comona')
  : getApp('comona');

export const comonaDb = getFirestore(comonaApp);
export const comonaAuth = getAuth(comonaApp);

console.log('[Firebase Dual-Bridge] Successfully linked KOSUN & COMONA (glowmanage) instances!');

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    console.error('Connection test failed:', error);
  }
}
