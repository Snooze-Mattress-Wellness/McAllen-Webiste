import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // `clearance` branch (November 12, 2026): the site is no longer a static export (output: 'export'). The Clearance &
  // Floor Models page needs a server — /clearance is regenerated from the remote listings feed every 60 s (ISR) and
  // /api/clearance-request relays the request form to a webhook whose URL must stay server-side — so Vercel runs the
  // Next.js runtime: every other route is still prerendered at build time and served from the cache; only
  // /clearance (ISR) and the API routes run as functions. Redirects, rewrites and cache headers stay in vercel.json.
  // On main the line `output: 'export'` is still here; merging this branch is the decision to move production off
  // the static export (ISR reads / function invocations on Vercel).
  // the page's own CSS (global.css, the Poppins faces, component modules: ~15 KB) is written into the HTML instead
  // of three render-blocking stylesheet requests
  experimental: { inlineCss: true },
  // next/image (footer logo, blog images) serves the local files as they are; nothing is optimized per request
  images: { unoptimized: true },
  // The Tempur-Pedic brand page is English only: the Spanish URL (also what the header's EN | ES switch links to) 308s
  // to it. Kept here rather than in vercel.json so `next start` applies it too (local checks); Vercel applies both kinds.
  async redirects() {
    return [{ source: '/es/tempur-pedic', destination: '/tempur-pedic', permanent: true }];
  },
};

export default nextConfig;
