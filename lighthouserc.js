/**
 * SolarIQ Web - Lighthouse CI Configuration
 * Performance regression checking for CI pipeline
 */
module.exports = {
  ci: {
    collect: {
      // Use the local Next.js production server
      startServerCommand: 'npm run start',
      startServerReadyPattern: 'ready on',
      startServerReadyTimeout: 30000,

      // Key pages to test
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/signup',
        'http://localhost:3000/login',
        'http://localhost:3000/dashboard',
      ],

      // Run 3 times per URL for stable results
      numberOfRuns: 3,

      settings: {
        // Use mobile preset (Lighthouse default)
        preset: 'desktop',
        // Throttling settings for CI consistency
        throttling: {
          cpuSlowdownMultiplier: 2,
        },
        // Skip audits that require network
        skipAudits: ['uses-http2'],
      },
    },

    assert: {
      // Performance budgets - category scores (0-1 scale)
      assertions: {
        // Category scores
        'categories:performance': ['error', { minScore: 0.7 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.8 }],
        'categories:seo': ['error', { minScore: 0.8 }],

        // Core Web Vitals
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],

        // Additional performance metrics
        'first-contentful-paint': ['warn', { maxNumericValue: 1800 }],
        'speed-index': ['warn', { maxNumericValue: 3400 }],
        'interactive': ['warn', { maxNumericValue: 3800 }],
      },
    },

    upload: {
      // Store results locally as JSON (artifacts uploaded via CI)
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
  },
};
