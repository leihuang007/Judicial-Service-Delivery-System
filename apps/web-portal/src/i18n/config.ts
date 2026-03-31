export const locales = ["zh-CN", "en-US"] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "zh-CN";

export function isValidLocale(value: string): value is AppLocale {
  return locales.includes(value as AppLocale);
}
