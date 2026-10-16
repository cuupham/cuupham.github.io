import path from 'node:path';
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import images from '../../.astro/image-manifest.mjs';
import media from '../../.astro/media-manifest.mjs';
import { resolveSource } from './asset-graph';
import { safeUrl } from './content-contract';
import type { Post } from './site-content';

declare const __CPM_ROOT__: string;

async function assetKey(post: Post, ref: string) {
  if (!post.filePath) throw new Error(`Missing source file: ${post.id}`);
  const file = await resolveSource(__CPM_ROOT__, path.resolve(__CPM_ROOT__, post.filePath), ref);
  return path.relative(__CPM_ROOT__, file).split(path.sep).join('/');
}
export async function imageFor(post: Post, ref: string): Promise<ImageMetadata> {
  const key = await assetKey(post, ref);
  const image = images[key];
  if (!image) throw new Error(`Image absent from reachable manifest: ${key}`);
  return image;
}
export async function mediaFor(post: Post, ref: string): Promise<string> {
  const key = await assetKey(post, ref);
  const url = media[key] ?? images[key]?.src;
  if (!url) throw new Error(`Asset absent from reachable manifest: ${key}`);
  return url;
}
export async function linkFor(post: Post, ref: string) {
  if (ref.startsWith('#')) { safeUrl(`/vi/content/${post.id}/${ref}`); return ref; }
  if (ref.startsWith('/') || /^[a-z][a-z0-9+.-]*:/i.test(ref)) return safeUrl(ref);
  return mediaFor(post, ref);
}
export async function optimizedImage(post: Post, ref: string) {
  return getImage({ src: await imageFor(post, ref), width: 960, widths: [320, 640, 960], format: 'webp', quality: 80 });
}
