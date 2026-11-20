// POST /api/revalidate (lib/brand-pages/revalidate.ts): the secret header, the allowed paths, the answer.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleRevalidate, isRevalidatablePath } from '../lib/brand-pages/revalidate.ts';

const SECRET = 'test-secret-0123456789abcdefghijklmnopqrs';
const post = (body: unknown, secret?: string) => new Request('http://localhost/api/revalidate', {
  method: 'POST',
  headers: { 'content-type': 'application/json', ...(secret === undefined ? {} : { 'x-revalidate-secret': secret }) },
  body: typeof body === 'string' ? body : JSON.stringify(body),
});
const run = async (req: Request, server: { secret: string | undefined } = { secret: SECRET }) => {
  const { secret } = server;
  const done: string[] = [];
  const res = await handleRevalidate(req, { secret, revalidate: (p) => done.push(p), now: () => new Date('2026-11-20T18:00:00Z') });
  return { status: res.status, json: await res.json(), done };
};

test('401: no header, a wrong secret, or no REVALIDATE_SECRET on the server; nothing is revalidated', async () => {
  for (const r of [await run(post({ path: '/tempur-pedic' })), await run(post({ path: '/tempur-pedic' }, 'nope')), await run(post({ path: '/tempur-pedic' }, '')), await run(post({ path: '/tempur-pedic' }, SECRET), { secret: undefined }), await run(post({ path: '/tempur-pedic' }, SECRET), { secret: '' })]) {
    assert.equal(r.status, 401); assert.deepEqual(r.done, []); assert.equal(r.json.revalidated, false);
    assert.ok(!JSON.stringify(r.json).includes(SECRET));
  }
});

test('200: the right secret and a brand-page path → revalidatePath(path), { revalidated, path, at }', async () => {
  const r = await run(post({ path: '/tempur-pedic' }, SECRET));
  assert.equal(r.status, 200);
  assert.deepEqual(r.json, { revalidated: true, path: '/tempur-pedic', at: '2026-11-20T18:00:00.000Z' });
  assert.deepEqual(r.done, ['/tempur-pedic']);
  for (const p of ['/sealy', '/stearns-foster', '/tempur-pedic/']) assert.equal((await run(post({ path: p }, SECRET))).status, 200, p);
});

test('400: any other path, no path, or a body that is not JSON', async () => {
  for (const body of [{ path: '/' }, { path: '/booking' }, { path: '/tempur-pedicx' }, { path: 'tempur-pedic' }, { path: '/es/tempur-pedic' }, { path: '/tempur-pedic?x=1' }, { path: '/sealy/../booking' }, {}, { path: 7 }, 'not json']) {
    const r = await run(post(body, SECRET));
    assert.equal(r.status, 400, JSON.stringify(body)); assert.deepEqual(r.done, []);
  }
  assert.equal(isRevalidatablePath('/stearns-foster'), true);
  assert.equal(isRevalidatablePath('/sealy//x'), false);
});
