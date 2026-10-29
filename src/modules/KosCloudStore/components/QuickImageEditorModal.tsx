import React, { useEffect } from 'react';
import { MediaItem } from '../types';
import { useMediaGallery } from '../context/MediaGalleryContext';

interface QuickImageEditorModalProps {
  item: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  theme?: 'dark' | 'light';
}

/**
 * QuickImageEditorModal is now completely unified into ImageConverterModal (the single master editor).
 * This proxy component ensures backwards compatibility by delegating any open event directly
 * to ImageConverterModal via setConverterItem.
 */
export const QuickImageEditorModal: React.FC<QuickImageEditorModalProps> = ({
  item,
  isOpen,
  onClose,
}) => {
  const { setConverterItem } = useMediaGallery();

  useEffect(() => {
    if (isOpen && item) {
      setConverterItem(item);
      onClose();
    }
  }, [isOpen, item, setConverterItem, onClose]);

  return null;
};
