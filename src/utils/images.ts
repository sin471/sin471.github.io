import type { ImageMetadata } from 'astro';

const images = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/images/*.{png,jpg,jpeg,webp,avif,gif,svg}',
  { eager: true },
);

/**
 * コンテンツ側の `/images/foo.png` 形式のパスを src/assets/images 配下の ImageMetadata に解決する。
 * 外部 URL はそのまま返す。
 */
export function resolveImage(src: string): ImageMetadata | string {
  if (/^(?:[a-z+]+:)?\/\//i.test(src)) return src;
  const name = src.replace(/^\/?images\//, '');
  const mod = images[`/src/assets/images/${name}`];
  if (!mod) throw new Error(`Image not found in src/assets/images: ${src}`);
  return mod.default;
}
