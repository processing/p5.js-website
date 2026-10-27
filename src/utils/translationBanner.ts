import fs from 'fs';
import path from 'path';

interface BannerCheckResult {
  showBanner: boolean;
  englishUrl: string;
}

export function checkTranslationBanner(
  contentType: string,
  itemId: string,
  currentLocale: string,
  currentPathname: string,
  origin: string
): BannerCheckResult {
  let showBanner = false;
  let englishUrl = currentPathname;

  if (currentLocale === 'en') {
    return { showBanner: false, englishUrl };
  }

  englishUrl = currentPathname.replace(`/${currentLocale}/`, '/');
  
  if (!englishUrl.startsWith('http')) {
    englishUrl = `${origin}${englishUrl}`;
  }

  try {
    const manifestPath = path.join(process.cwd(), 'public', 'translation-status', `${contentType}.json`);
    if (fs.existsSync(manifestPath)) {
      const raw = fs.readFileSync(manifestPath, 'utf8');
      const manifest = JSON.parse(raw);
      
      const idNoLocale = itemId.replace(/^[\w-]+\//, '');
      const withoutExt = idNoLocale.replace(/\.(mdx?|ya?ml)$/, '');
      const keyWithDescription = withoutExt;
      const keyWithoutDescription = withoutExt.replace(/\/description$/, '');
      
      const entry = manifest[contentType]?.[keyWithoutDescription] || manifest[contentType]?.[keyWithDescription];
      
      if (entry) {
        const isOutdated = Array.isArray(entry.outdated) && entry.outdated.includes(currentLocale);
        const isMissing = Array.isArray(entry.missing) && entry.missing.includes(currentLocale);
        showBanner = isOutdated || isMissing;
        
        if (isMissing) {
          const missingEnglishUrl = currentPathname.replace(`/${currentLocale}/`, '/');
          englishUrl = `${origin}${missingEnglishUrl}`;
        }
      }
    }
  } catch (e) {
    console.error('Error checking translation banner:', e);
  }

  return { showBanner, englishUrl };
}

