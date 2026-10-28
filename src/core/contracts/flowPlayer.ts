/**
 * Core FlowPlayer Contracts & Types
 */
import { FirebaseApp } from 'firebase/app';
import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
} from 'firebase/firestore';

export type AspectRatioType = '9:16' | '16:9' | '1:1' | 'auto';

export interface OverlayAction {
  id: string;
  label: string;
  targetNodeId: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'gold';
  icon?: string;
  description?: string;
}

export interface CarouselCardItem {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  targetNodeId: string;
  badge?: string;
}

export interface OverlayItem {
  id: string;
  type: 'quick_replies' | 'info_card' | 'badge' | 'product_card' | 'form_input' | 'countdown' | 'carousel';
  position: 'top' | 'center' | 'bottom' | 'top-right' | 'bottom-right' | 'bottom-left';
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  price?: string;
  actions?: OverlayAction[];
  carouselItems?: CarouselCardItem[];
  formFields?: { key: string; label: string; placeholder?: string; type: 'text' | 'email' | 'tel' }[];
  style?: Record<string, string>;
  delayMs?: number;
  durationMs?: number;
}

export interface FlowNodeState {
  id: string;
  name: string;
  description?: string;
  videoUrl?: string;
  fallbackVideoUrl?: string;
  mediaId?: string;
  mediaName?: string;

  // Triggers & Playback Configurations
  autoPlay?: boolean; // א. הפעלה אוטומטית או לא
  loop?: boolean; // נגן בלופ
  loopUntilTrigger?: boolean; // א. נגן בלופ עד הפעלת טריגר
  soundEnabled?: boolean; // ב. הפעל סאונד או לא
  autoTransitionOnEnd?: boolean; // ג. העבר אוטומטית לצומת הבא בסיום הווידאו
  autoTransitionDelaySec?: number; // ג. העבר אוטומטית לאחר X שניות
  autoTransitionTarget?: string; // ג. צומת היעד למעבר אוטומטי
  formsApiEndpoint?: string; // כתובת ה-API עבור INPUT מטפסים

  overlays?: OverlayItem[];
  allowedIntents?: Record<string, string>; // intentName -> targetNodeId
  systemInstructions?: string;
  micPosition?: 'center' | 'bottom' | 'screen_center_trigger' | 'hidden';
  micActionType?: 'open_text_input' | 'navigate_to_node';
  clickMicTargetNodeId?: string;
  micIcon?: string;
}

export interface SceneDocument {
  id: string;
  nodeId: string;
  name: string;
  description?: string;
  mediaAssets: {
    videoUrl?: string;
    fallbackVideoUrl?: string;
    mediaId?: string;
    mediaName?: string;
    thumbnailUrl?: string;
    cardImages?: string[];
  };
  triggers: {
    autoPlay?: boolean;
    loopUntilTrigger?: boolean;
    soundEnabled?: boolean;
    micPosition?: 'center' | 'bottom' | 'screen_center_trigger' | 'hidden';
    micIcon?: string;
    micActionType?: 'open_text_input' | 'navigate_to_node';
    clickMicTargetNodeId?: string;
    autoTransitionOnEnd?: boolean;
    autoTransitionDelaySec?: number;
    autoTransitionTarget?: string;
    allowedIntents?: Record<string, string>;
  };
  cardsAndOverlays: {
    overlays?: OverlayItem[];
  };
  formApiConfig?: {
    apiEndpoint?: string;
  };
  updatedAt: number;
}

export interface CampaignConfig {
  id: string;
  slug?: string; // סלאג ייחודי לקמפיין
  name: string;
  presenterId: string;
  initialNodeId: string;
  formsApiEndpoint?: string; // כתובת ה-API עבור INPUT מטפסים
  states: Record<string, FlowNodeState>;
  isPublished?: boolean;
  publishedAt?: number;
  settings?: {
    defaultAspectRatio?: AspectRatioType;
    autoPlay?: boolean;
    primaryColor?: string;
    enableVoice?: boolean;
    language?: string;
  };
  createdAt?: number;
  updatedAt?: number;
}

