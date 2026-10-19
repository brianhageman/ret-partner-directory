import assert from "node:assert/strict";
import test from "node:test";
import { locationMatchesRegion } from "../app/geography.ts";

test("Lincoln/Omaha includes Nebraska records without leaking Minnesota records", () => {
  const region = "Nebraska / Lincoln-Omaha";

  assert.equal(locationMatchesRegion("Lincoln, NE 68508", region), true);
  assert.equal(locationMatchesRegion("Omaha, Nebraska", region), true);
  assert.equal(locationMatchesRegion("Minneapolis, Minnesota", region), false);
  assert.equal(locationMatchesRegion("Bloomington, MN 55420", region), false);
});

test("Minnesota and Atlanta records match only their intended regions", () => {
  assert.equal(
    locationMatchesRegion("Minneapolis, MN", "Minnesota / Twin Cities"),
    true
  );
  assert.equal(locationMatchesRegion("Atlanta, GA 30332", "Georgia / Atlanta"), true);
  assert.equal(
    locationMatchesRegion("Atlanta, GA 30332", "Nebraska / Lincoln-Omaha"),
    false
  );
  assert.equal(
    locationMatchesRegion("Omaha, NE", "Minnesota / Twin Cities"),
    false
  );
});
