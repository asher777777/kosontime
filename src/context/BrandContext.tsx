import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import {
  BrandDna,
  DEFAULT_KOSUN_BRAND_DNA,
  BrandIdentity,
  BrandVoice,
  BrandAudience,
  BrandEcosystem,
  BrandDesignTokens,
  BrandTrust,
  ContentStrategyItem,
  MarketResearchData,
} from '../types/brand';

const LOCAL_STORAGE_KEY = 'kosun_brand_dna_v2';

export interface BrandContextValue {
  brandDna: BrandDna;
  completenessScore: number;
  isLoading: boolean;
  isSaving: boolean;
  updateIdentity: (partial: Partial<BrandIdentity>) => void;
  updateVoice: (partial: Partial<BrandVoice>) => void;
  updateAudience: (partial: Partial<BrandAudience>) => void;
  updateEcosystem: (partial: Partial<BrandEcosystem>) => void;
  updateDesignTokens: (partial: Partial<BrandDesignTokens>) => void;
  updateTrust: (partial: Partial<BrandTrust>) => void;
  setBrandDna: React.Dispatch<React.SetStateAction<BrandDna>>;
  saveBrandDna: () => Promise<boolean>;
  resetToDefaults: () => Promise<void>;
  addContentStrategy: (item: ContentStrategyItem) => void;
  setMarketResearch: (data: MarketResearchData) => void;
  generateSummaryParagraph: () => Promise<string | null>;
  rephraseText: (text: string, instructions?: string) => Promise<string | null>;
  runDiscovery: (notes: string) => Promise<boolean>;
  runContentStrategy: (type: string) => Promise<ContentStrategyItem | null>;
  runMarketResearch: () => Promise<MarketResearchData | null>;
}

const BrandContext = createContext<BrandContextValue | undefined>(undefined);

