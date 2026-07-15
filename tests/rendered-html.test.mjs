import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("keeps the teacher-facing RET partner directory shell in place", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /RET Industry Partner Directory/);
  assert.match(page, /RET Industry Partner Directory/);
  assert.match(page, /Connect your classroom to real-world STEM/);
  assert.match(page, /Content Area/);
  assert.match(page, /Partner Finder/);
  assert.match(page, /Filter by opportunity type/);
  assert.match(page, /Suggest a Partner/);
  assert.match(page, /Want to add a lead to the list/);
  assert.match(page, /All suggestions are appreciated/);
  assert.match(page, />Submit</);
  assert.match(page, /RET Relevance Tags/);
  assert.match(page, /Generate outreach email/);
  assert.match(page, /SHEET_CSV_URL/);
  assert.match(page, /APPS_SCRIPT_JSON_URL/);
  assert.match(page, /partnersFromJson/);
  assert.match(page, /connects naturally to/);
  assert.match(page, /availableOpportunityPhrase/);
  assert.match(page, /sentenceCase\(readableList\(options\)\)/);
  assert.match(page, /An outreach connection could help students explore/);
  assert.match(page, /suggestionDraft/);
  assert.match(page, /Copy and send this suggestion/);
  assert.match(page, /bhageman@lps\.org/);
  assert.match(page, /const outOfRegion = region !== "All regions" && localRank === 0/);
  assert.match(page, /if \(!isPositive\(partner\.virtual\)\) return false/);
  assert.match(page, /filters\.tour \|\| filters\.speaker \|\| filters\.mentor/);
  assert.match(packageJson, /"build": "next build --webpack"/);
  assert.doesNotMatch(
    page,
    /SkeletonPreview|STARLAB relevance tags|codex-preview|hidden RET relevance tags|sourceStatus|className="score"|Draft suggestions|Coordinator View|adminOpen|mailto:|Virtual friendly|Recommended matches|Teaching subject|Using live Google Sheet data|Search uses public fields|class="score"|Private\/internal fields|A visit, speaker, or virtual conversation/,
  );
  assert.doesNotMatch(packageJson, /react-loading-skeleton|vinext|wrangler/);

  await assert.rejects(access(new URL("../app/_sites-preview/", import.meta.url)));
});
