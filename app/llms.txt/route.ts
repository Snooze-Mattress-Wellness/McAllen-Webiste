// /llms.txt (robots.txt points at it): the hand-written guide in lib/llms.txt plus the "Brand pages" section generated
// from the brand registry (lib/brand-pages/llms.ts). Built once, at build time, as a static text file (it was a static
// file in public/ until November 20, 2026). No length cap.
import fs from 'node:fs';
import path from 'node:path';
import { buildLlmsTxt } from '@/lib/brand-pages/llms';
import { BRAND_LOCATION } from '@/lib/brand-pages/site';

export const dynamic = 'force-static';

export function GET() {
  const base = fs.readFileSync(path.join(process.cwd(), 'lib', 'llms.txt'), 'utf8');
  return new Response(buildLlmsTxt(base, BRAND_LOCATION), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
