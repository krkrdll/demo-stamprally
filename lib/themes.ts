export type ThemeKey = 'amber' | 'blue' | 'green' | 'red' | 'purple' | 'pink' | 'teal';

export type ThemeColors = {
  main: string;
  dark: string;
  mid: string;
  border: string;
  muted: string;
  light: string;
  label: string;
  emoji: string;
};

export const THEMES: Record<ThemeKey, ThemeColors> = {
  amber:  { main: '#d97706', dark: '#b45309', mid: '#f59e0b', border: '#fbbf24', muted: '#fef3c7', light: '#fffbeb', label: 'アンバー', emoji: '🟠' },
  blue:   { main: '#2563eb', dark: '#1d4ed8', mid: '#3b82f6', border: '#60a5fa', muted: '#dbeafe', light: '#eff6ff', label: 'ブルー',   emoji: '🔵' },
  green:  { main: '#16a34a', dark: '#15803d', mid: '#22c55e', border: '#4ade80', muted: '#dcfce7', light: '#f0fdf4', label: 'グリーン', emoji: '🟢' },
  red:    { main: '#dc2626', dark: '#b91c1c', mid: '#ef4444', border: '#f87171', muted: '#fee2e2', light: '#fef2f2', label: 'レッド',   emoji: '🔴' },
  purple: { main: '#9333ea', dark: '#7e22ce', mid: '#a855f7', border: '#c084fc', muted: '#f3e8ff', light: '#faf5ff', label: 'パープル', emoji: '🟣' },
  pink:   { main: '#db2777', dark: '#be185d', mid: '#ec4899', border: '#f472b6', muted: '#fce7f3', light: '#fdf2f8', label: 'ピンク',   emoji: '🩷' },
  teal:   { main: '#0d9488', dark: '#0f766e', mid: '#14b8a6', border: '#2dd4bf', muted: '#ccfbf1', light: '#f0fdfa', label: 'ティール', emoji: '🩵' },
};

export const DEFAULT_THEME: ThemeKey = 'amber';

export function isThemeKey(value: string): value is ThemeKey {
  return value in THEMES;
}