export interface SessionTelemetryEvent {
  timestamp: number;
  type:
    | 'session_start'
    | 'node_transition'
    | 'intent_detected'
    | 'voice_start'
    | 'voice_end'
    | 'voice_transcript'
    | 'overlay_action'
    | 'video_play'
    | 'video_ended'
    | 'error';
  from?: string;
  to?: string;
  intent?: string;
  transcript?: string;
  actionId?: string;
  latencyMs?: number;
  details?: Record<string, any>;
}

export interface SessionRecord {
  sessionId: string;
  campaignId: string;
  createdAt: any;
  updatedAt?: any;
  events: SessionTelemetryEvent[];
  lastNodeId?: string;
  totalTransitions?: number;
  userLanguage?: string;
}

export interface FlowPlayerCollectionsConfig {
  campaignConfigs?: string;
  sessionEvents?: string;
  presenters?: string;
}

export interface FlowPlayerModuleConfig {
  firebaseApp?: FirebaseApp;
  db?: Firestore;
  databaseId?: string;
  collectionPrefix?: string;
  customCollections?: FlowPlayerCollectionsConfig;
  geminiApiKey?: string;
  functionsBaseUrl?: string;
  campaignId?: string;
  initialCampaign?: CampaignConfig;
  onNavigate?: (path: string) => void;
  onStateChange?: (node: FlowNodeState) => void;
  onEvent?: (event: SessionTelemetryEvent) => void;
}

export interface VoiceIntentPayload {
  campaignId: string;
  currentNodeId: string;
  userText: string;
  allowedIntents: Record<string, string>;
  currentNodeInfo?: string;
  apiKey?: string;
}

export interface VoiceIntentResponse {
  success: boolean;
  intent: string;
  nextNodeId: string;
  confidence?: number;
  rawText?: string;
  explanation?: string;
  error?: string;
}

import { FlowPlayerCollectionsConfig, CampaignConfig } from './index';

export const DEFAULT_COLLECTION_PREFIX = 'sdo_player_';

export function resolveCollections(
  prefix: string = DEFAULT_COLLECTION_PREFIX,
  custom?: FlowPlayerCollectionsConfig
): Required<FlowPlayerCollectionsConfig> {
  return {
    campaignConfigs: custom?.campaignConfigs || `${prefix}campaign_configs`,
    sessionEvents: custom?.sessionEvents || `${prefix}session_events`,
    presenters: custom?.presenters || 'presenters',
  };
}

