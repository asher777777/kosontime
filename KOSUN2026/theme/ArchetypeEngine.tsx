import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db } from '../../src/lib/firebase'; // משיכה מהאינסטנס הקיים בפרויקט
import { ArchetypePreset, ArchetypeId, ArchetypeMediaConfig } from './types';
import { DEFAULT_ARCHETYPES } from './defaultArchetypes';

interface ArchetypeContextValue {
  activeArchetype: ArchetypePreset;
  activeId: ArchetypeId;
  allPresets: Record<string, ArchetypePreset>;
  isLoading: boolean;
  setArchetypeById: (id: ArchetypeId) => void;
  // פונקציית עזר להלבשת דריסת עיצוב מקומית
  resolveTheme: (componentOverrides?: Partial<ArchetypePreset['style']>) => ArchetypePreset['style'];
  // שידוך ושמירת מדיה ישירות לקולקציית עיצוב התבניות בענן
  updateArchetypeMedia: (archId: ArchetypeId, mediaUpdates: Partial<ArchetypeMediaConfig>) => Promise<void>;
}

const ArchetypeContext = createContext<ArchetypeContextValue | undefined>(undefined);

interface ArchetypeProviderProps {
  children: React.ReactNode;
  initialArchetypeId?: ArchetypeId;
  tenantId?: string; // אם מועבר טננט ספציפי (למשל מ-URL או סאב-דומיין)
}

export const ArchetypeProvider: React.FC<ArchetypeProviderProps> = ({
  children,
  initialArchetypeId = 'wellness',
  tenantId
}) => {
  const [allPresets, setAllPresets] = useState<Record<string, ArchetypePreset>>(DEFAULT_ARCHETYPES);
  const [activeId, setActiveId] = useState<ArchetypeId>(initialArchetypeId);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. האזנה חיה (Realtime) לכל הסגנונות בענן מקולקציית archetype_presets
  useEffect(() => {
    try {
      const presetsCol = collection(db, 'archetype_presets');
      const unsubscribe = onSnapshot(
        presetsCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const cloudPresets: Record<string, ArchetypePreset> = {};
            snapshot.forEach((docSnap) => {
              const base = DEFAULT_ARCHETYPES[docSnap.id] || DEFAULT_ARCHETYPES.wellness;
              const data = docSnap.data() as any;
              cloudPresets[docSnap.id] = {
                ...base,
                ...data,
                id: docSnap.id,
                style: { ...(base.style || {}), ...(data.style || {}) },
                copy: { ...(base.copy || {}), ...(data.copy || {}) },
                backdrop: { ...(base.backdrop || {}), ...(data.backdrop || {}) },
                motion: { ...(base.motion || {}), ...(data.motion || {}) },
                media: { ...(base.media || {}), ...(data.media || {}) },
              };
            });
            // מיזוג עמוק: ערכי ענן מועשרים בברירות מחדל מקומיות כדי למנוע undefined
            setAllPresets((prev) => ({ ...prev, ...cloudPresets }));
          }
          setIsLoading(false);
        },
        (error) => {
          console.warn('[ArchetypeEngine] Firestore sync warning (using defaults):', error);
          setIsLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (e) {
      console.warn('[ArchetypeEngine] Could not initialize Firestore listener:', e);
      setIsLoading(false);
    }
  }, []);

  // 2. אם הועבר tenantId, מאזינים להגדרת הסגנון של הטננט הספציפי
  useEffect(() => {
    if (!tenantId) return;

    try {
      const tenantDocRef = doc(db, 'tenants', tenantId);
      const unsubscribe = onSnapshot(tenantDocRef, (snap) => {
        if (snap.exists()) {
          const tenantData = snap.data();
          if (tenantData.archetypeId && allPresets[tenantData.archetypeId]) {
            setActiveId(tenantData.archetypeId);
          }
        }
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('[ArchetypeEngine] Tenant listener failed:', e);
    }
  }, [tenantId, allPresets]);

  // הסגנון הפעיל כרגע - הגנה הרמטית עם Fallback ל-style, copy ו-media
  const activeArchetype = useMemo(() => {
    const candidate = allPresets[activeId] || allPresets['wellness'] || DEFAULT_ARCHETYPES.wellness;
    const base = DEFAULT_ARCHETYPES[activeId] || DEFAULT_ARCHETYPES.wellness;
    return {
      ...base,
      ...candidate,
      style: { ...(base.style || {}), ...(candidate.style || {}) },
      copy: { ...(base.copy || {}), ...(candidate.copy || {}) },
      media: { ...(base.media || {}), ...(candidate.media || {}) },
    };
  }, [allPresets, activeId]);

  // פונקציית מיזוג שדואגת שכל קומפוננטה תוכל לדרוס ערכים ב-Editor
  const resolveTheme = (componentOverrides?: Partial<ArchetypePreset['style']>) => {
    if (!componentOverrides) return activeArchetype.style;
    return {
      ...activeArchetype.style,
      ...componentOverrides
    };
  };

  // שידוך ושמירת מדיה ישירות למסמך ה-Preset ב-Firestore (archetype_presets)
  const updateArchetypeMedia = async (archId: ArchetypeId, mediaUpdates: Partial<ArchetypeMediaConfig>) => {
    try {
      const currentPreset = allPresets[archId] || DEFAULT_ARCHETYPES[archId] || DEFAULT_ARCHETYPES.wellness;
      const updatedMedia: ArchetypeMediaConfig = {
        heroImageUrl: currentPreset.media?.heroImageUrl || '',
        heroVideoUrl: currentPreset.media?.heroVideoUrl || '',
        galleryFolderId: 'folder_shared_templates',
        ...(currentPreset.media || {}),
        ...mediaUpdates,
      };

      // 1. עדכון מקומי מיידי
      setAllPresets((prev) => ({
        ...prev,
        [archId]: {
          ...(prev[archId] || currentPreset),
          media: updatedMedia,
          updatedAt: Date.now(),
        },
      }));

      // 2. עדכון ב-Firestore בקולקציית archetype_presets
      if (db) {
        const docRef = doc(db, 'archetype_presets', archId);
        await setDoc(docRef, { media: updatedMedia, updatedAt: Date.now() }, { merge: true });
        console.log(`[ArchetypeEngine] Media successfully linked to archetype_presets/${archId} in cloud!`, updatedMedia);
      }
    } catch (err) {
      console.warn('[ArchetypeEngine] Error linking media to archetype_presets:', err);
    }
  };

  const value: ArchetypeContextValue = {
    activeArchetype,
    activeId,
    allPresets,
    isLoading,
    setArchetypeById: setActiveId,
    resolveTheme,
    updateArchetypeMedia,
  };

  return <ArchetypeContext.Provider value={value}>{children}</ArchetypeContext.Provider>;
};

// Hook פשוט לשימוש בכל קומפוננטת View או Editor!
export const useArchetype = () => {
  const context = useContext(ArchetypeContext);
  if (!context) {
    // אם קומפוננטה מורצת מחוץ ל-Provider - היא מקבלת fallback בטוח!
    return {
      activeArchetype: DEFAULT_ARCHETYPES.wellness,
      activeId: 'wellness',
      allPresets: DEFAULT_ARCHETYPES,
      isLoading: false,
      setArchetypeById: () => {},
      resolveTheme: (overrides?: any) => ({ ...DEFAULT_ARCHETYPES.wellness.style, ...overrides }),
      updateArchetypeMedia: async () => {},
    };
  }
  return context;
};
