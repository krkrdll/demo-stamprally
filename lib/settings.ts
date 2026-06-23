import { cache } from 'react';
import prisma from './prisma';
import { THEMES, DEFAULT_THEME, isThemeKey, type ThemeKey } from './themes';

export type SiteSettings = {
  siteTitle: string;
  theme: ThemeKey;
};

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const row = await prisma.siteSettings.findUnique({ where: { id: 'default' } });
    const theme = row?.theme && isThemeKey(row.theme) ? row.theme : DEFAULT_THEME;
    return {
      siteTitle: row?.siteTitle ?? 'スタンプラリー',
      theme,
    };
  } catch {
    return { siteTitle: 'スタンプラリー', theme: DEFAULT_THEME };
  }
});

export function getThemeVars(theme: ThemeKey): Record<string, string> {
  const t = THEMES[theme];
  return {
    '--color-brand':        t.main,
    '--color-brand-dark':   t.dark,
    '--color-brand-mid':    t.mid,
    '--color-brand-border': t.border,
    '--color-brand-muted':  t.muted,
    '--color-brand-light':  t.light,
  };
}