export const DEFAULT_CAMPAIGN_CONFIG: CampaignConfig = {
  id: 'sales_rep_interactive_01',
  name: 'נגן זרימה מבוסס טריגרים - מנוע אינטראקטיבי',
  presenterId: 'presenter_elena_vance_san_francisco_01',
  initialNodeId: 'node_intro',
  settings: {
    defaultAspectRatio: '9:16',
    autoPlay: true,
    primaryColor: '#EAB308',
    enableVoice: true,
    language: 'he-IL',
  },
  states: {
    // 1. מסך כניסה
    node_intro: {
      id: 'node_intro',
      name: 'מסך כניסה',
      description: 'מסך פתיחה עם מיקרופון זהב מרכזי',
      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/aioffice-1426f.firebasestorage.app/o/sdo_media_vault%2F1788087385571_scene_1_animated.mp4?alt=media',
      fallbackVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      
      // הגדרות טריגרים והפעלה:
      autoPlay: true, // א. הפעלה אוטומטית
      loopUntilTrigger: true, // א. נגן בלופ עד הפעלת טריגר
      soundEnabled: true, // ב. הפעל סאונד
      autoTransitionOnEnd: false, // ג. לא מעביר בסיום, ממתין לטריגר
      
      micPosition: 'center',
      clickMicTargetNodeId: 'node_interaction',
      overlays: [],
      allowedIntents: {
        start: 'node_interaction',
        interact: 'node_interaction',
      },
    },

    // 2. וידאו אינטראקציה
    node_interaction: {
      id: 'node_interaction',
      name: 'אינטראקציה',
      description: 'סרטון הצגת אינטראקציה שמתנגן פעם אחת ומעביר אוטומטית להמתנה לתשובה',
      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/aioffice-1426f.firebasestorage.app/o/sdo_media_vault%2F1788094281947_batty_talk-1.mp4?alt=media',
      fallbackVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      
      // הגדרות טריגרים והפעלה:
      autoPlay: true, // א. הפעלה אוטומטית
      loopUntilTrigger: false, // א. לא בלופ (מתנגן פעם אחת)
      soundEnabled: true, // ב. הפעל סאונד
      autoTransitionOnEnd: true, // ג. העבר אוטומטית לצומת הבא בסיום הווידאו
      autoTransitionTarget: 'node_waiting', // ג. צומת היעד: המתנה לתשובה
      
      micPosition: 'hidden',
      overlays: [],
    },

    // 3. המתנה לתשובה
    node_waiting: {
      id: 'node_waiting',
      name: 'המתנה לתשובה',
      description: 'מיקרופון זהב במרכז המסך להקשבה. במידה ואין תגובה תוך 15 שניות עוברים לאני עסוק',
      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/aioffice-1426f.firebasestorage.app/o/sdo_media_vault%2F1788089036047_scene_3_animated.mp4?alt=media',
      fallbackVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      
      // הגדרות טריגרים והפעלה:
      autoPlay: true, // א. הפעלה אוטומטית
      loopUntilTrigger: true, // א. נגן בלופ עד הפעלת טריגר
      soundEnabled: true, // ב. הפעל סאונד
      autoTransitionDelaySec: 15, // ג. העבר אוטומטית לאחר 15 שניות
      autoTransitionTarget: 'node_busy', // ג. צומת היעד: אני עסוק
      
      micPosition: 'center',
      allowedIntents: {
        ask_pricing: 'node_pricing',
        ask_busy: 'node_busy',
        ask_contact: 'node_contact',
        restart: 'node_intro',
      },
      overlays: [],
    },

    // 4. אני עסוק
    node_busy: {
      id: 'node_busy',
      name: 'אני עסוק',
      description: 'מציג קרוסלת תיבות בחירה עם חצים בולטים ומסגרות זהב לאחר 15 שניות ללא מענה',
      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/aioffice-1426f.firebasestorage.app/o/sdo_media_vault%2F1788094281947_batty_talk-1.mp4?alt=media',
      
      // הגדרות טריגרים והפעלה:
      autoPlay: true, // א. הפעלה אוטומטית
      loopUntilTrigger: true, // א. נגן בלופ עד הפעלת טריגר (בחירה בקרוסלה)
      soundEnabled: true, // ב. הפעל סאונד
      autoTransitionOnEnd: false, // ג. לא מעביר בסיום, ממתין לבחירת המשתמש
      
      micPosition: 'bottom',
      overlays: [
        {
          id: 'ov_busy_carousel',
          type: 'carousel',
          position: 'center',
          title: 'במה תרצה להתמקד כעת?',
          subtitle: 'בחר מתוך האפשרויות הבאות להמשך החוויה',
          carouselItems: [
            {
              id: 'card_pricing',
              title: '💰 חבילות ומחירים',
              description: 'צפה במגוון מסלולי המנוי והמחירים המותאמים עבורך',
              targetNodeId: 'node_pricing',
              badge: 'מומלץ',
            },
            {
              id: 'card_lead',
              title: '📞 השארת פרטים לנציג',
              description: 'השאר פרטים ונציג אישי ייצור איתך קשר במהירות',
              targetNodeId: 'node_contact',
              badge: 'מהיר',
            },
            {
              id: 'card_talk_again',
              title: '🎙️ שאל שאלה קולית',
              description: 'הפעל מחדש את המיקרופון ושוחח עם הסוכן',
              targetNodeId: 'node_waiting',
              badge: 'AI Live',
            },
            {
              id: 'card_restart',
              title: '🔄 התחל מחדש',
              description: 'חזרה למסך הפתיחה',
              targetNodeId: 'node_intro',
            },
          ],
        },
      ],
    },

    // 5. מחירונים
    node_pricing: {
      id: 'node_pricing',
      name: 'הצגת מחירונים ומסלולים',
      description: 'פירוט חבילות מנוי ומחירים מותאמים',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      autoPlay: true,
      loopUntilTrigger: true,
      soundEnabled: true,
      micPosition: 'bottom',
      allowedIntents: {
        select_starter: 'node_contact',
        select_pro: 'node_contact',
        back_intro: 'node_intro',
      },
      overlays: [
        {
          id: 'ov_pricing_cards',
          type: 'product_card',
          position: 'center',
          title: 'חבילת Pro המובילה',
          subtitle: 'כולל אינטראקציות ללא הגבלה וסנכרון וידאו מלא',
          price: '₪299 / חודש',
          actions: [
            { id: 'act_choose_pro', label: 'השאר פרטים למסלול זה', targetNodeId: 'node_contact', variant: 'gold' },
            { id: 'act_back', label: 'חזרה להתחלה', targetNodeId: 'node_intro', variant: 'outline' },
          ],
        },
      ],
    },

    // 6. השארת פרטים
    node_contact: {
      id: 'node_contact',
      name: 'השארת פרטים ויצירת קשר',
      description: 'טופס לכידת ליד',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
      autoPlay: true,
      loopUntilTrigger: true,
      soundEnabled: true,
      micPosition: 'bottom',
      allowedIntents: {
        restart: 'node_intro',
      },
      overlays: [
        {
          id: 'ov_lead_form',
          type: 'form_input',
          position: 'center',
          title: 'השארת פרטים לנציג',
          subtitle: 'הזן פרטים ונחזור אליך בהקדם',
          formFields: [
            { key: 'fullName', label: 'שם מלא', placeholder: 'ישראל ישראלי', type: 'text' },
            { key: 'phone', label: 'מספר טלפון', placeholder: '050-0000000', type: 'tel' },
          ],
          actions: [
            { id: 'act_restart', label: 'התחל שיחה מחדש', targetNodeId: 'node_intro', variant: 'outline' },
          ],
        },
      ],
    },
  },
};

