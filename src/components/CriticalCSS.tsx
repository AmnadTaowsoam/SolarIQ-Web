/**
 * WK-109: Performance Optimization - Critical CSS Inline
 * This component inlines critical CSS for above-the-fold content
 * to prevent render-blocking and improve LCP
 */

export function CriticalCSS() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          /* Critical CSS for above-the-fold content */
          
          /* Base styles */
          *, *::before, *::after {
            box-sizing: border-box;
          }
          
          html {
            font-family: var(--brand-font-body), var(--font-inter), var(--font-noto-thai), system-ui, sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          body {
            margin: 0;
            padding: 0;
            background-color: var(--brand-background, #f9fafb);
            color: var(--brand-text, #111827);
            line-height: 1.5;
          }
          
          /* Critical layout */
          .container {
            width: 100%;
            max-width: 1280px;
            margin: 0 auto;
            padding: 0 1rem;
          }
          
          /* Critical typography */
          h1, h2, h3, h4, h5, h6 {
            margin: 0;
            font-weight: 600;
            line-height: 1.2;
          }
          
          h1 { font-size: 2.5rem; }
          h2 { font-size: 2rem; }
          h3 { font-size: 1.5rem; }
          h4 { font-size: 1.25rem; }
          h5 { font-size: 1.125rem; }
          h6 { font-size: 1rem; }
          
          p {
            margin: 0 0 1rem 0;
          }
          
          /* Critical buttons */
          .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.625rem 1.25rem;
            font-size: 0.875rem;
            font-weight: 500;
            line-height: 1.25rem;
            border-radius: 0.5rem;
            border: 1px solid transparent;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          .btn-primary {
            background-color: var(--brand-primary, #f97316);
            color: white;
          }
          
          .btn-primary:hover {
            background-color: var(--brand-primary-hover, #ea580c);
          }
          
          .btn-secondary {
            background-color: white;
            color: var(--brand-primary, #f97316);
            border-color: var(--brand-primary, #f97316);
          }
          
          .btn-secondary:hover {
            background-color: var(--brand-primary-light, #fff7ed);
          }
          
          /* Critical loading states */
          .skeleton {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }
          
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          
          /* Critical flexbox utilities */
          .flex { display: flex; }
          .flex-col { flex-direction: column; }
          .items-center { align-items: center; }
          .justify-center { justify-content: center; }
          .justify-between { justify-content: space-between; }
          .gap-2 { gap: 0.5rem; }
          .gap-4 { gap: 1rem; }
          .gap-6 { gap: 1.5rem; }
          
          /* Critical spacing utilities */
          .p-2 { padding: 0.5rem; }
          .p-4 { padding: 1rem; }
          .p-6 { padding: 1.5rem; }
          .px-4 { padding-left: 1rem; padding-right: 1rem; }
          .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
          .m-0 { margin: 0; }
          .mb-2 { margin-bottom: 0.5rem; }
          .mb-4 { margin-bottom: 1rem; }
          .mb-6 { margin-bottom: 1.5rem; }
          
          /* Critical text utilities */
          .text-center { text-align: center; }
          .text-left { text-align: left; }
          .text-right { text-align: right; }
          .text-sm { font-size: 0.875rem; }
          .text-base { font-size: 1rem; }
          .text-lg { font-size: 1.125rem; }
          .text-xl { font-size: 1.25rem; }
          .text-2xl { font-size: 1.5rem; }
          .font-bold { font-weight: 700; }
          .font-semibold { font-weight: 600; }
          .font-medium { font-weight: 500; }
          .text-gray-900 { color: #111827; }
          .text-gray-600 { color: #4b5563; }
          .text-gray-500 { color: #6b7280; }
          .text-white { color: white; }
          
          /* Critical width utilities */
          .w-full { width: 100%; }
          .h-full { height: 100%; }
          .h-screen { height: 100vh; }
          
          /* Critical display utilities */
          .hidden { display: none; }
          .block { display: block; }
          .inline-block { display: inline-block; }
          
          /* Critical position utilities */
          .relative { position: relative; }
          .absolute { position: absolute; }
          .fixed { position: fixed; }
          
          /* Critical overflow utilities */
          .overflow-hidden { overflow: hidden; }
          .overflow-auto { overflow: auto; }
          
          /* Critical rounded utilities */
          .rounded { border-radius: 0.375rem; }
          .rounded-lg { border-radius: 0.5rem; }
          .rounded-full { border-radius: 9999px; }
          
          /* Critical shadow utilities */
          .shadow { box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); }
          .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
          
          /* Prevent CLS by reserving space */
          .aspect-video { aspect-ratio: 16/9; }
          .aspect-square { aspect-ratio: 1/1; }
          .aspect-4-3 { aspect-ratio: 4/3; }
          
          /* Dark mode critical styles */
          .dark body {
            background-color: #0f172a;
            color: #f8fafc;
          }
          
          .dark .text-gray-900 { color: #f8fafc; }
          .dark .text-gray-600 { color: #94a3b8; }
          .dark .text-gray-500 { color: #64748b; }
        `,
      }}
    />
  )
}
