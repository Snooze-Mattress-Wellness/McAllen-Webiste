// The store's social profiles (lib/location.ts LOCATION.social): one config read by the footer icons
// (components/SiteFooter.tsx) and the site-wide structured data's sameAs (lib/schema.ts). Client request, November 27,
// 2026: the store's own Facebook page and TikTok.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LOCATION } from '../lib/location.ts';
import { ui } from '../lib/i18n.ts';

const OLD_FB = 'https://www.facebook.com/p/Snooze-Mattress-Wellness-61575812121380/';

test('social profiles: the new Facebook page and TikTok; the others unchanged, in order', () => {
  assert.deepEqual(LOCATION.social, {
    facebook: 'https://www.facebook.com/SnoozeMattressNorthMcAllen',
    instagram: 'https://www.instagram.com/snoozemcallen',
    youtube: 'https://www.youtube.com/@SnoozeMcAllen',
    linkedin: 'https://www.linkedin.com/company/snooze-mattress-mcallen',
    tiktok: 'https://www.tiktok.com/@snoozemattress_rgv',
  });
  for (const url of Object.values(LOCATION.social)) assert.ok(!/google\.com\/url/.test(url), 'no redirect links');
});

test('structured data: both sameAs lists name every profile from the config (TikTok included), the store keeps its Maps listing last', () => {
  const src = readFileSync(new URL('../lib/schema.ts', import.meta.url), 'utf8');
  assert.ok(src.includes('sameAs: [L.social.facebook, L.social.instagram, L.social.youtube, L.social.linkedin, L.social.tiktok],'), 'Organization');
  assert.ok(src.includes('sameAs: [L.social.facebook, L.social.instagram, L.social.youtube, L.social.linkedin, L.social.tiktok, L.gbpUrl],'), 'the store');
  assert.ok(!src.includes(OLD_FB));
});

test('footer: the TikTok icon after LinkedIn, new tab, its accessible name in both languages', () => {
  const footer = readFileSync(new URL('../components/SiteFooter.tsx', import.meta.url), 'utf8');
  const order = ['facebook', 'instagram', 'youtube', 'linkedin', 'tiktok'].map((k) => footer.indexOf(`LOCATION.social.${k}`));
  assert.ok(order.every((i, n) => i > 0 && (n === 0 || i > order[n - 1])), 'Facebook, Instagram, YouTube, LinkedIn, TikTok');
  assert.ok(footer.includes('<a href={LOCATION.social.tiktok} target="_blank" rel="noopener" aria-label={f.tiktok}>'));
  assert.equal(ui('en').footer.tiktok, 'Snooze Mattress RGV on TikTok');
  assert.equal(ui('es').footer.tiktok, 'Snooze Mattress RGV en TikTok'); // the other icons' labels are translated ("en Facebook")
  assert.equal(ui('es').footer.facebook, 'Snooze McAllen en Facebook');
});
