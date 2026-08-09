export type SupportedLanguage = 'en-US' | 'es-ES' | 'fr-FR' | 'ja-JP' | string;

class CatalogI18nResolver {
  private currentLanguage: SupportedLanguage = 'en-US';

  getLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  setLanguage(langCode: SupportedLanguage): SupportedLanguage {
    if (!langCode || typeof langCode !== 'string') return this.currentLanguage;
    this.currentLanguage = langCode;
    return this.currentLanguage;
  }

  formatLanguageQuery(langCode?: SupportedLanguage): string {
    const lang = langCode || this.currentLanguage;
    return `language=${encodeURIComponent(lang)}`;
  }
}

export const catalogI18nResolver = new CatalogI18nResolver();
