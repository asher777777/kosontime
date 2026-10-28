import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { comonaDb, kosunDb } from '../../src/lib/firebase';
import rawMasterCollection from './data/kos_web_ai_collection_master.json';

export type KosWebAiAudienceMode = 'guest' | 'user';

export interface KosWebAiFunctionItem {
  id: string;
  name: string;
  title: string;
  category: 'page_management' | 'ai_generation' | 'seo_geo' | 'legal_infrastructure';
  categoryLabel: string;
  audience: 'guest' | 'user' | 'both';
  summary: string;
  processStep: string;
  actionKey: string;
  badge: string;
  icon: string;
  ctaText: string;
  tags: string[];
  targetLayout?: string;
  guestAvailable: boolean;
  userAvailable: boolean;
}

export interface KosWebAiSectionItem {
  type: string;
  title: string;
  category: string;
  description: string;
}

export interface KosWebAiBlueprintItem {
  id: string;
  title: string;
  badge: string;
  sections: string[];
  description: string;
}

export interface KosWebAiCollectionMetadata {
  collection: string;
  version: string;
  lastUpdated: string;
  displayName: string;
  description: string;
  supportedArchetypes: string[];
  supportedAudiences: string[];
  totalFunctions: number;
  totalSections: number;
  totalBlueprints: number;
}

export interface KosWebAiCollectionMaster {
  _metadata: KosWebAiCollectionMetadata;
  metadata?: KosWebAiCollectionMetadata;
  audiences: Record<KosWebAiAudienceMode, {
    id: KosWebAiAudienceMode;
    label: string;
    badge: string;
    description: string;
    allowedActionKeys: string[];
  }>;
  functions: KosWebAiFunctionItem[];
  actions?: KosWebAiFunctionItem[];
  sectionsCatalog: KosWebAiSectionItem[];
  blueprintsCatalog: KosWebAiBlueprintItem[];
}

export const KOS_WEB_AI_FALLBACK: KosWebAiCollectionMaster = rawMasterCollection as unknown as KosWebAiCollectionMaster;

/**
 * מנרמל אובייקט קולקציה מ-Firestore או LocalStorage ומבטיח ש-_metadata קיים תמיד
 */
export function normalizeKosWebAiCollection(raw: any): KosWebAiCollectionMaster {
  if (!raw || typeof raw !== 'object') {
    return KOS_WEB_AI_FALLBACK;
  }
  const meta: KosWebAiCollectionMetadata =
    raw._metadata ||
    raw.metadata ||
    KOS_WEB_AI_FALLBACK._metadata || {
      collection: 'kos_web_ai_master',
      version: '2026.1',
      displayName: 'KOSWEBAI',
      lastUpdated: new Date().toISOString(),
      description: '',
      supportedArchetypes: ['saas', 'automotive', 'beauty', 'real_estate', 'community', 'legal'],
      supportedAudiences: ['guest', 'user'],
      totalFunctions: 16,
      totalSections: 14,
      totalBlueprints: 5
    };

  const resolvedFunctions = Array.isArray(raw.functions)
    ? raw.functions
    : Array.isArray(raw.actions)
    ? raw.actions
    : Array.isArray(KOS_WEB_AI_FALLBACK.functions)
    ? KOS_WEB_AI_FALLBACK.functions
    : [];

  return {
    _metadata: meta,
    metadata: meta,
    audiences: raw.audiences || KOS_WEB_AI_FALLBACK.audiences,
    functions: resolvedFunctions,
    actions: resolvedFunctions,
    sectionsCatalog: Array.isArray(raw.sectionsCatalog)
      ? raw.sectionsCatalog
      : Array.isArray(raw.sections)
      ? raw.sections
      : KOS_WEB_AI_FALLBACK.sectionsCatalog,
    blueprintsCatalog: Array.isArray(raw.blueprintsCatalog)
      ? raw.blueprintsCatalog
      : Array.isArray(raw.blueprints)
      ? raw.blueprints
      : KOS_WEB_AI_FALLBACK.blueprintsCatalog,
  };
}

/**
 * משיכת קולקציית KOSWEBAI המלאה - עם עדיפות ל-Firestore וגיבוי מקומי מלא
 */
export async function getKosWebAiMasterCollection(tenantId: string = 'kosun'): Promise<KosWebAiCollectionMaster> {
  const db = comonaDb || kosunDb;
  const storageKey = `kos_web_ai_master_${tenantId}`;

  // 1. בדיקת זיכרון מקומי
  try {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        return normalizeKosWebAiCollection(JSON.parse(cached));
      }
    }
  } catch (e) {
    // Local storage unavailable
  }

  // 2. בדיקה ב-Firestore
  if (db) {
    try {
      const docRef = doc(db, 'system_collections', 'kos_web_ai');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const normalized = normalizeKosWebAiCollection(snap.data());
        if (typeof window !== 'undefined') {
          localStorage.setItem(storageKey, JSON.stringify(normalized));
        }
        return normalized;
      }
    } catch (e) {
      console.warn('[KosWebAi] Firestore fetch warning, using fallback collection:', e);
    }
  }

  return KOS_WEB_AI_FALLBACK;
}

/**
 * סינון פונקציות לפי מצב תצוגה: 'guest' (אורח) או 'user' (משתמש / מנהל)
 */
export function filterKosWebAiFunctions(
  functions: KosWebAiFunctionItem[] = [],
  audience: KosWebAiAudienceMode
): KosWebAiFunctionItem[] {
  const safeList = Array.isArray(functions) ? functions : [];
  if (audience === 'guest') {
    return safeList.filter((fn) => fn.guestAvailable || fn.audience === 'guest' || fn.audience === 'both');
  }
  return safeList.filter((fn) => fn.userAvailable || fn.audience === 'user' || fn.audience === 'both');
}

/**
 * האזנה בזמן אמת לעדכוני הקולקציה ב-Firestore
 */
export function subscribeToKosWebAiCollection(
  onData: (data: KosWebAiCollectionMaster) => void
): () => void {
  const db = comonaDb || kosunDb;
  if (!db) {
    onData(KOS_WEB_AI_FALLBACK);
    return () => {};
  }

  try {
    const docRef = doc(db, 'system_collections', 'kos_web_ai');
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const normalized = normalizeKosWebAiCollection(snap.data());
        onData(normalized);
      } else {
        onData(KOS_WEB_AI_FALLBACK);
      }
    }, (err) => {
      console.warn('[KosWebAi] Realtime listener error, using fallback:', err);
      onData(KOS_WEB_AI_FALLBACK);
    });
  } catch (e) {
    onData(KOS_WEB_AI_FALLBACK);
    return () => {};
  }
}
