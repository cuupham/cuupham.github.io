import { describe, it, expect } from 'vitest';
import { routeRegistry, counterpart } from '../../src/lib/routes';
import { locales, validateLocales, languageLabel, contentLanguage } from '../../src/lib/locales';

describe('locale route contract', () => {
  it.each([0, 1, 3, 4, 12, 13, 24, 25])('emits independent expected paths for %i posts', (count) => {
    const ids = Array.from({ length: count }, (_, i) => `entry-${i + 1}`);
    const expected: string[] = [];
    for (const locale of ['vi', 'en']) {
      expected.push(`/${locale}/`);
      if (count) expected.push(`/${locale}/content/`);
      if (count > 12) expected.push(`/${locale}/content/page/2/`);
      if (count > 24) expected.push(`/${locale}/content/page/3/`);
      for (const id of ids) expected.push(`/${locale}/content/${id}/`);
    }
    const actual = routeRegistry(ids);
    expect(actual.map((route) => route.path).sort()).toEqual(expected.sort());
    const articleIds = (locale: string) => actual.filter((route) => route.locale === locale && route.context.kind === 'detail').map((route) => route.context.kind === 'detail' ? route.context.id : '');
    expect(articleIds('vi')).toEqual(ids);
    expect(articleIds('en')).toEqual(ids);
  });
  it('adds third-locale home/list/detail/pagination through the registry', () => {
    const extra = { ...locales[1], segment: 'fr', language: 'fr', label: 'Français', default: false };
    const routes = routeRegistry(Array.from({ length: 13 }, (_, i) => `entry-${i + 1}`), [...locales, extra]);
    expect(routes.filter((route) => route.locale === 'fr').map((route) => route.path)).toEqual([
      '/fr/', '/fr/content/', '/fr/content/page/2/',
      ...Array.from({ length: 13 }, (_, i) => `/fr/content/entry-${i + 1}/`),
    ]);
    expect(counterpart(routes, 'en', { kind: 'list', page: 2 })).toBe('/en/content/page/2/');
    expect(counterpart(routes, 'en', { kind: 'detail', id: 'entry-13' })).toBe('/en/content/entry-13/');
    expect(() => counterpart(routes, 'en', { kind: 'list', page: 3 })).toThrow('does not exist');
  });
  it('rejects dictionary/default/segment errors and collisions', () => {
    expect(() => validateLocales([])).toThrow('default');
    expect(() => validateLocales([...locales, locales[0]])).toThrow('default');
    expect(() => validateLocales([locales[0], { ...locales[1], segment: 'vi' }])).toThrow('segment');
    expect(() => validateLocales([locales[0], { ...locales[1], segment: 'content' }])).toThrow('segment');
    expect(() => validateLocales([locales[0], { ...locales[1], messages: {} as typeof locales[1]['messages'] }])).toThrow('dictionary');
    expect(() => routeRegistry(['same', 'same'])).toThrow('Duplicate');
    expect(() => routeRegistry(['page'])).toThrow('reserved');
  });
  it('displays languages outside the UI registry without filtering content', () => {
    expect(languageLabel('ja', 'en')).toBe('Japanese');
    expect(languageLabel('ja', 'vi')).toBeTruthy();
    expect(contentLanguage('x-cpm')).toBe('x-cpm');
    expect(contentLanguage('i-klingon')).toBe('tlh');
    expect(languageLabel('x-cpm', 'en')).toBe('x-cpm');
    expect(() => contentLanguage('en-abcdefghi')).toThrow('BCP-47');
    expect(() => contentLanguage('sl-rozaj-rozaj')).toThrow('BCP-47');
    expect(() => contentLanguage('en-a-foo-a-bar')).toThrow('BCP-47');
  });
});
