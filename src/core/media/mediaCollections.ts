import { SYSTEM_COLLECTIONS } from '../contracts/collections';
import { MediaGalleryCollectionsConfig } from '../contracts';

export function resolveMediaCollections(prefix?: string, custom?: MediaGalleryCollectionsConfig) {
  const mediaItems = custom?.mediaItems || (prefix ? `${prefix}_media_items` : SYSTEM_COLLECTIONS.MEDIA_ITEMS);
  const folders = custom?.folders || (prefix ? `${prefix}_media_folders` : SYSTEM_COLLECTIONS.MEDIA_FOLDERS);
  return { mediaItems, folders };
}
