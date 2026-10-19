export const REGIONS = [
  "All regions",
  "Georgia / Atlanta",
  "Minnesota / Twin Cities",
  "Nebraska / Lincoln-Omaha",
] as const;

export type Region = (typeof REGIONS)[number];

function normalizedLocation(location: string) {
  return location.toLowerCase().replace(/\s+/g, " ").trim();
}

function hasState(location: string, abbreviation: string, stateName: string) {
  return (
    location.includes(stateName) ||
    new RegExp(`(?:,|\\b)\\s*${abbreviation}(?:\\s+\\d{5}(?:-\\d{4})?)?(?:\\s*$|\\s*,)`).test(
      location
    )
  );
}

export function locationMatchesRegion(locationValue: string, region: Region) {
  if (region === "All regions") return true;

  const location = normalizedLocation(locationValue);
  if (!location) return false;

  if (region === "Georgia / Atlanta") {
    return location.includes("atlanta") || hasState(location, "ga", "georgia");
  }

  if (region === "Minnesota / Twin Cities") {
    return (
      hasState(location, "mn", "minnesota") ||
      /\b(minneapolis|saint paul|st\. paul|bloomington|chaska|eden prairie)\b/.test(
        location
      )
    );
  }

  return (
    hasState(location, "ne", "nebraska") ||
    /\b(lincoln|omaha)\b/.test(location)
  );
}

export function regionScore(location: string, region: Region) {
  if (region === "All regions") return 1;
  return locationMatchesRegion(location, region) ? 5 : 0;
}
