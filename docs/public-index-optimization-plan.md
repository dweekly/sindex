# public/index.html Optimization Plan

This document outlines concrete steps to make `public/index.html` smaller and faster to load, ordered for impact and ease. Use it as a checklist during implementation.

## Goals
- Reduce initial HTML/CSS/JS transfer and third‑party blocking.
- Improve LCP/INP/CLS with better font and image delivery.
- Minimize external requests; maximize cacheability and compression.

## Quick Wins
- [ ] Remove Font Awesome; replace icons with inline SVGs to drop the external CSS request and ~30–70 KB.
- [ ] Trim favicons: keep `favicon.ico`, `favicon-32x32.png`, `apple-touch-icon.png (180x180)`, and the manifest icons; delete rarely used sizes to save ~300 KB and requests.
- [ ] Remove unused `dns-prefetch` entries (e.g., `cdn.tailwindcss.com`) and any hosts not actually used at runtime.
- [ ] Consolidate Google Fonts tags: avoid both `preload as=style` and an additional `rel=stylesheet` for the same URL; keep one optimized pattern.
- [ ] Drop `meta name="keywords"` (no SEO value; saves bytes).

## Fonts
- [ ] Self-host fonts as WOFF2 with subsetting: Bebas Neue (headings only) and Inter (weights actually used: 400/600/700; Latin subset).
- [ ] Consider system font stack for body text; keep Bebas Neue only for headings to remove a remote dependency.
- [ ] Keep a single `preconnect` to `https://fonts.gstatic.com` with `crossorigin`, and ensure `display=swap` is used (it is currently).

## Images
- [ ] Hero (LCP) image: add `fetchpriority="high"`, explicit `width`/`height`, and responsive `srcset`/`sizes` so mobile avoids desktop-sized downloads.
- [ ] Add `AVIF` source before `WebP`, with JPEG fallback: `<source type="image/avif">`, then `webp`, then `img`.
- [ ] Add `loading="lazy"` to all below-the-fold images (gallery, band members, etc.).
- [ ] Ensure gallery/member images use optimized thumbnails (WebP/AVIF), not full-size assets.
- [ ] Recompress social images: `og-image.jpg` and `twitter-card.jpg` to ~80–120 KB while keeping acceptable quality.

## Third-Party
- [ ] Defer or delay Google Tag Manager: load on first interaction or after `DOMContentLoaded` if acceptable; otherwise keep async but consider lighter analytics.
- [ ] Replace full YouTube iframes with a “lite YouTube embed” or click-to-load thumbnail; only instantiate iframe on interaction.
- [ ] Remove YouTube/ytimg prefetches if not embedding on initial load.

## HTML, CSS, and JS
- [ ] Critical CSS: inline only what’s required for above-the-fold (nav/hero); load `styles.css` normally. Avoid inlining general utilities.
- [ ] Ensure Tailwind purge (content scanning) is aggressive so `public/styles.css` contains only used utilities; re-minify.
- [ ] Minify inline `<style>` and any inline scripts.
- [ ] Add `rel="preload" as="image"` for the hero image to speed first paint.

## Structured Data (JSON-LD)
- [ ] Slim MusicGroup member entries to essentials (name, image, role, startDate) and remove long bios to reduce HTML weight.
- [ ] Keep a single `ItemList` for events (current/future only) and one for videos.
- [ ] Minify JSON-LD blocks to one-line JSON to reduce whitespace overhead.

## Caching and Delivery
- [ ] Enable Brotli/gzip for HTML/CSS/JS (Brotli preferred for HTTPS).
- [ ] Add far-future `Cache-Control` with content hashing for `styles.css`, fonts, images, and icons.
- [ ] Serve large static assets (images/music) via CDN with HTTP/2+ and TLS 1.3. You already use `cdn.sinister-dexter.com` for some media—expand that coverage.

## Optional UX/Behavioral Improvements
- [ ] Lazy-render heavy, non-critical sections (gallery, large music lists) on scroll or interaction.
- [ ] Paginate or virtualize long lists (e.g., music library) to cap initial DOM and network work.

## Suggested Implementation Order
1) Remove Font Awesome; swap to inline SVGs.
2) Fonts: self-host + subset; system stack for body.
3) Hero image: add `fetchpriority`, responsive `srcset/sizes`, AVIF/WebP.
4) Lazy-load and thumbnail all non-critical images.
5) Defer GTM and implement lite YouTube embeds.
6) Purge/minify CSS and trim meta/prefetch.
7) Slim/minify JSON-LD and limit to current content.
8) Tighten caching, compression, and CDN paths.

## Metrics to Track
- [ ] LCP and CLS (field + lab) on mobile and desktop.
- [ ] Total Blocking Time/INP and main-thread long tasks.
- [ ] Bytes transferred for HTML, CSS, JS, and images; request count.
- [ ] First Contentful Paint and Time to First Byte.

## Notes from Current Snapshot
- `public/index.html` ≈ 116 KB (uncompressed), with sizable JSON-LD blocks and multiple external references.
- `public/styles.css` ≈ 28 KB; verify purge is effective.
- Large assets present: `public/images` ≈ 34 MB, `public/music` ≈ 137 MB (serve via CDN and avoid eager loading).
- Multiple favicon sizes and an external Font Awesome stylesheet are referenced; both are easy trim targets.

