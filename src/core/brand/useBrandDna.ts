import { useState, useEffect, useCallback, useMemo } from 'react';
import { BrandDna, BrandIdentity, BrandVoice, BrandAudience, BrandDesignTokens, BrandTrustAndCheckout, BrandUiVocabulary, BrandDnaContract } from '../contracts';
import { DEFAULT_BRAND_DNA, createTenantInitialBrandDna, loadBrandDna, saveBrandDna } from './brandDnaService';
import { useHostCapabilities } from '../bridge/HostCapabilitiesContext';
import { eventBus } from '../bridge/EventBus';
import { useTenantScope } from '../tenant';

export interface UseBrandDnaResult {
  brandDna: BrandDna;
  isLoading: boolean;
  isSaving: boolean;
  completenessScore: number;
  missingRecommendations: string[];
  updateIdentity: (partial: Partial<BrandIdentity>) => void;
  updateVoice: (partial: Partial<BrandVoice>) => void;
  updateAudience: (partial: Partial<BrandAudience>) => void;
  updateDesignTokens: (partial: Partial<BrandDesignTokens>) => void;
  updateTrust: (partial: Partial<BrandTrustAndCheckout>) => void;
  updateUiVocabulary: (partial: Partial<BrandUiVocabulary>) => void;
  setFullBrandDna: (newDna: BrandDna) => void;
  saveNow: () => Promise<boolean>;
  resetToDefaults: () => void;
  getGeminiSystemContext?: (moduleRole?: string) => string;
  setLogoUrl: (url: string) => Promise<boolean>;
  addVibeImage: (url: string) => Promise<boolean>;
  removeVibeImage: (url: string) => Promise<boolean>;
  updateBrandSummaryParagraph: (paragraph: string) => Promise<boolean>;
}

