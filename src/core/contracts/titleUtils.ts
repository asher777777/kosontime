/**
 * Pure Hebrew Title & Slug Extraction Utilities
 */
export function extractCompellingTitle(text: string, index: number = 1, brandName: string = ''): string {
  if (!text || text.trim().length === 0) {
    return brandName ? `עיקרון מוביל מבית ${brandName}` : `תובנת מפתח מעשית ${index}`;
  }

  const clean = text.trim();

  if (clean.includes(':')) {
    const parts = clean.split(':');
    const firstPart = parts[0].trim();
    if (firstPart.length >= 3 && firstPart.length <= 40 && !firstPart.startsWith('תובנה מרכזית') && !firstPart.startsWith('תובנה ')) {
      return firstPart;
    }
  }

  if (clean.includes(' - ')) {
    const parts = clean.split(' - ');
    const firstPart = parts[0].trim();
    if (firstPart.length >= 3 && firstPart.length <= 40 && !firstPart.startsWith('תובנה מרכזית') && !firstPart.startsWith('תובנה ')) {
      return firstPart;
    }
  }

  return clean.slice(0, 45);
}