/**
 * Remove undefined values to prevent Firestore serialization errors
 */
function cleanUndefinedFields<T extends Record<string, any>>(obj: T): T {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        cleaned[key] = cleanUndefinedFields(value);
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
}

export class FirestoreService {
  /**
   * Fetch campaign configuration by slug / ID with fallback to latest modified document & localStorage
   */
  public static async getCampaignConfig(
    db: Firestore,
    collections: Required<FlowPlayerCollectionsConfig>,
    campaignSlugOrId: string
  ): Promise<CampaignConfig | null> {
    const slug = (campaignSlugOrId || 'sales_rep_interactive_01').trim();

    // 1. First check LocalStorage for instant zero-latency retrieval
    let localCached: CampaignConfig | null = null;
    try {
      const stored =
        localStorage.getItem(`sdo_player_camp_${slug}`) ||
        localStorage.getItem('sdo_player_camp_latest');
      if (stored) {
        localCached = JSON.parse(stored);
      }
    } catch {}

    try {
      let docRef = doc(db, collections.campaignConfigs, slug);
      let snapshot = await getDoc(docRef);

      // If specific slug doesn't exist, search for latest saved campaign in collection
      if (!snapshot.exists()) {
        try {
          const collRef = collection(db, collections.campaignConfigs);
          const collSnap = await getDocs(collRef);
          if (!collSnap.empty) {
            const sortedDocs = collSnap.docs.sort(
              (a, b) => (b.data().updatedAt || 0) - (a.data().updatedAt || 0)
            );
            snapshot = sortedDocs[0];
          }
        } catch (e) {
          console.warn('[FirestoreService] Fallback collection query notice:', e);
        }
      }

      if (!snapshot || !snapshot.exists()) {
        if (localCached) {
          return localCached;
        }
        console.warn(`[FirestoreService] Campaign "${slug}" not found in Firestore.`);
        return null;
      }

      const activeSlug = snapshot.id;
      const mainData = snapshot.data() as CampaignConfig;
      const reconstructedStates: Record<string, FlowNodeState> = { ...(mainData.states || {}) };

      // Query the subcollection `scenes` under this campaign slug
      try {
        const scenesCollRef = collection(db, collections.campaignConfigs, activeSlug, 'scenes');
        const scenesSnapshot = await getDocs(scenesCollRef);

        scenesSnapshot.forEach((sceneDocSnap) => {
          const scene = sceneDocSnap.data() as Partial<SceneDocument>;
          const nodeId = scene.nodeId || sceneDocSnap.id;
          const mainNodeState = mainData.states ? mainData.states[nodeId] : undefined;

          const defaultFallback = DEFAULT_CAMPAIGN_CONFIG.states[nodeId]?.fallbackVideoUrl || DEFAULT_CAMPAIGN_CONFIG.states[nodeId]?.videoUrl || '';
          const rawFallback = scene.mediaAssets?.fallbackVideoUrl || mainNodeState?.fallbackVideoUrl || defaultFallback;
          const rawVideoUrl = scene.mediaAssets?.videoUrl || mainNodeState?.videoUrl || '';
          const mediaId = scene.mediaAssets?.mediaId || mainNodeState?.mediaId;
          const mediaName = scene.mediaAssets?.mediaName || mainNodeState?.mediaName;

          const nodeState: FlowNodeState = {
            id: nodeId,
            name: scene.name || mainNodeState?.name || nodeId,
            description: scene.description || mainNodeState?.description,
            videoUrl: rawVideoUrl || rawFallback,
            fallbackVideoUrl: rawFallback,
            mediaId: mediaId,
            mediaName: mediaName,
            autoPlay: scene.triggers?.autoPlay ?? mainNodeState?.autoPlay ?? true,
            loopUntilTrigger: scene.triggers?.loopUntilTrigger ?? mainNodeState?.loopUntilTrigger ?? true,
            loop: scene.triggers?.loopUntilTrigger ?? mainNodeState?.loop ?? true,
            soundEnabled: scene.triggers?.soundEnabled ?? mainNodeState?.soundEnabled ?? true,
            micPosition: scene.triggers?.micPosition ?? mainNodeState?.micPosition ?? 'center',
            micActionType: scene.triggers?.micActionType ?? mainNodeState?.micActionType ?? 'open_text_input',
            clickMicTargetNodeId: scene.triggers?.clickMicTargetNodeId || mainNodeState?.clickMicTargetNodeId,
            autoTransitionOnEnd: scene.triggers?.autoTransitionOnEnd ?? mainNodeState?.autoTransitionOnEnd ?? false,
            autoTransitionTarget: scene.triggers?.autoTransitionTarget || mainNodeState?.autoTransitionTarget,
            autoTransitionDelaySec: scene.triggers?.autoTransitionDelaySec ?? mainNodeState?.autoTransitionDelaySec,
            overlays: scene.cardsAndOverlays?.overlays || mainNodeState?.overlays || [],
            formsApiEndpoint: scene.formApiConfig?.apiEndpoint || mainNodeState?.formsApiEndpoint,
          };

          reconstructedStates[nodeId] = {
            ...(mainNodeState || {}),
            ...nodeState,
          };
        });
      } catch (subCollErr) {
        console.warn('[FirestoreService] Subcollection query notice:', subCollErr);
      }

      const mergedCampaign: CampaignConfig = {
        ...mainData,
        id: activeSlug,
        slug: activeSlug,
        states: reconstructedStates,
        updatedAt: mainData.updatedAt || Date.now(),
      };

      // Keep localStorage in sync with newest remote data
      try {
        localStorage.setItem(`sdo_player_camp_${activeSlug}`, JSON.stringify(mergedCampaign));
        localStorage.setItem('sdo_player_camp_latest', JSON.stringify(mergedCampaign));
      } catch {}

      return mergedCampaign;
    } catch (err) {
      console.warn('[FirestoreService] Firestore fetch fallback to local cache:', err);
      if (localCached) {
        return localCached;
      }
      return null;
    }
  }

