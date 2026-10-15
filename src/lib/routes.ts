import { locales, validateLocales, type UiLocale } from './locales';
import { PAGE_SIZE, validateId } from './content-contract';

export type Context = { kind: 'home' } | { kind: 'list'; page: number } | { kind: 'detail'; id: string };
export interface Route { path: string; locale: string; context: Context }

export function routePath(locale: string, context: Context): string {
  const base = `/${locale}/`;
  if (context.kind === 'home') return base;
  if (context.kind === 'detail') return `${base}content/${validateId(context.id)}/`;
  if (!Number.isInteger(context.page) || context.page < 1) throw new Error('Invalid page number');
  return `${base}content/${context.page === 1 ? '' : `page/${context.page}/`}`;
}

export function routeRegistry(ids: readonly string[], registry: readonly UiLocale[] = locales): Route[] {
  validateLocales(registry);
  const seen = new Set<string>();
  for (const id of ids) {
    validateId(id);
    if (seen.has(id)) throw new Error(`Duplicate ID: ${id}`);
    seen.add(id);
  }
  const routes: Route[] = [];
  for (const locale of registry) {
    const contexts: Context[] = [{ kind: 'home' }];
    for (let page = 1; page <= Math.ceil(ids.length / PAGE_SIZE); page++) contexts.push({ kind: 'list', page });
    for (const id of ids) contexts.push({ kind: 'detail', id });
    for (const context of contexts) routes.push({ path: routePath(locale.segment, context), locale: locale.segment, context });
  }
  if (new Set(routes.map((route) => route.path)).size !== routes.length) throw new Error('Route collision');
  return routes;
}

export function counterpart(routes: readonly Route[], locale: string, context: Context): string {
  const path = routePath(locale, context);
  if (!routes.some((route) => route.path === path)) throw new Error(`Counterpart does not exist: ${path}`);
  return path;
}
