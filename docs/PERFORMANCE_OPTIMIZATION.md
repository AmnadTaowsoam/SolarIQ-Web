# WK-109: Performance Optimization (Core Web Vitals)

## Overview

This document outlines the performance optimizations implemented for SolarIQ Web to achieve Core Web Vitals targets:

- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

## Implemented Optimizations

### 1. Image Optimization

**Configuration:** [`next.config.mjs`](../next.config.mjs)

- **WebP/AVIF Support:** Automatic conversion to modern image formats
- **Responsive Images:** Device sizes configured for mobile, tablet, and desktop
- **Lazy Loading:** Below-fold images loaded on demand
- **Cache TTL:** 30 days for optimized images

```javascript
images: {
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [375, 640, 768, 1024, 1280, 1920],
  imageSizes: [16, 32, 48, 64, 96, 128, 256],
  minimumCacheTTL: 60 * 60 * 24 * 30,
}
```

**Usage:** Replace `<img>` tags with Next.js `<Image>` component.

### 2. JavaScript Optimization

**Lazy-Loaded Chart Components:** [`src/components/charts/`](../src/components/charts/)

- **LineChart:** `LazyLineChart` - Dynamically imports recharts
- **BarChart:** `LazyBarChart` - Dynamically imports recharts
- **AreaChart:** `LazyAreaChart` - Dynamically imports recharts

**Example:**

```tsx
import { LazyLineChart } from '@/components/charts'

;<LazyLineChart data={data} lines={[{ dataKey: 'value', stroke: '#f97316' }]} height={300} />
```

**Tree Shaking:** [`next.config.mjs`](../next.config.mjs)

```javascript
experimental: {
  optimizePackageImports: ['recharts', 'lucide-react', '@heroicons/react', '@headlessui/react'],
}
```

### 3. CSS Optimization

**Critical CSS Inline:** [`src/components/CriticalCSS.tsx`](../src/components/CriticalCSS.tsx)

- Inlines critical CSS for above-the-fold content
- Prevents render-blocking CSS
- Reduces LCP

**Tailwind Purge:** [`tailwind.config.ts`](../tailwind.config.ts)

```javascript
content: [
  './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  './src/app/**/*.{js,ts,jsx,tsx,mdx}',
],
```

### 4. Caching & CDN

**Cloudflare Pages Headers:** [`public/_headers`](../public/_headers)

- Static assets: 1 year cache
- API responses: 5 minutes cache
- JavaScript/CSS: 1 year cache with immutable

**Next.js Headers:** [`next.config.mjs`](../next.config.mjs)

```javascript
async headers() {
  return [
    {
      source: '/:all*(svg|jpg|jpeg|png|gif|webp|avif|ico|woff|woff2|ttf|eot)',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
  ]
}
```

**Service Worker:** [`next.config.mjs`](../next.config.mjs)

- Runtime caching for Google Maps
- Static image caching
- Resource caching (JS/CSS)

### 5. Performance Monitoring

**Performance Monitor Component:** [`src/components/PerformanceMonitor.tsx`](../src/components/PerformanceMonitor.tsx)

- Tracks LCP, FID, CLS, FCP, TTFB
- Reports poor metrics to Sentry
- Visual indicator in development (Ctrl+Shift+P)

**Web Vitals Library:** [`src/lib/webVitals.ts`](../src/lib/webVitals.ts)

- Core Web Vitals tracking
- Sentry integration
- Development console logging

### 6. DNS Prefetching

**Preconnect Component:** [`src/components/Preconnect.tsx`](../src/components/Preconnect.tsx)

- Preconnect to Google Fonts
- Preconnect to Google Maps API
- Preconnect to Stripe
- DNS prefetch for external APIs

### 7. Bundle Analysis

**Bundle Analyzer:** [`@next/bundle-analyzer`](../package.json)

```bash
npm run analyze
```

Analyzes bundle size and identifies optimization opportunities.

## Scripts

| Script                  | Description              |
| ----------------------- | ------------------------ |
| `npm run analyze`       | Analyze bundle size      |
| `npm run build`         | Production build         |
| `npm run lint`          | Run ESLint               |
| `npm run type-check`    | TypeScript type checking |
| `npm run test:coverage` | Run tests with coverage  |

## Performance Targets

| Metric | Target  | Good    | Needs Improvement | Poor    |
| ------ | ------- | ------- | ----------------- | ------- |
| LCP    | < 2.5s  | < 2.5s  | 2.5s - 4s         | > 4s    |
| FID    | < 100ms | < 100ms | 100ms - 300ms     | > 300ms |
| CLS    | < 0.1   | < 0.1   | 0.1 - 0.25        | > 0.25  |
| FCP    | < 1.8s  | < 1.8s  | 1.8s - 3s         | > 3s    |
| TTFB   | < 800ms | < 800ms | 800ms - 1.8s      | > 1.8s  |

## Monitoring

### Development

- Performance monitor visible in development
- Press `Ctrl+Shift+P` to toggle
- Metrics logged to console

### Production

- Poor metrics reported to Sentry
- Web Vitals tracked via [`web-vitals`](https://github.com/GoogleChrome/web-vitals) library
- Performance data available in Sentry dashboards

## Best Practices

### Images

1. Use Next.js `<Image>` component for all images
2. Provide explicit width/height to prevent CLS
3. Use `priority` prop for above-fold images
4. Lazy-load images below the fold

### JavaScript

1. Lazy-load heavy components (charts, maps)
2. Use dynamic imports for code splitting
3. Tree-shake unused imports
4. Minimize bundle size

### CSS

1. Critical CSS inlined for above-fold content
2. Tailwind CSS purged in production
3. Minimize CSS bundle size
4. Avoid render-blocking CSS

### Caching

1. Long cache for static assets (1 year)
2. Short cache for API responses (5 minutes)
3. Use immutable for versioned assets
4. Leverage CDN (Cloudflare Pages)

## Troubleshooting

### Poor LCP

- Check image sizes and formats
- Verify lazy loading is working
- Check server response time
- Optimize above-fold content

### Poor FID

- Reduce JavaScript execution time
- Defer non-critical scripts
- Optimize event handlers
- Reduce main thread work

### Poor CLS

- Specify image dimensions
- Reserve space for dynamic content
- Avoid inserting content above existing content
- Use CSS aspect-ratio

## Resources

- [Core Web Vitals](https://web.dev/vitals/)
- [Next.js Image Optimization](https://nextjs.org/docs/api-reference/next/image)
- [Web Vitals Library](https://github.com/GoogleChrome/web-vitals)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

## Checklist

- [x] Image optimization (WebP/AVIF, lazy loading)
- [x] JavaScript optimization (lazy loading, tree shaking)
- [x] CSS optimization (critical CSS, Tailwind purge)
- [x] Caching headers (Cloudflare, Next.js)
- [x] Performance monitoring (Web Vitals, Sentry)
- [x] DNS preconnect
- [x] Bundle analyzer
- [x] Service Worker for offline support
- [x] Critical CSS inlining
- [ ] Lighthouse score > 90 on all key pages