  /**
   * Save entire Campaign JSON document under unique Slug and save each Scene in subcollection
   */
  public static async saveCampaignConfig(
    db: Firestore | undefined,
    collections: Required<FlowPlayerCollectionsConfig>,
    campaign: CampaignConfig
  ): Promise<void> {
    const slug = (campaign.slug || campaign.id || 'sales_rep_interactive_01').trim();

    const sanitizedStates: Record<string, FlowNodeState> = {};
    Object.entries(campaign.states || {}).forEach(([nodeId, node]) => {
      const fallback = node.fallbackVideoUrl || DEFAULT_CAMPAIGN_CONFIG.states[nodeId]?.fallbackVideoUrl || DEFAULT_CAMPAIGN_CONFIG.states[nodeId]?.videoUrl || '';
      sanitizedStates[nodeId] = {
        ...node,
        videoUrl: node.videoUrl || fallback,
        fallbackVideoUrl: node.fallbackVideoUrl || fallback,
        mediaId: node.mediaId,
        mediaName: node.mediaName,
      };
    });

    const sanitizedCampaign: CampaignConfig = {
      ...campaign,
      states: sanitizedStates,
    };

    // 1. Immediately backup locally so no data is ever lost
    try {
      localStorage.setItem(`sdo_player_camp_${slug}`, JSON.stringify(sanitizedCampaign));
      localStorage.setItem('sdo_player_camp_latest', JSON.stringify(sanitizedCampaign));
    } catch {}

    // 2. If no db instance or offline, local save is already completed
    if (!db) {
      return;
    }

    try {
      // Prepare and Save the Main Campaign JSON Document (including full states)
      const mainDocRef = doc(db, collections.campaignConfigs, slug);

      const nodesSummary: Record<string, { name: string; hasVideo: boolean; overlaysCount: number }> = {};
      Object.entries(sanitizedCampaign.states || {}).forEach(([nodeId, node]) => {
        nodesSummary[nodeId] = {
          name: node.name,
          hasVideo: !!node.videoUrl,
          overlaysCount: node.overlays?.length || 0,
        };
      });

      const mainPayload = cleanUndefinedFields({
        id: slug,
        slug: slug,
        name: sanitizedCampaign.name,
        presenterId: sanitizedCampaign.presenterId || 'presenter_elena_vance_san_francisco_01',
        initialNodeId: sanitizedCampaign.initialNodeId || Object.keys(sanitizedCampaign.states || {})[0] || 'node_intro',
        formsApiEndpoint: sanitizedCampaign.formsApiEndpoint,
        settings: sanitizedCampaign.settings,
        states: sanitizedCampaign.states,
        nodesSummary,
        isPublished: !!sanitizedCampaign.isPublished,
        publishedAt: sanitizedCampaign.publishedAt,
        updatedAt: Date.now(),
        createdAt: sanitizedCampaign.createdAt || Date.now(),
      });

      await setDoc(mainDocRef, mainPayload, { merge: true });

      // Save each scene/node in the subcollection `scenes/{nodeId}`
      if (sanitizedCampaign.states) {
        for (const [nodeId, node] of Object.entries(sanitizedCampaign.states)) {
          const sceneDocRef = doc(db, collections.campaignConfigs, slug, 'scenes', nodeId);

          const cardImages: string[] = [];
          node.overlays?.forEach((ov) => {
            if (ov.imageUrl) cardImages.push(ov.imageUrl);
            ov.carouselItems?.forEach((c) => {
              if (c.imageUrl) cardImages.push(c.imageUrl);
            });
          });

          const scenePayload: SceneDocument = {
            id: nodeId,
            nodeId: nodeId,
            name: node.name,
            description: node.description,
            mediaAssets: {
              videoUrl: node.videoUrl || '',
              fallbackVideoUrl: node.fallbackVideoUrl,
              mediaId: node.mediaId,
              mediaName: node.mediaName,
              cardImages,
            },
            triggers: {
              autoPlay: node.autoPlay ?? true,
              loopUntilTrigger: node.loopUntilTrigger ?? node.loop ?? true,
              soundEnabled: node.soundEnabled ?? true,
              micPosition: node.micPosition ?? 'center',
              micActionType: node.micActionType ?? 'open_text_input',
              clickMicTargetNodeId: node.clickMicTargetNodeId,
              autoTransitionOnEnd: node.autoTransitionOnEnd ?? false,
              autoTransitionTarget: node.autoTransitionTarget,
              autoTransitionDelaySec: node.autoTransitionDelaySec,
              allowedIntents: node.allowedIntents,
            },
            cardsAndOverlays: {
              overlays: node.overlays || [],
            },
            formApiConfig: {
              apiEndpoint: node.formsApiEndpoint,
            },
            updatedAt: Date.now(),
          };

          await setDoc(sceneDocRef, cleanUndefinedFields(scenePayload), { merge: true });
        }
      }
    } catch (err) {
      console.warn('[FirestoreService] Firestore remote save notice (local saved):', err);
    }
  }

