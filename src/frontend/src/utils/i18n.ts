export const translations: Record<string, Record<string, string>> = {
  en: {
    settings: "My LSH Settings",
    save: "Save Settings",
    theme: "Theme",
    language: "Language",
    dark: "Dark",
    light: "Light",
    system: "System",
    favoriteTeam: "Favourite Team",
    favoritePlayer: "Favourite Player",
    shareApp: "Share App",
    installApp: "Install App",
    contentInterests: "Content Interests",
    appearance: "Appearance & Interests",
    languageRegional: "Language & Regional Settings",
    shareDownload: "Share & Download",
  },
  sw: {
    settings: "Mipangilio Yangu LSH",
    save: "Hifadhi Mipangilio",
    theme: "Mandhari",
    language: "Lugha",
    dark: "Giza",
    light: "Mwanga",
    system: "Mfumo",
    favoriteTeam: "Timu Ninayoipenda",
    favoritePlayer: "Mchezaji Ninaompendelea",
    shareApp: "Shiriki Programu",
    installApp: "Sakinisha Programu",
    contentInterests: "Maslahi ya Maudhui",
    appearance: "Muonekano & Maslahi",
    languageRegional: "Mipangilio ya Lugha & Eneo",
    shareDownload: "Shiriki & Pakua",
  },
};

export function t(lang: string, key: string): string {
  return translations[lang]?.[key] ?? translations.en[key] ?? key;
}
