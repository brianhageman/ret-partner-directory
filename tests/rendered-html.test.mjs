import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the RET partner directory shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>RET Industry Partner Directory<\/title>/i);
  assert.match(html, /RET Industry Partner Directory/);
  assert.match(html, /Connect your classroom to real-world STEM/);
  assert.match(html, /Content Area/);
  assert.match(html, /Partner Finder/);
  assert.match(html, /Filter by opportunity type/);
  assert.match(html, /Suggest a Partner/);
  assert.doesNotMatch(html, /Virtual friendly|Recommended matches|Teaching subject/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/);
});

test("keeps starter preview artifacts out of the finished app", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /RET relevance tags/);
  assert.match(page, /Generate outreach email/);
  assert.match(page, /SHEET_CSV_URL/);
  assert.match(page, /APPS_SCRIPT_JSON_URL/);
  assert.match(page, /partnersFromJson/);
  assert.match(page, /connects naturally to/);
  assert.match(layout, /RET Industry Partner Directory/);
  assert.doesNotMatch(page, /SkeletonPreview|STARLAB relevance tags|codex-preview|hidden RET relevance tags/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await assert.rejects(access(new URL("../app/_sites-preview/", import.meta.url)));
});
