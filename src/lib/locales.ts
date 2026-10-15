import vi from '../i18n/vi';
import en from '../i18n/en';
import { parse, stringify } from 'bcp-47';

export type Dictionary = Record<keyof typeof vi, string>;
export interface UiLocale {
  segment: string;
  language: string;
  label: string;
  default?: boolean;
  messages: Dictionary;
}

export function contentLanguage(value: string): string {
  const schema = parse(value, { forgiving: false, normalize: true });
  const normalized = stringify(schema);
  const variants = schema.variants.map((variant) => variant.toLowerCase());
  const singletons = schema.extensions.map((extension) => extension.singleton.toLowerCase());
  if (!normalized || new Set(variants).size !== variants.length || new Set(singletons).size !== singletons.length) {
    throw new Error(`Invalid BCP-47 language: ${value}`);
  }
  try { return Intl.getCanonicalLocales(normalized)[0]!; }
  catch { return normalized; }
}

export function validateLocales(registry: readonly UiLocale[]) {
  if (registry.filter((entry) => entry.default).length !== 1) {
    throw new Error('UI registry requires exactly one default locale');
  }
  const seen = new Set<string>();
  const keys = Object.keys(vi).sort().join(',');
  for (const entry of registry) {
    if (!/^[a-z]+(?:-[a-z0-9]+)*$/.test(entry.segment) ||
      ['content', '404', 'page', '_astro', 'assets', 'public'].includes(entry.segment) || seen.has(entry.segment)) {
      throw new Error(`Invalid or duplicate locale segment: ${entry.segment}`);
    }
    contentLanguage(entry.language);
    if (Object.keys(entry.messages).sort().join(',') !== keys ||
      Object.values(entry.messages).some((value) => typeof value !== 'string' || !value.trim())) {
      throw new Error(`Incomplete dictionary: ${entry.segment}`);
    }
    seen.add(entry.segment);
  }
  return registry;
}

export const locales = validateLocales([
  { segment: 'vi', language: 'vi', label: 'Tiếng Việt', default: true, messages: vi },
  { segment: 'en', language: 'en', label: 'English', messages: en },
] as const);
export const defaultLocale = locales.find((entry) => entry.default)!;

export function languageLabel(language: string, ui: string): string {
  const code = contentLanguage(language);
  try { return new Intl.DisplayNames([ui], { type: 'language' }).of(code) || code; }
  catch { return code; }
}
