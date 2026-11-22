import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path'

interface BannerCheckResult {
    showBanner: boolean;
    englishUrl: string;
}

const manifestCache = new Map<string, any>();

export async function checkTranslationBanner(
    contentType: string,
    itemId: string,
    currentLocale: string,
    currentPathname: string,
    origin: string
): Promise<BannerCheckResult> {

    if (currentLocale === 'en') {
        return { showBanner: false, englishUrl: currentPathname };
    }

    const englishPath = currentPathname.replace(`${currentLocale}/`, '/');
    const englishUrl = `${origin}${englishPath}`;

    try {
        const manifestPath = path.join(
            process.cwd(), `public`, `translation-status`, `${contentType}.json`
        );

        let manifest = manifestCache.get(manifestPath);

        if (!manifest) {
            if (!existsSync(manifestPath)) {
                return { showBanner: false, englishUrl };
            }

            const fileContent = await fs.readFile(manifestPath, 'utf8');
            manifest = JSON.parse(fileContent);
            manifestCache.set(manifestPath, manifest);
        }

        const idNoLocale = itemId.replace(/^[\w-]+\//, '');
        const key = idNoLocale.replace(/\.(mdx?|ya?ml)$/, '');

        const entry = manifest[contentType]?.[key];

        if (entry) {
            const isOutdated = Array.isArray(entry.outdated) && entry.outdated.includes(currentLocale);
            const isMissing = Array.isArray(entry.missing) && entry.missing.includes(currentLocale);
            return { showBanner: isOutdated || isMissing, englishUrl };
        }
    } catch (error) {
        console.error('Error checking translation banner:', error);
    }

    return { showBanner: false, englishUrl };
}