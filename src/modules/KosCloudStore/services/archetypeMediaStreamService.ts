import { Firestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { MediaItem, MediaFolder } from '../../../core/contracts';
import { FirestoreMediaService } from './firestoreMediaService';
import { useState, useEffect } from 'react';

/**
 * 📁 הגדרת תיקיות רשמיות ב-KosCloudStore לכל סגנון וארכיטיפ
 * נשמרות בקולקציית sdo_media_folders
 */
export const ARCHETYPE_MEDIA_FOLDERS: Record<string, MediaFolder> = {
  wellness: {
    id: 'folder_arch_wellness',
    name: '🌿 מדיה - סגנון Wellness',
    color: '#10B981',
    icon: 'Sparkles',
    sourceModule: 'KosCloudStore',
    isShared: true,
    createdAt: 1700000000000,
  },
  lawyer: {
    id: 'folder_arch_lawyer',
    name: '⚖️ מדיה - סגנון משפטי',
    color: '#D97706',
    icon: 'Briefcase',
    sourceModule: 'KosCloudStore',
    isShared: true,
    createdAt: 1700000000000,
  },
  feminine: {
    id: 'folder_arch_feminine',
    name: '✨ מדיה - סגנון אלגנטי ונשי',
    color: '#EC4899',
    icon: 'Heart',
    sourceModule: 'KosCloudStore',
    isShared: true,
    createdAt: 1700000000000,
  },
  masculine: {
    id: 'folder_arch_masculine',
    name: '⚡ מדיה - סגנון עוצמתי וספורט',
    color: '#3B82F6',
    icon: 'Shield',
    sourceModule: 'KosCloudStore',
    isShared: true,
    createdAt: 1700000000000,
  },
  kosun_portal: {
    id: 'folder_arch_kosun_portal',
    name: '🌌 מדיה - פורטל KOSUN',
    color: '#00F0FF',
    icon: 'Zap',
    sourceModule: 'KosCloudStore',
    isShared: true,
    createdAt: 1700000000000,
  },
};

/**
 * 🎞️ ספריית פריטי מדיה ציבוריים (תמונות + סרטוני וידאו לרקע) ב-KosCloudStore
 * נשמרים בקולקציית sdo_media_items ומקושרים לפי folderId
 */
export const ARCHETYPE_DEFAULT_MEDIA_ITEMS: Record<string, { image: MediaItem; video: MediaItem }> = {
  wellness: {
    image: {
      id: 'media_wellness_hero_img',
      name: 'שלווה, רוגע וטבע הוליסטי',
      type: 'image',
      mimeType: 'image/jpeg',
      url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1600&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=400&q=80',
      sizeBytes: 245000,
      folderId: 'folder_arch_wellness',
      tags: ['hero', 'backdrop', 'wellness'],
      createdAt: 1700000000000,
    },
    video: {
      id: 'media_wellness_hero_vid',
      name: 'זרימת מים וטבע שלווים (וידאו רקע)',
      type: 'video',
      mimeType: 'video/mp4',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-tree-branches-in-the-breeze-1188-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=400&q=80',
      sizeBytes: 1200000,
      folderId: 'folder_arch_wellness',
      tags: ['hero', 'video_bg', 'wellness'],
      createdAt: 1700000000000,
    },
  },
  lawyer: {
    image: {
      id: 'media_lawyer_hero_img',
      name: 'ספרייה משפטית וסמכות מקצועית',
      type: 'image',
      mimeType: 'image/jpeg',
      url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1600&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
      sizeBytes: 310000,
      folderId: 'folder_arch_lawyer',
      tags: ['hero', 'backdrop', 'lawyer'],
      createdAt: 1700000000000,
    },
    video: {
      id: 'media_lawyer_hero_vid',
      name: 'גורדי שחקים ועסקים (וידאו רקע)',
      type: 'video',
      mimeType: 'video/mp4',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-4284-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
      sizeBytes: 1800000,
      folderId: 'folder_arch_lawyer',
      tags: ['hero', 'video_bg', 'lawyer'],
      createdAt: 1700000000000,
    },
  },
  feminine: {
    image: {
      id: 'media_feminine_hero_img',
      name: 'אסתטיקה, יופי ורוז גולד',
      type: 'image',
      mimeType: 'image/jpeg',
      url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1600&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
      sizeBytes: 280000,
      folderId: 'folder_arch_feminine',
      tags: ['hero', 'backdrop', 'feminine'],
      createdAt: 1700000000000,
    },
    video: {
      id: 'media_feminine_hero_vid',
      name: 'נצנוצי אור ורוך אלגנטי (וידאו רקע)',
      type: 'video',
      mimeType: 'video/mp4',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-delicate-pink-rose-petals-falling-41318-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
      sizeBytes: 1500000,
      folderId: 'folder_arch_feminine',
      tags: ['hero', 'video_bg', 'feminine'],
      createdAt: 1700000000000,
    },
  },
  masculine: {
    image: {
      id: 'media_masculine_hero_img',
      name: 'אימונים, ביצועים וטקטיקה',
      type: 'image',
      mimeType: 'image/jpeg',
      url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1600&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&q=80',
      sizeBytes: 350000,
      folderId: 'folder_arch_masculine',
      tags: ['hero', 'backdrop', 'masculine'],
      createdAt: 1700000000000,
    },
    video: {
      id: 'media_masculine_hero_vid',
      name: 'תנועה דינמית ועוצמה (וידאו רקע)',
      type: 'video',
      mimeType: 'video/mp4',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-athlete-training-with-ropes-in-a-gym-42777-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&q=80',
      sizeBytes: 1900000,
      folderId: 'folder_arch_masculine',
      tags: ['hero', 'video_bg', 'masculine'],
      createdAt: 1700000000000,
    },
  },
  kosun_portal: {
    image: {
      id: 'media_kosun_hero_img',
      name: 'קוסמוס עתידני וחלל KOSUN',
      type: 'image',
      mimeType: 'image/jpeg',
      url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1600&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=400&q=80',
      sizeBytes: 420000,
      folderId: 'folder_arch_kosun_portal',
      tags: ['hero', 'backdrop', 'kosun_portal'],
      createdAt: 1700000000000,
    },
    video: {
      id: 'media_kosun_hero_vid',
      name: 'חלל עתידני וחלקיקי ניאון (וידאו רקע)',
      type: 'video',
      mimeType: 'video/mp4',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-blue-and-purple-neon-lights-tunnel-loop-42861-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=400&q=80',
      sizeBytes: 2100000,
      folderId: 'folder_arch_kosun_portal',
      tags: ['hero', 'video_bg', 'kosun_portal'],
      createdAt: 1700000000000,
    },
  },
};

/**
 * וידוא קיום תיקיות וקבצי מדיה ציבוריים ב-Firestore של KosCloudStore
 */
export async function seedArchetypeCloudStore(customDb?: Firestore): Promise<void> {
  const targetDb = customDb || db;
  if (!targetDb) return;

  try {
    // 1. שמירת תיקיות הסגנונות
    for (const folder of Object.values(ARCHETYPE_MEDIA_FOLDERS)) {
      await FirestoreMediaService.saveFolder(
        targetDb,
        { mediaItems: 'sdo_media_items', folders: 'sdo_media_folders' },
        folder
      ).catch(() => {});
    }

    // 2. שמירת קבצי המדיה הציבוריים
    for (const { image, video } of Object.values(ARCHETYPE_DEFAULT_MEDIA_ITEMS)) {
      await FirestoreMediaService.saveMediaItem(
        targetDb,
        { mediaItems: 'sdo_media_items', folders: 'sdo_media_folders' },
        image
      ).catch(() => {});
      await FirestoreMediaService.saveMediaItem(
        targetDb,
        { mediaItems: 'sdo_media_items', folders: 'sdo_media_folders' },
        video
      ).catch(() => {});
    }
  } catch (err) {
    console.warn('[ArchetypeMediaStream] Seed error:', err);
  }
}

/**
 * ⚡ Hook להזרמת נתוני מדיה חיה מ-KosCloudStore לפי ארכיטיפ
 * מקשיב בזמן אמת ל-sdo_media_items ומסנן לפי תיקייה וארכיטיפ
 */
export function useArchetypeMediaStream(archetypeId: string = 'wellness') {
  const [streamedItems, setStreamedItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!db) {
      setIsLoading(false);
      return;
    }

    // הפעלת seed ראשוני אם נדרש
    seedArchetypeCloudStore(db).catch(() => {});

    // הזרמה חיה מקולקציית sdo_media_items
    const unsubscribe = FirestoreMediaService.subscribeMediaItems(
      db,
      (allItems) => {
        setStreamedItems(allItems);
        setIsLoading(false);
      },
      { mediaItems: 'sdo_media_items', folders: 'sdo_media_folders' }
    );

    return () => unsubscribe();
  }, []);

  const targetFolderId = `folder_arch_${archetypeId}`;
  const fallbackPreset = ARCHETYPE_DEFAULT_MEDIA_ITEMS[archetypeId] || ARCHETYPE_DEFAULT_MEDIA_ITEMS.wellness;

  // סינון פריטי המדיה השייכים לתיקיית הסגנון הנוכחי
  const folderItems = streamedItems.filter(
    (item) => item.folderId === targetFolderId || item.tags?.includes(archetypeId)
  );

  // חילוץ תמונת השער הפעילה
  const heroImageItem = folderItems.find((i) => i.type === 'image') || fallbackPreset.image;

  // חילוץ וידאו הרקע הפעיל
  const heroVideoItem = folderItems.find((i) => i.type === 'video') || fallbackPreset.video;

  return {
    allItems: folderItems.length > 0 ? folderItems : [fallbackPreset.image, fallbackPreset.video],
    heroImageUrl: heroImageItem.url,
    heroVideoUrl: heroVideoItem.url,
    heroImageItem,
    heroVideoItem,
    isLoading,
  };
}