export function useBrandDna(): UseBrandDnaResult {
  const { tenantId } = useTenantScope();
  const { getCapability, hasCapability } = useHostCapabilities();
  const hostBrandContract = hasCapability('brand-dna') ? getCapability<BrandDnaContract>('brand-dna') : null;

  const [brandDna, setBrandDna] = useState<BrandDna>(() => {
    if (hostBrandContract?.getBrandDna) {
      return hostBrandContract.getBrandDna();
    }
    return createTenantInitialBrandDna(tenantId);
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (hostBrandContract?.getBrandDna) {
      setBrandDna(hostBrandContract.getBrandDna());
      return;
    }

    let mounted = true;
    setIsLoading(true);
    loadBrandDna(undefined, tenantId)
      .then((data) => {
        if (mounted) {
          setBrandDna(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setIsLoading(false);
      });

    const unsub = eventBus.subscribe('brand:updated', (data) => {
      if (data?.brandDna && mounted) {
        setBrandDna(data.brandDna);
      }
    });

    return () => {
      mounted = false;
      unsub();
    };
  }, [tenantId, hostBrandContract]);

  const updateIdentity = useCallback((partial: Partial<BrandIdentity>) => {
    setBrandDna((prev) => {
      const updated = { ...prev, identity: { ...prev.identity, ...partial } };
      saveBrandDna(updated, undefined, tenantId);
      eventBus.publish('brand:updated', { brandDna: updated, updatedAt: new Date().toISOString() });
      return updated;
    });
  }, [tenantId]);

  const updateVoice = useCallback((partial: Partial<BrandVoice>) => {
    setBrandDna((prev) => {
      const updated = { ...prev, voice: { ...prev.voice, ...partial } };
      saveBrandDna(updated, undefined, tenantId);
      eventBus.publish('brand:updated', { brandDna: updated, updatedAt: new Date().toISOString() });
      return updated;
    });
  }, [tenantId]);

  const updateAudience = useCallback((partial: Partial<BrandAudience>) => {
    setBrandDna((prev) => {
      const updated = { ...prev, audience: { ...prev.audience, ...partial } };
      saveBrandDna(updated, undefined, tenantId);
      eventBus.publish('brand:updated', { brandDna: updated, updatedAt: new Date().toISOString() });
      return updated;
    });
  }, [tenantId]);

  const updateDesignTokens = useCallback((partial: Partial<BrandDesignTokens>) => {
    setBrandDna((prev) => {
      const updated = { ...prev, designTokens: { ...prev.designTokens, ...partial } };
      saveBrandDna(updated, undefined, tenantId);
      eventBus.publish('brand:updated', { brandDna: updated, updatedAt: new Date().toISOString() });
      return updated;
    });
  }, [tenantId]);

  const updateTrust = useCallback((partial: Partial<BrandTrustAndCheckout>) => {
    setBrandDna((prev) => {
      const updated = { ...prev, trust: { ...prev.trust, ...partial } };
      saveBrandDna(updated, undefined, tenantId);
      eventBus.publish('brand:updated', { brandDna: updated, updatedAt: new Date().toISOString() });
      return updated;
    });
  }, [tenantId]);

  const updateUiVocabulary = useCallback((partial: Partial<BrandUiVocabulary>) => {
    setBrandDna((prev) => {
      const updated = { ...prev, uiVocabulary: { ...(prev.uiVocabulary || {}), ...partial } };
      saveBrandDna(updated, undefined, tenantId);
      eventBus.publish('brand:updated', { brandDna: updated, updatedAt: new Date().toISOString() });
      return updated;
    });
  }, [tenantId]);

  const setFullBrandDna = useCallback((newDna: BrandDna) => {
    setBrandDna(newDna);
    saveBrandDna(newDna, undefined, tenantId);
    eventBus.publish('brand:updated', { brandDna: newDna, updatedAt: new Date().toISOString() });
  }, [tenantId]);

  const saveNow = useCallback(async (): Promise<boolean> => {
    setIsSaving(true);
    const res = await saveBrandDna(brandDna, undefined, tenantId);
    setIsSaving(false);
    return res.success;
  }, [brandDna, tenantId]);

  const resetToDefaults = useCallback(() => {
    setBrandDna(DEFAULT_BRAND_DNA);
    saveBrandDna(DEFAULT_BRAND_DNA, undefined, tenantId);
    eventBus.publish('brand:updated', { brandDna: DEFAULT_BRAND_DNA, updatedAt: new Date().toISOString() });
  }, [tenantId]);

  const setLogoUrl = useCallback(async (url: string): Promise<boolean> => {
    updateIdentity({ logoUrl: url });
    eventBus.publish('brand:logo_updated', { logoUrl: url, updatedAt: new Date().toISOString() });
    return true;
  }, [updateIdentity]);

  const addVibeImage = useCallback(async (url: string): Promise<boolean> => {
    const images = brandDna.identity.vibeImages || [];
    if (!images.includes(url)) {
      updateIdentity({ vibeImages: [...images, url] });
      eventBus.publish('brand:vibe_image_added', { imageUrl: url, updatedAt: new Date().toISOString() });
    }
    return true;
  }, [brandDna.identity.vibeImages, updateIdentity]);

  const removeVibeImage = useCallback(async (url: string): Promise<boolean> => {
    const images = (brandDna.identity.vibeImages || []).filter((img) => img !== url);
    updateIdentity({ vibeImages: images });
    return true;
  }, [brandDna.identity.vibeImages, updateIdentity]);

  const updateBrandSummaryParagraph = useCallback(async (paragraph: string): Promise<boolean> => {
    setBrandDna((prev) => {
      const updated = { ...prev, brandSummaryParagraph: paragraph };
      saveBrandDna(updated, undefined, tenantId);
      return updated;
    });
    return true;
  }, [tenantId]);

  return {
    brandDna,
    isLoading,
    isSaving,
    completenessScore: 85,
    missingRecommendations: [],
    updateIdentity,
    updateVoice,
    updateAudience,
    updateDesignTokens,
    updateTrust,
    updateUiVocabulary,
    setFullBrandDna,
    saveNow,
    resetToDefaults,
    setLogoUrl,
    addVibeImage,
    removeVibeImage,
    updateBrandSummaryParagraph,
  };
}
