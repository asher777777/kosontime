import React, { useState, useEffect, useRef } from 'react';

// Lightweight fallback for crop interface without requiring uninstalled external peer-dependency
export interface Crop {
  unit?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}
export type PixelCrop = Crop;
const ReactCrop: React.FC<{ children?: React.ReactNode; [key: string]: any }> = ({ children }) => <div className="relative inline-block overflow-hidden">{children}</div>;
import {
  X,
  Sparkles,
  Download,
  Save,
  Check,
  RefreshCw,
  Layers,
  Crop as CropIcon,
  Eraser,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Wand2,
  AlertTriangle,
  SlidersHorizontal,
  Maximize2,
  Minimize2,
  FileCode,
  Archive,
  Eye,
  Settings2,
  ZoomIn,
  ZoomOut,
  Palette,
  CheckCircle2,
} from 'lucide-react';
import { useMediaGallery } from '../context/MediaGalleryContext';
import { FileCompressionService } from '../services/fileCompressionService';
import { BackgroundRemovalService } from '../services/backgroundRemovalService';
import { MediaIndexedDbService } from '../services/mediaIndexedDbService';
import { ImageConversionOptions, MediaItem } from '../types';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { BrandDnaContract } from '../../../core/contracts';

export const ImageConverterModal: React.FC = () => {
  const {
    converterItem,
    setConverterItem,
    addMediaItems,
    replaceMediaItem,
    theme,
    selectionMode,
    onSelectMedia,
    openAiImageGenerator,
  } = useMediaGallery();
  const isLight = theme === 'light';

  const { getCapability } = useHostCapabilities();
  const brandContract = getCapability<BrandDnaContract>('brand-dna');
  const brandDna = brandContract ? brandContract.getBrandDna() : null;
  const brandLogo = brandDna?.identity?.logoUrl;

  // Active Tool Tab: 'remove_bg' | 'crop' | 'transform' | 'watermark' | 'compress' | 'resize' | 'data'
  const [activeTab, setActiveTab] = useState<'remove_bg' | 'crop' | 'transform' | 'watermark' | 'compress' | 'resize' | 'data'>('remove_bg');

  // Working image (original, cropped, or transparent)
  const [workingImageUrl, setWorkingImageUrl] = useState<string>('');
  const [isBgRemoved, setIsBgRemoved] = useState<boolean>(false);
  const [bgTolerance, setBgTolerance] = useState<number>(20);
  const [bgFeather, setBgFeather] = useState<number>(2);

  // Transformations (Rotation & Flip)
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // Watermark states
  const [watermarkEnabled, setWatermarkEnabled] = useState<boolean>(false);
  const [watermarkPosition, setWatermarkPosition] = useState<'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'center'>('bottom-right');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.85);
  const [customWatermarkUrl, setCustomWatermarkUrl] = useState<string>('');

  // Crop states
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined);
  const [isCropApplied, setIsCropApplied] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Conversion / Compression states
  const [targetFormat, setTargetFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [quality, setQuality] = useState<number>(0.9);
  const [maxWidth, setMaxWidth] = useState<string>('');
  const [maxHeight, setMaxHeight] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [convertedResult, setConvertedResult] = useState<{
    blob: Blob;
    dataUrl: string;
    objectUrl: string;
    sizeBytes: number;
    width?: number;
    height?: number;
  } | null>(null);

  // Save mode: 'new' (default) | 'replace' (overwrite original)
  const [saveMode, setSaveMode] = useState<'new' | 'replace'>('new');
  const [targetFileName, setTargetFileName] = useState<string>('');

  // Zoom / Viewport scale
  const [zoomScale, setZoomScale] = useState<number>(1);

  // Data / Non-image mode
  const [dataResultText, setDataResultText] = useState<string>('');
  const [dataTargetFormat, setDataTargetFormat] = useState<'csv' | 'json'>('csv');
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);

  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Initialize on open with IndexedDB binary blob resolution
  useEffect(() => {
    if (!converterItem) {
      setConvertedResult(null);
      setWorkingImageUrl('');
      setIsBgRemoved(false);
      setCrop(undefined);
      setCompletedCrop(null);
      setIsCropApplied(false);
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
      setWatermarkEnabled(false);
      return;
    }

    let isSubscribed = true;

    const initModal = async () => {
      let activeUrl = converterItem.url;
      try {
        const localBlob =
          (await MediaIndexedDbService.getBlob(converterItem.id)) ||
          (await MediaIndexedDbService.getBlob(converterItem.name));
        if (localBlob && isSubscribed) {
          activeUrl = URL.createObjectURL(localBlob);
          console.log('[ImageConverterModal] Found binary blob in IndexedDB, using fresh local object URL');
        } else if (activeUrl && activeUrl.startsWith('http')) {
          try {
            const resp = await fetch(activeUrl, { mode: 'cors' });
            if (resp.ok) {
              const fetchedBlob = await resp.blob();
              if (isSubscribed) {
                activeUrl = URL.createObjectURL(fetchedBlob);
                MediaIndexedDbService.saveMedia(converterItem, fetchedBlob).catch(() => {});
              }
            }
          } catch (fetchErr) {
            console.warn('[ImageConverterModal] Remote fetch blob notice:', fetchErr);
          }
        }
      } catch (idbErr) {
        console.warn('[ImageConverterModal] IndexedDB blob lookup error:', idbErr);
      }

      if (!isSubscribed) return;

      setWorkingImageUrl(activeUrl);
      setIsBgRemoved(false);
      setCrop(undefined);
      setCompletedCrop(null);
      setIsCropApplied(false);
      setZoomScale(1);

      const ext = converterItem.name.includes('.') ? converterItem.name.split('.').pop()?.toLowerCase() : 'png';
      const baseName = converterItem.name.replace(/\.[^/.]+$/, '');
      setTargetFileName(`${baseName}_ערוך.${ext || 'png'}`);
      setSaveMode('new');

      if (converterItem.type === 'image') {
        setActiveTab('remove_bg');
        handleConvertPreview(activeUrl);
      } else if (
        converterItem.type === 'code' ||
        converterItem.name.endsWith('.json') ||
        converterItem.name.endsWith('.csv')
      ) {
        setActiveTab('data');
        handleDataConvertPreview();
      } else {
        setActiveTab('data');
        handleCreateZipPreview();
      }
    };

    initModal();

    return () => {
      isSubscribed = false;
    };
  }, [converterItem]);

  // Re-run compression preview whenever settings change
  useEffect(() => {
    if (converterItem?.type === 'image' && workingImageUrl) {
      handleConvertPreview(workingImageUrl);
    }
  }, [workingImageUrl, targetFormat, quality, maxWidth, maxHeight]);

  // Auto-initialize crop bounds when switching to crop tab
  useEffect(() => {
    if (activeTab === 'crop') {
      applyCropPreset(aspectRatio);
    }
  }, [activeTab]);

  if (!converterItem) return null;

  // 1. Conversion Preview
  const handleConvertPreview = async (sourceUrl: string) => {
    if (!converterItem || converterItem.type !== 'image') return;
    setIsProcessing(true);
    try {
      const options: ImageConversionOptions = {
        targetFormat: isBgRemoved ? 'image/png' : targetFormat,
        quality,
        maxWidth: maxWidth ? parseInt(maxWidth, 10) : undefined,
        maxHeight: maxHeight ? parseInt(maxHeight, 10) : undefined,
        preserveAspectRatio: true,
      };

      const res = await FileCompressionService.convertAndCompressImage(sourceUrl, options);
      setConvertedResult(res);
    } catch (err) {
      console.warn('[ImageConverter] Preview error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // 📐 חישוב גבולות קרופ לפי יחס גובה-רוחב
  const applyCropPreset = (ratio?: number) => {
    setAspectRatio(ratio);
    const img = imgRef.current;
    if (img && (img.clientWidth || img.width || img.naturalWidth)) {
      const w = img.clientWidth || img.width || 400;
      const h = img.clientHeight || img.height || 300;
      let cropWidth = Math.round(w * 0.85);
      let cropHeight = ratio ? Math.round(cropWidth / ratio) : Math.round(h * 0.85);
      if (cropHeight > h) {
        cropHeight = Math.round(h * 0.85);
        cropWidth = ratio ? Math.round(cropHeight * ratio) : cropWidth;
      }
      const newCrop: PixelCrop = {
        unit: 'px',
        x: Math.round((w - cropWidth) / 2),
        y: Math.round((h - cropHeight) / 2),
        width: cropWidth,
        height: cropHeight,
      };
      setCrop(newCrop);
      setCompletedCrop(newCrop);
    } else {
      const newCrop: PixelCrop = {
        unit: '%',
        width: 80,
        height: ratio ? Math.min(80, 80 / ratio) : 80,
        x: 10,
        y: 10,
      };
      setCrop(newCrop);
      setCompletedCrop(newCrop);
    }
  };

  // 2. Crop Action
  const handleApplyCrop = async () => {
    if (!imgRef.current || !completedCrop || !completedCrop.width || !completedCrop.height) {
      return;
    }

    setIsProcessing(true);
    setStatusMessage('✂️ מבצע חיתוך תמונה...');
    try {
      const image = imgRef.current;
      const canvas = document.createElement('canvas');
      const renderedWidth = image.clientWidth || image.width || image.naturalWidth || 1;
      const renderedHeight = image.clientHeight || image.height || image.naturalHeight || 1;
      const scaleX = (image.naturalWidth || renderedWidth) / renderedWidth;
      const scaleY = (image.naturalHeight || renderedHeight) / renderedHeight;

      let cropX = completedCrop.x || 0;
      let cropY = completedCrop.y || 0;
      let cropW = completedCrop.width || renderedWidth;
      let cropH = completedCrop.height || renderedHeight;

      if (completedCrop.unit === '%') {
        cropX = (cropX / 100) * renderedWidth;
        cropY = (cropY / 100) * renderedHeight;
        cropW = (cropW / 100) * renderedWidth;
        cropH = (cropH / 100) * renderedHeight;
      }

      canvas.width = Math.max(1, Math.floor(cropW * scaleX));
      canvas.height = Math.max(1, Math.floor(cropH * scaleY));
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      try {
        ctx.drawImage(
          image,
          Math.floor(cropX * scaleX),
          Math.floor(cropY * scaleY),
          Math.floor(cropW * scaleX),
          Math.floor(cropH * scaleY),
          0,
          0,
          canvas.width,
          canvas.height
        );
      } catch (drawErr) {
        console.warn('[ImageConverter] Direct drawImage failed, fallback with fresh ImageBitmap:', drawErr);
        const resp = await fetch(workingImageUrl);
        const blob = await resp.blob();
        const bitmap = await createImageBitmap(blob);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(
          bitmap,
          Math.floor(cropX * scaleX),
          Math.floor(cropY * scaleY),
          Math.floor(cropW * scaleX),
          Math.floor(cropH * scaleY),
          0,
          0,
          canvas.width,
          canvas.height
        );
      }

      const croppedDataUrl = canvas.toDataURL(isBgRemoved ? 'image/png' : targetFormat, 0.95);
      setWorkingImageUrl(croppedDataUrl);
      setIsCropApplied(true);
      setCrop(undefined);
      setCompletedCrop(null);

      const baseName = converterItem.name.replace(/\.[^/.]+$/, '');
      const ext = targetFormat.split('/')[1] || 'png';
      setTargetFileName(`${baseName}_חתוך.${ext}`);
      setStatusMessage('✂️ החיתוך בוצע בהצלחה!');
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err) {
      console.warn('[ImageConverter] Crop error:', err);
      setStatusMessage('שגיאה בביצוע החיתוך.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Background Removal Action
  const handleRemoveBackground = async () => {
    setIsProcessing(true);
    setStatusMessage('🪄 מסיר רקע ומבודד את האלמנט...');
    try {
      const res = await BackgroundRemovalService.removeBackground(workingImageUrl, {
        tolerance: bgTolerance,
        feather: bgFeather,
        floodFillOnly: true,
      });

      setWorkingImageUrl(res.dataUrl);
      setIsBgRemoved(true);
      setTargetFormat('image/png'); // Transparent output requires PNG

      const baseName = converterItem.name.replace(/\.[^/.]+$/, '');
      setTargetFileName(`${baseName}_ללא_רקע.png`);
      setStatusMessage('✨ הרקע הוסר בהצלחה! התמונה הפכה ל-PNG שקוף.');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      console.warn('[ImageConverter] Remove BG error:', err);
      setStatusMessage('שגיאה בהסרת הרקע. נסה להתאים את סרגל הרגישות.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset to original unedited state
  const handleResetToOriginal = () => {
    setWorkingImageUrl(converterItem.url);
    setIsBgRemoved(false);
    setCrop(undefined);
    setCompletedCrop(null);
    setIsCropApplied(false);
    setTargetFormat('image/png');
    const baseName = converterItem.name.replace(/\.[^/.]+$/, '');
    setTargetFileName(`${baseName}_ערוך.png`);
    setStatusMessage('שוחזרה התמונה המקורית.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Data / Non-image Handlers
  const handleDataConvertPreview = async () => {
    if (!converterItem) return;
    setIsProcessing(true);
    try {
      const res = await fetch(converterItem.url);
      const rawText = await res.text();
      if (converterItem.name.toLowerCase().endsWith('.json') || dataTargetFormat === 'csv') {
        const csv = FileCompressionService.jsonToCsv(rawText);
        setDataResultText(csv);
        setDataTargetFormat('csv');
      } else {
        const json = FileCompressionService.csvToJson(rawText);
        setDataResultText(json);
        setDataTargetFormat('json');
      }
    } catch (err) {
      console.warn('[DataConverter] Error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateZipPreview = async () => {
    if (!converterItem) return;
    setIsProcessing(true);
    try {
      const res = await fetch(converterItem.url);
      const blob = await res.blob();
      const zip = await FileCompressionService.createZipArchive([{ name: converterItem.name, data: blob }]);
      setZipBlob(zip);
    } catch (err) {
      console.warn('[ZipConverter] Error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Download Handler
  const handleDownload = () => {
    if (converterItem.type === 'image' && convertedResult) {
      const finalName = targetFileName.trim() || `image_edited.${targetFormat.split('/')[1]}`;
      FileCompressionService.downloadMedia(convertedResult.objectUrl, finalName);
    } else if (activeTab === 'data' && dataResultText) {
      const baseName = converterItem.name.replace(/\.[^/.]+$/, '');
      const newFileName = `${baseName}_converted.${dataTargetFormat}`;
      const blob = new Blob([dataResultText], { type: dataTargetFormat === 'csv' ? 'text/csv' : 'application/json' });
      FileCompressionService.downloadMedia(blob, newFileName);
    } else if (zipBlob) {
      const baseName = converterItem.name.replace(/\.[^/.]+$/, '');
      FileCompressionService.downloadMedia(zipBlob, `${baseName}.zip`);
    }
  };

  // 4. Transform & Watermark Canvas Engine
  const createTransformedCanvas = async (sourceUrl: string): Promise<HTMLCanvasElement> => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = async () => {
        try {
          const resp = await fetch(sourceUrl);
          const blob = await resp.blob();
          const fresh = URL.createObjectURL(blob);
          const retryImg = new Image();
          retryImg.onload = () => {
            img.src = fresh;
            resolve();
          };
          retryImg.onerror = reject;
          retryImg.src = fresh;
        } catch (e) {
          reject(e);
        }
      };
      img.src = sourceUrl;
    });

    const origW = img.naturalWidth || img.width || 800;
    const origH = img.naturalHeight || img.height || 600;

    const rot = (rotation || 0) % 360;
    const isSwapped = rot === 90 || rot === 270;

    const canvas = document.createElement('canvas');
    canvas.width = isSwapped ? origH : origW;
    canvas.height = isSwapped ? origW : origH;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D canvas context');

    // 1. Draw image with rotation and flips
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rot * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(img, -origW / 2, -origH / 2, origW, origH);
    ctx.restore();

    // 2. Draw watermark if enabled
    const activeLogoUrl = customWatermarkUrl || brandLogo;
    if (watermarkEnabled && activeLogoUrl) {
      try {
        const wmImg = new Image();
        wmImg.crossOrigin = 'anonymous';
        await new Promise<void>((res) => {
          wmImg.onload = () => res();
          wmImg.onerror = () => res();
          wmImg.src = activeLogoUrl;
        });

        if (wmImg.complete && wmImg.naturalWidth) {
          ctx.save();
          ctx.globalAlpha = watermarkOpacity ?? 0.85;

          const maxWmW = canvas.width * 0.22;
          const aspect = wmImg.naturalHeight / wmImg.naturalWidth;
          const wmW = maxWmW;
          const wmH = maxWmW * aspect;
          const margin = canvas.width * 0.03;

          let wx = canvas.width - wmW - margin;
          let wy = canvas.height - wmH - margin;

          if (watermarkPosition === 'bottom-left') {
            wx = margin;
            wy = canvas.height - wmH - margin;
          } else if (watermarkPosition === 'top-left') {
            wx = margin;
            wy = margin;
          } else if (watermarkPosition === 'top-right') {
            wx = canvas.width - wmW - margin;
            wy = margin;
          } else if (watermarkPosition === 'center') {
            wx = (canvas.width - wmW) / 2;
            wy = (canvas.height - wmH) / 2;
          }

          ctx.drawImage(wmImg, wx, wy, wmW, wmH);
          ctx.restore();
        }
      } catch (wmErr) {
        console.warn('[ImageConverter] Watermark bake notice:', wmErr);
      }
    }

    return canvas;
  };

  const handleBakeTransformations = async () => {
    setIsProcessing(true);
    setStatusMessage('🔄 מחיל סיבוב והיפוך על התמונה...');
    try {
      const canvas = await createTransformedCanvas(workingImageUrl);
      const dataUrl = canvas.toDataURL(isBgRemoved ? 'image/png' : targetFormat, 0.95);
      setWorkingImageUrl(dataUrl);
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
      setWatermarkEnabled(false);
      setStatusMessage('✅ הסיבוב/היפוך נקבע בהצלחה!');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.warn('[ImageConverter] Bake transformation error:', err);
      setStatusMessage('שגיאה בהחלת הסיבוב.');
    } finally {
      setIsProcessing(false);
    }
  };

  const performSaveImage = async (): Promise<MediaItem | null> => {
    if (!converterItem) return null;
    let baseWorkingUrl = workingImageUrl;

    // If rotation, flip or watermark are active, bake them first
    if (rotation !== 0 || flipH || flipV || (watermarkEnabled && (brandLogo || customWatermarkUrl))) {
      try {
        const canvas = await createTransformedCanvas(baseWorkingUrl);
        baseWorkingUrl = canvas.toDataURL(isBgRemoved ? 'image/png' : targetFormat, 0.95);
        setWorkingImageUrl(baseWorkingUrl);
        setRotation(0);
        setFlipH(false);
        setFlipV(false);
        setWatermarkEnabled(false);
      } catch (bakeErr) {
        console.warn('[ImageConverter] Pre-save bake notice:', bakeErr);
      }
    }

    let resultToSave = convertedResult;
    if (!resultToSave || baseWorkingUrl !== workingImageUrl) {
      try {
        resultToSave = await FileCompressionService.convertAndCompressImage(baseWorkingUrl, {
          targetFormat: isBgRemoved ? 'image/png' : targetFormat,
          quality,
          maxWidth: maxWidth ? parseInt(maxWidth, 10) : undefined,
          maxHeight: maxHeight ? parseInt(maxHeight, 10) : undefined,
          preserveAspectRatio: true,
        });
      } catch (compErr) {
        console.warn('[ImageConverter] Direct convert failed, fallback to blob fetch:', compErr);
        const resp = await fetch(baseWorkingUrl);
        const blob = await resp.blob();
        resultToSave = {
          blob,
          dataUrl: baseWorkingUrl,
          objectUrl: URL.createObjectURL(blob),
          sizeBytes: blob.size,
          width: imgRef.current?.naturalWidth || 800,
          height: imgRef.current?.naturalHeight || 600,
        };
      }
    }

    if (!resultToSave) {
      throw new Error('לא ניתן היה לעבד את קובץ התמונה לשמירה');
    }

    const finalExt = targetFormat.split('/')[1] || 'png';
    let finalName = targetFileName.trim();

    if (saveMode === 'replace') {
      finalName = converterItem.name;
    } else if (!finalName) {
      const baseName = converterItem.name.replace(/\.[^/.]+$/, '');
      finalName = `${baseName}_ערוך.${finalExt}`;
    }

    const file = new File([resultToSave.blob], finalName, { type: targetFormat });

    if (saveMode === 'replace') {
      const updatedItem: MediaItem = {
        ...converterItem,
        name: finalName,
        mimeType: targetFormat,
        url: resultToSave.dataUrl || resultToSave.objectUrl,
        thumbnailUrl: resultToSave.dataUrl || resultToSave.objectUrl,
        sizeBytes: resultToSave.sizeBytes,
        width: resultToSave.width || converterItem.width,
        height: resultToSave.height || converterItem.height,
        updatedAt: Date.now(),
        tags: Array.from(new Set([...(converterItem.tags || []), 'edited', finalExt, isBgRemoved ? 'transparent' : ''])),
      };

      await replaceMediaItem(converterItem.id, updatedItem, file);
      return updatedItem;
    } else {
      const newItem: MediaItem = {
        id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        name: finalName,
        type: 'image',
        mimeType: targetFormat,
        url: resultToSave.dataUrl || resultToSave.objectUrl,
        thumbnailUrl: resultToSave.dataUrl || resultToSave.objectUrl,
        sizeBytes: resultToSave.sizeBytes,
        width: resultToSave.width,
        height: resultToSave.height,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        folderId: converterItem.folderId,
        sourceModule: converterItem.sourceModule,
        sourceModuleLabel: converterItem.sourceModuleLabel,
        tags: [...(converterItem.tags || []), 'edited', finalExt, isBgRemoved ? 'transparent' : ''],
      };

      await addMediaItems([newItem], [file]);
      return newItem;
    }
  };

  // Save to Gallery Handler (Supports Save as New OR Replace Original)
  const handleSaveToGallery = async () => {
    setIsProcessing(true);
    setStatusMessage('💾 שומר שינויים בגלריה...');
    try {
      if (converterItem.type === 'image') {
        await performSaveImage();
      } else if (activeTab === 'data' && dataResultText) {
        const baseName = converterItem.name.replace(/\.[^/.]+$/, '');
        const newFileName = `${baseName}_converted.${dataTargetFormat}`;
        const blob = new Blob([dataResultText], { type: dataTargetFormat === 'csv' ? 'text/csv' : 'application/json' });
        const objectUrl = URL.createObjectURL(blob);

        const newItem: MediaItem = {
          id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          name: newFileName,
          type: 'code',
          mimeType: dataTargetFormat === 'csv' ? 'text/csv' : 'application/json',
          url: objectUrl,
          sizeBytes: blob.size,
          createdAt: Date.now(),
          folderId: converterItem.folderId,
          sourceModule: converterItem.sourceModule,
          sourceModuleLabel: converterItem.sourceModuleLabel,
          tags: [...(converterItem.tags || []), 'converted', dataTargetFormat],
        };

        await addMediaItems([newItem], [blob]);
      }

      setSaveSuccess(true);
      setStatusMessage('✅ הקובץ נשמר בהצלחה בגלריה!');
      setTimeout(() => {
        setSaveSuccess(false);
        setConverterItem(null);
      }, 1200);
    } catch (saveErr: any) {
      console.error('[ImageConverter] Save to gallery error:', saveErr);
      setStatusMessage(`שגיאה בשמירה: ${saveErr?.message || saveErr}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Save and Pick directly for calling Component (Selection Mode)
  const handleSaveAndSelect = async () => {
    setIsProcessing(true);
    setStatusMessage('💾 שומר ובוחר תמונה לרכיב...');
    try {
      const savedItem = await performSaveImage();
      if (savedItem && onSelectMedia) {
        onSelectMedia([savedItem]);
      }
      setSaveSuccess(true);
      setStatusMessage('✅ התמונה נשמרה ונבחרה בהצלחה לרכיב!');
      setTimeout(() => {
        setSaveSuccess(false);
        setConverterItem(null);
      }, 500);
    } catch (saveErr: any) {
      console.error('[ImageConverter] Save and select error:', saveErr);
      setStatusMessage(`שגיאה בשמירה ובחירה: ${saveErr?.message || saveErr}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatExt = targetFormat.split('/')[1].toUpperCase();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in font-sans"
      dir="rtl"
    >
      <div
        className={`w-full max-w-6xl h-[92vh] max-h-[95vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden animate-scale-up ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        {/* 1. Ultra-Clean Top Bar: Title & Tool Tabs */}
        <header
          className={`px-5 py-3.5 border-b flex flex-wrap items-center justify-between gap-3 flex-shrink-0 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'
          }`}
        >
          {/* Title & Badge */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-black flex items-center justify-center shadow-md flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <h2 className="text-sm sm:text-base font-bold truncate">
                  KosCloudStore - סטודיו עריכת תמונות
                </h2>
                {isBgRemoved && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                    רקע שקוף פעיל
                  </span>
                )}
              </div>
              <p className={`text-[11px] truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {converterItem.name} • {FileCompressionService.formatBytes(converterItem.sizeBytes)}
              </p>
            </div>
          </div>

          {/* Center Tool Navigation Tabs */}
          {converterItem.type === 'image' && (
            <nav className="flex items-center p-1 rounded-2xl bg-slate-800/20 dark:bg-slate-950 border border-slate-300 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('remove_bg')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center space-x-1.5 rtl:space-x-reverse transition-all cursor-pointer ${
                  activeTab === 'remove_bg'
                    ? 'bg-amber-500 text-black shadow-md'
                    : isLight
                    ? 'text-slate-700 hover:text-black hover:bg-slate-200'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>הסרת רקע</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('crop');
                  applyCropPreset(aspectRatio);
                }}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center space-x-1.5 rtl:space-x-reverse transition-all cursor-pointer ${
                  activeTab === 'crop'
                    ? 'bg-amber-500 text-black shadow-md'
                    : isLight
                    ? 'text-slate-700 hover:text-black hover:bg-slate-200'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <CropIcon className="w-3.5 h-3.5" />
                <span>חיתוך וקרופ</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('transform')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center space-x-1.5 rtl:space-x-reverse transition-all cursor-pointer ${
                  activeTab === 'transform'
                    ? 'bg-amber-500 text-black shadow-md'
                    : isLight
                    ? 'text-slate-700 hover:text-black hover:bg-slate-200'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>סיבוב והיפוך</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('watermark')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center space-x-1.5 rtl:space-x-reverse transition-all cursor-pointer ${
                  activeTab === 'watermark'
                    ? 'bg-amber-500 text-black shadow-md'
                    : isLight
                    ? 'text-slate-700 hover:text-black hover:bg-slate-200'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>חותמת מותג</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('compress')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center space-x-1.5 rtl:space-x-reverse transition-all cursor-pointer ${
                  activeTab === 'compress'
                    ? 'bg-amber-500 text-black shadow-md'
                    : isLight
                    ? 'text-slate-700 hover:text-black hover:bg-slate-200'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>פורמט ודחיסה</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('resize')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center space-x-1.5 rtl:space-x-reverse transition-all cursor-pointer ${
                  activeTab === 'resize'
                    ? 'bg-amber-500 text-black shadow-md'
                    : isLight
                    ? 'text-slate-700 hover:text-black hover:bg-slate-200'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>מידות (Resize)</span>
              </button>
            </nav>
          )}

          {/* Right Header Actions */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {selectionMode && (
              <button
                type="button"
                onClick={handleSaveAndSelect}
                disabled={isProcessing}
                className="px-3.5 py-1.5 rounded-xl font-black text-xs bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-black flex items-center space-x-1.5 rtl:space-x-reverse shadow-md cursor-pointer transition-all active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                <span>שמור ובחר לרכיב</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setConverterItem(null);
                openAiImageGenerator(converterItem);
              }}
              className="px-3 py-1.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-400 border border-amber-500/40 flex items-center space-x-1.5 rtl:space-x-reverse cursor-pointer transition-all active:scale-95"
              title="עריכה מתקדמת ב-AI, התאמה לצבעי מותג ושינוי סגנון"
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-400" />
              <span>פתח בסטודיו קושאן AI</span>
            </button>

            {(isBgRemoved || isCropApplied || rotation !== 0 || flipH || flipV) && (
              <button
                type="button"
                onClick={handleResetToOriginal}
                className={`text-xs px-2.5 py-1.5 rounded-xl border flex items-center space-x-1 rtl:space-x-reverse transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
                title="שחזר את התמונה המקורית"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">אפס למקור</span>
              </button>
            )}

            <button
              onClick={() => setConverterItem(null)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* 2. Status Banner */}
        {statusMessage && (
          <div
            className={`px-4 py-2 text-xs font-bold flex items-center justify-between border-b flex-shrink-0 animate-fade-in ${
              isLight ? 'bg-amber-100 text-amber-900 border-amber-200' : 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30'
            }`}
          >
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Sparkles className="w-4 h-4" />
              <span>{statusMessage}</span>
            </div>
            <button type="button" onClick={() => setStatusMessage(null)} className="hover:opacity-75">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 3. Contextual Tool Settings Bar (Under Top Tabs) */}
        {converterItem.type === 'image' && (
          <div
            className={`px-5 py-2.5 border-b text-xs flex flex-wrap items-center justify-between gap-3 flex-shrink-0 transition-colors ${
              isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
            }`}
          >
            {/* TAB: REMOVE BACKGROUND CONTROLS */}
            {activeTab === 'remove_bg' && (
              <div className="flex flex-wrap items-center justify-between w-full gap-3">
                <div className="flex flex-wrap items-center space-x-4 rtl:space-x-reverse gap-y-2">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span className="font-bold whitespace-nowrap">רגישות (Tolerance):</span>
                    <input
                      type="range"
                      min="5"
                      max="60"
                      step="1"
                      value={bgTolerance}
                      onChange={(e) => setBgTolerance(parseInt(e.target.value, 10))}
                      className="w-28 sm:w-36 accent-amber-500 cursor-pointer"
                    />
                    <span className="font-mono font-bold text-amber-500 w-8">{bgTolerance}%</span>
                  </div>

                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span className="font-bold whitespace-nowrap">החלקת קצוות (Feather):</span>
                    <input
                      type="range"
                      min="0"
                      max="8"
                      step="1"
                      value={bgFeather}
                      onChange={(e) => setBgFeather(parseInt(e.target.value, 10))}
                      className="w-20 sm:w-28 accent-amber-500 cursor-pointer"
                    />
                    <span className="font-mono font-bold text-amber-500 w-6">{bgFeather}px</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <button
                    type="button"
                    onClick={handleRemoveBackground}
                    disabled={isProcessing}
                    className="px-4 py-1.5 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-white flex items-center space-x-1.5 rtl:space-x-reverse shadow cursor-pointer transition-all active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>הסר רקע עכשיו (Magic BG)</span>
                  </button>

                  {isBgRemoved && (
                    <button
                      type="button"
                      onClick={handleResetToOriginal}
                      className="px-3 py-1.5 rounded-xl font-semibold text-xs border text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-200 dark:border-red-900/50 transition-colors cursor-pointer"
                    >
                      בטל והחזר רקע
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* TAB: CROP CONTROLS */}
            {activeTab === 'crop' && (
              <div className="flex flex-wrap items-center justify-between w-full gap-3">
                <div className="flex flex-wrap items-center space-x-2 rtl:space-x-reverse gap-y-1">
                  <span className="font-bold whitespace-nowrap pl-1">יחס חיתוך:</span>
                  {[
                    { label: 'חופשי', ratio: undefined },
                    { label: '1:1 מרובע', ratio: 1 },
                    { label: '16:9 רחב', ratio: 16 / 9 },
                    { label: '9:16 סטורי', ratio: 9 / 16 },
                    { label: '4:3', ratio: 4 / 3 },
                    { label: '3:2', ratio: 3 / 2 },
                  ].map((ar, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyCropPreset(ar.ratio)}
                      className={`py-1 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        aspectRatio === ar.ratio
                          ? 'bg-amber-500 text-black border-amber-500 shadow-sm'
                          : isLight
                          ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {ar.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <button
                    type="button"
                    onClick={handleApplyCrop}
                    disabled={!completedCrop || completedCrop.width === 0 || isProcessing}
                    className={`px-4 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 rtl:space-x-reverse shadow transition-all cursor-pointer ${
                      !completedCrop || completedCrop.width === 0 || isProcessing
                        ? 'opacity-50 cursor-not-allowed bg-slate-300 text-slate-500 dark:bg-slate-800'
                        : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-black'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>אשר ובצע חיתוך</span>
                  </button>

                  {crop && (
                    <button
                      type="button"
                      onClick={() => {
                        setCrop(undefined);
                        setCompletedCrop(null);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold border text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      בטל בחירה
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* TAB: TRANSFORM (ROTATE & FLIP) */}
            {activeTab === 'transform' && (
              <div className="flex flex-wrap items-center justify-between w-full gap-3">
                <div className="flex flex-wrap items-center space-x-2 rtl:space-x-reverse gap-y-1">
                  <span className="font-bold whitespace-nowrap pl-1">סיבוב והיפוך:</span>
                  <button
                    type="button"
                    onClick={() => setRotation((prev) => (prev + 90) % 360)}
                    className="px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 rtl:space-x-reverse text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border-slate-700 cursor-pointer shadow-sm active:scale-95 transition-all"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-amber-500" />
                    <span>90° ימינה {rotation > 0 ? `(${rotation}°)` : ''}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFlipH(!flipH)}
                    className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 rtl:space-x-reverse text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                      flipH
                        ? 'bg-amber-500 text-black border-amber-500 shadow-sm'
                        : isLight
                        ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                        : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                    }`}
                  >
                    <FlipHorizontal className="w-3.5 h-3.5 text-amber-500" />
                    <span>היפוך אופקי</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFlipV(!flipV)}
                    className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 rtl:space-x-reverse text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                      flipV
                        ? 'bg-amber-500 text-black border-amber-500 shadow-sm'
                        : isLight
                        ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                        : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                    }`}
                  >
                    <FlipVertical className="w-3.5 h-3.5 text-amber-500" />
                    <span>היפוך אנכי</span>
                  </button>
                </div>

                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  {(rotation !== 0 || flipH || flipV) && (
                    <>
                      <button
                        type="button"
                        onClick={handleBakeTransformations}
                        disabled={isProcessing}
                        className="px-4 py-1.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-black shadow cursor-pointer transition-all active:scale-95 flex items-center space-x-1.5 rtl:space-x-reverse"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>קבע סיבוב/היפוך לתמונה</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRotation(0);
                          setFlipH(false);
                          setFlipV(false);
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold border text-slate-400 hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        אפס כיוון
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* TAB: WATERMARK */}
            {activeTab === 'watermark' && (
              <div className="flex flex-wrap items-center justify-between w-full gap-3">
                <div className="flex flex-wrap items-center space-x-4 rtl:space-x-reverse gap-y-2">
                  <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                    <input
                      type="checkbox"
                      checked={watermarkEnabled}
                      onChange={(e) => setWatermarkEnabled(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                    <span className="font-bold text-xs">הפעל חותמת מותג (Watermark)</span>
                  </label>

                  {watermarkEnabled && (
                    <>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <span className="text-xs text-slate-400">מיקום:</span>
                        <select
                          value={watermarkPosition}
                          onChange={(e) => setWatermarkPosition(e.target.value as any)}
                          className={`p-1.5 rounded-xl text-xs font-bold border ${
                            isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-white'
                          }`}
                        >
                          <option value="bottom-right">ימין למטה</option>
                          <option value="bottom-left">שמאל למטה</option>
                          <option value="top-right">ימין למעלה</option>
                          <option value="top-left">שמאל למעלה</option>
                          <option value="center">מרכז</option>
                        </select>
                      </div>

                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <span className="text-xs text-slate-400">שקיפות:</span>
                        <input
                          type="range"
                          min="0.1"
                          max="1.0"
                          step="0.05"
                          value={watermarkOpacity}
                          onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                          className="w-24 accent-amber-500 cursor-pointer"
                        />
                        <span className="font-mono text-xs font-bold text-amber-500">
                          {Math.round(watermarkOpacity * 100)}%
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {brandLogo ? (
                  <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs text-slate-400">
                    <span>לוגו מותג פעיל:</span>
                    <img src={brandLogo} alt="Logo" className="w-6 h-6 object-contain rounded bg-white/10 p-0.5" />
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder="כתובת URL של לוגו/חותמת..."
                    value={customWatermarkUrl}
                    onChange={(e) => setCustomWatermarkUrl(e.target.value)}
                    className="text-xs px-2.5 py-1 rounded-lg border bg-slate-950 border-slate-700 text-white w-48"
                    dir="ltr"
                  />
                )}
              </div>
            )}

            {/* TAB: COMPRESSION & FORMAT */}
            {activeTab === 'compress' && (
              <div className="flex flex-wrap items-center justify-between w-full gap-3">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <span className="font-bold whitespace-nowrap">פורמט:</span>
                  <div className="flex p-0.5 rounded-xl border border-slate-300 dark:border-slate-800">
                    {[
                      { label: 'PNG (שקיפות)', val: 'image/png' },
                      { label: 'WEBP (מומלץ)', val: 'image/webp' },
                      { label: 'JPG', val: 'image/jpeg' },
                    ].map((f) => (
                      <button
                        key={f.val}
                        type="button"
                        onClick={() => setTargetFormat(f.val as any)}
                        className={`py-1 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          targetFormat === f.val
                            ? 'bg-amber-500 text-black shadow-sm'
                            : 'text-inherit hover:opacity-75'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {targetFormat !== 'image/png' && (
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span className="font-bold whitespace-nowrap">איכות:</span>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={quality}
                      onChange={(e) => setQuality(parseFloat(e.target.value))}
                      className="w-28 sm:w-36 accent-amber-500 cursor-pointer"
                    />
                    <span className="font-mono font-bold text-amber-500">{Math.round(quality * 100)}%</span>
                  </div>
                )}

                {convertedResult && (
                  <div className="flex items-center space-x-2 rtl:space-x-reverse text-[11px] font-mono">
                    <span className="text-slate-400">נפח:</span>
                    <span className="font-bold text-emerald-500">
                      {FileCompressionService.formatBytes(convertedResult.sizeBytes)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* TAB: RESIZE */}
            {activeTab === 'resize' && (
              <div className="flex flex-wrap items-center space-x-4 rtl:space-x-reverse gap-y-2 w-full">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <span className="font-bold whitespace-nowrap">רוחב מקסימלי (px):</span>
                  <input
                    type="number"
                    placeholder="אוטומטי"
                    value={maxWidth}
                    onChange={(e) => setMaxWidth(e.target.value)}
                    className={`w-24 px-2.5 py-1 rounded-lg text-xs border focus:outline-none ${
                      isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>

                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <span className="font-bold whitespace-nowrap">גובה מקסימלי (px):</span>
                  <input
                    type="number"
                    placeholder="אוטומטי"
                    value={maxHeight}
                    onChange={(e) => setMaxHeight(e.target.value)}
                    className={`w-24 px-2.5 py-1 rounded-lg text-xs border focus:outline-none ${
                      isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>

                {(maxWidth || maxHeight) && (
                  <button
                    type="button"
                    onClick={() => {
                      setMaxWidth('');
                      setMaxHeight('');
                    }}
                    className="text-xs text-amber-500 hover:underline"
                  >
                    אפס מידות
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 4. MAIN CENTER CANVAS (Center Stage Large Display) */}
        <main
          className={`flex-1 relative overflow-hidden flex items-center justify-center p-4 sm:p-8 select-none ${
            isBgRemoved
              ? 'bg-[radial-gradient(#64748b_1.5px,transparent_1.5px)] [background-size:20px_20px] bg-slate-950'
              : isLight
              ? 'bg-slate-100/80'
              : 'bg-black/90'
          }`}
        >
          {/* Zoom controls floating in top-left */}
          <div className="absolute top-4 left-4 z-20 flex items-center space-x-1 rtl:space-x-reverse p-1 rounded-xl bg-black/60 backdrop-blur-md border border-slate-700/80 text-white text-xs">
            <button
              type="button"
              onClick={() => setZoomScale((prev) => Math.min(prev + 0.25, 3))}
              className="p-1 hover:text-amber-400 cursor-pointer"
              title="הגדל תצוגה"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="font-mono text-[10px] px-1 font-bold">{Math.round(zoomScale * 100)}%</span>
            <button
              type="button"
              onClick={() => setZoomScale((prev) => Math.max(prev - 0.25, 0.5))}
              className="p-1 hover:text-amber-400 cursor-pointer"
              title="הקטן תצוגה"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            {zoomScale !== 1 && (
              <button
                type="button"
                onClick={() => setZoomScale(1)}
                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 ml-1"
              >
                100%
              </button>
            )}
          </div>

          {/* Processing Loading Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center z-30 space-y-2">
              <RefreshCw className="w-9 h-9 text-amber-500 animate-spin" />
              <span className="text-xs font-bold text-white tracking-wide">
                {statusMessage || 'מעבד תמונה באיכות מקסימלית...'}
              </span>
            </div>
          )}

          {/* Center Canvas Display */}
          <div
            className="w-full h-full flex items-center justify-center transition-transform duration-200"
            style={{ transform: `scale(${zoomScale})` }}
          >
            {activeTab === 'crop' ? (
              /* CROP MODE WITH INTERACTIVE CROP BOX */
              <div className="relative inline-flex items-center justify-center max-w-full max-h-full">
                <img
                  ref={imgRef}
                  src={workingImageUrl}
                  alt={converterItem.name}
                  className="max-h-[58vh] max-w-full object-contain rounded-2xl block select-none border border-slate-700/60 shadow-2xl"
                  onLoad={() => {
                    applyCropPreset(aspectRatio);
                  }}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.crossOrigin) {
                      target.removeAttribute('crossorigin');
                      target.src = workingImageUrl;
                    }
                  }}
                />
                {completedCrop && (
                  <div
                    className="absolute border-2 border-dashed border-amber-400 bg-amber-400/20 pointer-events-none rounded transition-all duration-150 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]"
                    style={{
                      left: completedCrop.unit === '%' ? `${completedCrop.x}%` : `${completedCrop.x}px`,
                      top: completedCrop.unit === '%' ? `${completedCrop.y}%` : `${completedCrop.y}px`,
                      width: completedCrop.unit === '%' ? `${completedCrop.width}%` : `${completedCrop.width}px`,
                      height: completedCrop.unit === '%' ? `${completedCrop.height}%` : `${completedCrop.height}px`,
                    }}
                  >
                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/85 text-[11px] text-amber-300 font-mono font-bold rounded-md shadow-md border border-amber-400/30">
                      ✂️ חיתוך: {Math.round(completedCrop.width || 0)}×{Math.round(completedCrop.height || 0)}px
                    </div>
                  </div>
                )}
              </div>
            ) : converterItem.type === 'image' ? (
              /* NORMAL / PROCESSED PREVIEW WITH LIVE TRANSFORM & WATERMARK */
              <div
                className="relative inline-flex items-center justify-center max-w-full max-h-full transition-transform duration-200"
                style={{
                  transform: activeTab === 'transform' ? `rotate(${rotation}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})` : undefined,
                }}
              >
                <img
                  src={convertedResult ? convertedResult.objectUrl : workingImageUrl}
                  alt={converterItem.name}
                  className={`max-h-[58vh] max-w-full object-contain rounded-2xl shadow-2xl transition-all duration-300 select-none ${
                    isBgRemoved
                      ? 'border-2 border-dashed border-emerald-500/70 p-1.5 drop-shadow-[0_15px_30px_rgba(0,0,0,0.7)]'
                      : isLight
                      ? 'border border-slate-300'
                      : 'border border-slate-800'
                  }`}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (convertedResult && target.src === convertedResult.objectUrl) {
                      target.src = workingImageUrl;
                    }
                  }}
                />

                {/* Watermark live overlay */}
                {watermarkEnabled && (brandLogo || customWatermarkUrl) && (
                  <div
                    className={`absolute pointer-events-none p-2 ${
                      watermarkPosition === 'bottom-left'
                        ? 'bottom-2 left-2'
                        : watermarkPosition === 'top-left'
                        ? 'top-2 left-2'
                        : watermarkPosition === 'top-right'
                        ? 'top-2 right-2'
                        : watermarkPosition === 'center'
                        ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                        : 'bottom-2 right-2'
                    }`}
                    style={{ opacity: watermarkOpacity }}
                  >
                    <img
                      src={customWatermarkUrl || brandLogo}
                      alt="Watermark"
                      className="w-16 sm:w-20 max-w-[25vw] h-auto drop-shadow-md select-none"
                    />
                  </div>
                )}
              </div>
            ) : (
              /* NON-IMAGE FILE CONTENT PREVIEW */
              <div className="w-full max-w-3xl max-h-[58vh] p-6 bg-slate-950 rounded-3xl border border-slate-800 overflow-auto font-mono text-xs text-emerald-400" dir="ltr">
                <pre className="whitespace-pre-wrap">{dataResultText || 'מעבד קובץ נתונים...'}</pre>
              </div>
            )}
          </div>
        </main>

        {/* 5. FOOTER: Save Mode Selection, Overwrite vs New, and Final Action Buttons */}
        <footer
          className={`p-4 border-t flex flex-wrap items-center justify-between gap-3 flex-shrink-0 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}
        >
          {/* Left / Center: Save Mode Selector */}
          <div className="flex flex-wrap items-center space-x-3 rtl:space-x-reverse gap-y-2">
            <span className="text-xs font-bold whitespace-nowrap">אופן שמירה:</span>

            {/* Option A: Save as New File */}
            <label
              className={`p-1.5 px-3 rounded-xl border flex items-center space-x-2 rtl:space-x-reverse cursor-pointer transition-all ${
                saveMode === 'new'
                  ? isLight
                    ? 'bg-amber-100 border-amber-400 text-slate-900 font-bold shadow-xs'
                    : 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200 font-bold shadow'
                  : isLight
                  ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <input
                type="radio"
                name="saveModeSelector"
                checked={saveMode === 'new'}
                onChange={() => setSaveMode('new')}
                className="accent-amber-500"
              />
              <span className="text-xs">שמור כקובץ חדש (עותק)</span>
            </label>

            {/* Option B: Overwrite / Replace Original */}
            <label
              className={`p-1.5 px-3 rounded-xl border flex items-center space-x-2 rtl:space-x-reverse cursor-pointer transition-all ${
                saveMode === 'replace'
                  ? 'bg-red-500/20 border-red-500 text-red-600 dark:text-red-300 font-bold shadow'
                  : isLight
                  ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <input
                type="radio"
                name="saveModeSelector"
                checked={saveMode === 'replace'}
                onChange={() => setSaveMode('replace')}
                className="accent-red-500"
              />
              <span className="text-xs">החלף קובץ מקורי (שמור באותו שם)</span>
            </label>

            {/* Editable Filename input if Save as New */}
            {saveMode === 'new' && (
              <input
                type="text"
                value={targetFileName}
                onChange={(e) => setTargetFileName(e.target.value)}
                placeholder="שם קובץ חדש..."
                className={`px-3 py-1 rounded-xl text-xs font-bold border focus:outline-none min-w-[180px] ${
                  isLight
                    ? 'bg-white border-amber-300 text-slate-900 focus:border-amber-500'
                    : 'bg-slate-900 border-yellow-500/40 text-white focus:border-yellow-500'
                }`}
                dir="auto"
              />
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <button
              onClick={handleDownload}
              disabled={isProcessing}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-1.5 rtl:space-x-reverse border transition-all cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-amber-500" />
              <span>הורד למחשב</span>
            </button>

            {selectionMode ? (
              <button
                onClick={handleSaveAndSelect}
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-xl text-xs font-black flex items-center space-x-2 rtl:space-x-reverse bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 hover:from-amber-400 text-black shadow-lg shadow-amber-500/25 transition-all active:scale-95 cursor-pointer"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>התמונה נבחרה בהצלחה!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>שמור ובחר לרכיב</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleSaveToGallery}
                disabled={isProcessing}
                className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center space-x-2 rtl:space-x-reverse shadow-lg transition-all active:scale-95 cursor-pointer ${
                  saveSuccess
                    ? 'bg-emerald-500 text-white'
                    : saveMode === 'replace'
                    ? 'bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-400 text-white shadow-red-500/20'
                    : 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 hover:from-amber-400 text-black shadow-amber-500/25'
                }`}
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{saveMode === 'replace' ? 'הקובץ הוחלף בהצלחה!' : 'נשמר בהצלחה בגלריה!'}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{saveMode === 'replace' ? 'החלף קובץ מקורי' : 'שמור עותק בגלריה'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};