  /**
   * List all saved campaigns from Firestore and LocalStorage
   */
  public static async listAllCampaigns(
    db: Firestore | undefined,
    collections: Required<FlowPlayerCollectionsConfig>
  ): Promise<CampaignConfig[]> {
    const campaignsMap = new Map<string, CampaignConfig>();

    // 1. Load all from LocalStorage
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sdo_player_camp_') && key !== 'sdo_player_camp_latest') {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            if (data && (data.id || data.slug)) {
              campaignsMap.set(data.slug || data.id, data);
            }
          } catch {}
        }
      }
    } catch {}

    // 2. Load from Firestore if db is available
    if (db) {
      try {
        const collRef = collection(db, collections.campaignConfigs);
        const collSnap = await getDocs(collRef);
        collSnap.forEach((docSnap) => {
          const data = docSnap.data() as CampaignConfig;
          const slug = data.slug || docSnap.id;
          campaignsMap.set(slug, {
            ...data,
            id: slug,
            slug: slug,
          });
        });
      } catch (err) {
        console.warn('[FirestoreService] listAllCampaigns remote fetch notice:', err);
      }
    }

    // Always ensure default campaign exists if empty
    if (campaignsMap.size === 0) {
      campaignsMap.set(
        DEFAULT_CAMPAIGN_CONFIG.slug || DEFAULT_CAMPAIGN_CONFIG.id,
        DEFAULT_CAMPAIGN_CONFIG
      );
    }

    return Array.from(campaignsMap.values()).sort(
      (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)
    );
  }

  /**
   * Delete campaign by slug from Firestore and LocalStorage
   */
  public static async deleteCampaign(
    db: Firestore | undefined,
    collections: Required<FlowPlayerCollectionsConfig>,
    slug: string
  ): Promise<void> {
    try {
      localStorage.removeItem(`sdo_player_camp_${slug}`);
    } catch {}

    if (db) {
      try {
        const docRef = doc(db, collections.campaignConfigs, slug);
        await deleteDoc(docRef);
      } catch (err) {
        console.warn('[FirestoreService] deleteCampaign notice:', err);
      }
    }
  }

  /**
   * Duplicate existing campaign
   */
  public static async duplicateCampaign(
    db: Firestore | undefined,
    collections: Required<FlowPlayerCollectionsConfig>,
    sourceCampaign: CampaignConfig,
    newName: string,
    newSlug: string
  ): Promise<CampaignConfig> {
    const duplicated: CampaignConfig = {
      ...sourceCampaign,
      id: newSlug,
      slug: newSlug,
      name: newName,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isPublished: false,
    };

    if (db) {
      await this.saveCampaignConfig(db, collections, duplicated);
    } else {
      localStorage.setItem(`sdo_player_camp_${newSlug}`, JSON.stringify(duplicated));
    }

    return duplicated;
  }

  /**
   * Telemetry recording
   */
  public static async recordSessionEvent(
    db: Firestore,
    collections: Required<FlowPlayerCollectionsConfig>,
    sessionId: string,
    campaignId: string,
    event: SessionTelemetryEvent
  ): Promise<void> {
    try {
      const sessionDocRef = doc(db, collections.sessionEvents, sessionId);
      await setDoc(
        sessionDocRef,
        {
          sessionId,
          campaignId,
          updatedAt: Date.now(),
          events: [event],
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('[FirestoreService] Telemetry log warning:', err);
    }
  }
}