export const BrandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [brandDna, setBrandDna] = useState<BrandDna>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_KOSUN_BRAND_DNA, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to parse cached brand DNA', e);
    }
    return DEFAULT_KOSUN_BRAND_DNA;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load from Firestore when user logs in
  useEffect(() => {
    let mounted = true;
    async function loadFromFirestore() {
      if (!user) return;
      try {
        setIsLoading(true);
        const docRef = doc(db, 'brandDna', user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists() && mounted) {
          const remote = snap.data() as BrandDna;
          setBrandDna((prev) => ({
            ...prev,
            ...remote,
            identity: { ...prev.identity, ...(remote.identity || {}) },
            voice: { ...prev.voice, ...(remote.voice || {}) },
            audience: { ...prev.audience, ...(remote.audience || {}) },
            ecosystem: { ...prev.ecosystem, ...(remote.ecosystem || {}) },
            designTokens: { ...prev.designTokens, ...(remote.designTokens || {}) },
            trust: { ...prev.trust, ...(remote.trust || {}) },
          }));
        }
      } catch (err) {
        console.warn('Could not load brand DNA from Firestore, using local cache:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadFromFirestore();
    return () => {
      mounted = false;
    };
  }, [user]);

  // Persist locally whenever brandDna changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(brandDna));
    } catch (e) {
      console.warn('Failed to persist brand DNA to localStorage', e);
    }
  }, [brandDna]);

  // Calculate completeness score (0-100)
  const completenessScore = useMemo(() => {
    let points = 0;
    const maxPoints = 14;

    if (brandDna.identity.companyName?.trim()) points += 1;
    if (brandDna.identity.slogan?.trim()) points += 1;
    if (brandDna.identity.organizationPurpose?.trim()) points += 1;
    if (brandDna.identity.companyVision?.trim()) points += 1;

    if (brandDna.voice.powerWords?.length > 0) points += 1;
    if (brandDna.voice.summaryParagraph?.trim()) points += 2;

    if (brandDna.audience.mainUvp?.trim()) points += 2;
    if (brandDna.audience.targetAudiences?.length > 0) points += 1;
    if (brandDna.audience.personas?.length > 0) points += 1;
    if (brandDna.audience.commonObjections?.length > 0) points += 1;

    if (brandDna.ecosystem.services?.length > 0) points += 1;
    if (brandDna.trust.legalEntityId?.trim() || brandDna.trust.whatsappSupportNumber?.trim()) points += 1;
    if (brandDna.designTokens.primaryColor?.trim()) points += 1;

    return Math.min(100, Math.round((points / maxPoints) * 100));
  }, [brandDna]);

  const updateIdentity = useCallback((partial: Partial<BrandIdentity>) => {
    setBrandDna((prev) => ({
      ...prev,
      identity: { ...prev.identity, ...partial },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const updateVoice = useCallback((partial: Partial<BrandVoice>) => {
    setBrandDna((prev) => ({
      ...prev,
      voice: { ...prev.voice, ...partial },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const updateAudience = useCallback((partial: Partial<BrandAudience>) => {
    setBrandDna((prev) => ({
      ...prev,
      audience: { ...prev.audience, ...partial },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const updateEcosystem = useCallback((partial: Partial<BrandEcosystem>) => {
    setBrandDna((prev) => ({
      ...prev,
      ecosystem: { ...prev.ecosystem, ...partial },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const updateDesignTokens = useCallback((partial: Partial<BrandDesignTokens>) => {
    setBrandDna((prev) => ({
      ...prev,
      designTokens: { ...prev.designTokens, ...partial },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const updateTrust = useCallback((partial: Partial<BrandTrust>) => {
    setBrandDna((prev) => ({
      ...prev,
      trust: { ...prev.trust, ...partial },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const addContentStrategy = useCallback((item: ContentStrategyItem) => {
    setBrandDna((prev) => ({
      ...prev,
      contentStrategies: [item, ...(prev.contentStrategies || [])],
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const setMarketResearch = useCallback((data: MarketResearchData) => {
    setBrandDna((prev) => ({
      ...prev,
      marketResearch: data,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const saveBrandDna = useCallback(async (): Promise<boolean> => {
    setIsSaving(true);
    try {
      const payload: BrandDna = {
        ...brandDna,
        userId: user ? user.uid : 'guest',
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));

      if (user) {
        const docRef = doc(db, 'brandDna', user.uid);
        await setDoc(docRef, payload, { merge: true });
      }
      return true;
    } catch (err) {
      console.error('Error saving brand DNA:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [brandDna, user]);

  const resetToDefaults = useCallback(async () => {
    setBrandDna(DEFAULT_KOSUN_BRAND_DNA);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_KOSUN_BRAND_DNA));
    if (user) {
      try {
        const docRef = doc(db, 'brandDna', user.uid);
        await setDoc(docRef, { ...DEFAULT_KOSUN_BRAND_DNA, userId: user.uid }, { merge: true });
      } catch (e) {
        console.warn('Failed to reset on firestore:', e);
      }
    }
  }, [user]);

  // AI Helper: Generate Summary Paragraph
  const generateSummaryParagraph = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch('/api/brand/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand: brandDna }),
      });
      if (!res.ok) throw new Error('Failed to generate summary');
      const data = await res.json();
      if (data.paragraph) {
        updateVoice({ summaryParagraph: data.paragraph });
        return data.paragraph;
      }
      return null;
    } catch (err) {
      console.error(err);
      return null;
    }
  }, [brandDna, updateVoice]);

  // AI Helper: Rephrase text
  const rephraseText = useCallback(async (text: string, instructions?: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/brand/rephrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, brand: brandDna, instructions }),
      });
      if (!res.ok) throw new Error('Failed to rephrase');
      const data = await res.json();
      return data.text || null;
    } catch (err) {
      console.error(err);
      return null;
    }
  }, [brandDna]);

  // AI Helper: Run Discovery
  const runDiscovery = useCallback(async (notes: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/brand/discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) throw new Error('Discovery failed');
      const data = await res.json();
      if (data.discovered) {
        const d = data.discovered;
        setBrandDna((prev) => ({
          ...prev,
          identity: {
            ...prev.identity,
            companyName: d.companyName || prev.identity.companyName,
            slogan: d.slogan || prev.identity.slogan,
            organizationPurpose: d.organizationPurpose || prev.identity.organizationPurpose,
            companyVision: d.companyVision || prev.identity.companyVision,
          },
          audience: {
            ...prev.audience,
            mainUvp: d.mainUvp || prev.audience.mainUvp,
            targetAudiences: d.targetAudiences?.length ? d.targetAudiences : prev.audience.targetAudiences,
            personas: d.personas?.length
              ? d.personas.map((p: any, i: number) => ({ id: `p-disc-${i}`, ...p }))
              : prev.audience.personas,
            commonObjections: d.commonObjections?.length
              ? d.commonObjections.map((o: any, i: number) => ({ id: `o-disc-${i}`, ...o }))
              : prev.audience.commonObjections,
          },
          voice: {
            ...prev.voice,
            powerWords: d.powerWords?.length ? d.powerWords : prev.voice.powerWords,
          },
          ecosystem: {
            ...prev.ecosystem,
            services: d.services?.length ? d.services : prev.ecosystem.services,
          },
          updatedAt: new Date().toISOString(),
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  }, []);

  // AI Helper: Run Content Strategy
  const runContentStrategy = useCallback(async (type: string): Promise<ContentStrategyItem | null> => {
    try {
      const res = await fetch('/api/brand/content-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand: brandDna, strategyType: type }),
      });
      if (!res.ok) throw new Error('Strategy failed');
      const data = await res.json();
      if (data.strategy) {
        const item: ContentStrategyItem = {
          id: `strat-${Date.now()}`,
          type: type as any,
          title: data.strategy.title || 'אסטרטגיה מותאמת',
          targetAudience: data.strategy.targetAudience || '',
          heroHeadline: data.strategy.heroHeadline || '',
          heroSubheadline: data.strategy.heroSubheadline || '',
          coreValuePoints: data.strategy.coreValuePoints || [],
          callToAction: data.strategy.callToAction || '',
          pricingHook: data.strategy.pricingHook,
          objectionKiller: data.strategy.objectionKiller,
          createdAt: new Date().toISOString(),
        };
        addContentStrategy(item);
        return item;
      }
      return null;
    } catch (err) {
      console.error(err);
      return null;
    }
  }, [brandDna, addContentStrategy]);

  // AI Helper: Run Market Research
  const runMarketResearch = useCallback(async (): Promise<MarketResearchData | null> => {
    try {
      const res = await fetch('/api/brand/market-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand: brandDna }),
      });
      if (!res.ok) throw new Error('Research failed');
      const data = await res.json();
      if (data.research) {
        setMarketResearch(data.research);
        return data.research;
      }
      return null;
    } catch (err) {
      console.error(err);
      return null;
    }
  }, [brandDna, setMarketResearch]);

  return (
    <BrandContext.Provider
      value={{
        brandDna,
        completenessScore,
        isLoading,
        isSaving,
        updateIdentity,
        updateVoice,
        updateAudience,
        updateEcosystem,
        updateDesignTokens,
        updateTrust,
        setBrandDna,
        saveBrandDna,
        resetToDefaults,
        addContentStrategy,
        setMarketResearch,
        generateSummaryParagraph,
        rephraseText,
        runDiscovery,
        runContentStrategy,
        runMarketResearch,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = () => {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
};
