"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Partner = {
  id: string;
  organization: string;
  sector: string;
  location: string;
  website: string;
  contacts: string;
  contactRole: string;
  email: string;
  phone: string;
  tags: string;
  tour: string;
  speaker: string;
  virtual: string;
  status: string;
  notes: string;
};

type Subject =
  | "Physics"
  | "Chemistry"
  | "Physical Science"
  | "Biology"
  | "Geoscience"
  | "Environmental Science"
  | "Zoology"
  | "Astronomy"
  | "Engineering"
  | "Computer Science"
  | "Mathematics"
  | "Health Science"
  | "General STEM";

type Suggestion = {
  organization: string;
  website: string;
  location: string;
  connection: string;
  subject: Subject;
  notes: string;
};

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1dKMkOsVlfuLRnw4qHnT757E1tQa8Qfm3m-Srh6iv-JM/gviz/tq?tqx=out:csv&gid=1188711968";
const APPS_SCRIPT_JSON_URL = "";

const subjects: Subject[] = [
  "Physics",
  "Chemistry",
  "Physical Science",
  "Biology",
  "Geoscience",
  "Environmental Science",
  "Zoology",
  "Astronomy",
  "Engineering",
  "Computer Science",
  "Mathematics",
  "Health Science",
  "General STEM",
];

const regions = [
  "All regions",
  "Georgia / Atlanta",
  "Minnesota / Twin Cities",
  "Nebraska / Lincoln-Omaha",
];

const subjectKeywords: Record<Subject, string[]> = {
  Physics: [
    "optics",
    "ellipsometry",
    "thin films",
    "spintronics",
    "sensors",
    "motion",
    "aerospace",
    "semiconductor",
    "instrumentation",
    "materials characterization",
    "light",
    "electronics",
  ],
  Chemistry: [
    "analytical chemistry",
    "chemistry",
    "materials",
    "sample preparation",
    "trace metals",
    "formulation",
    "quality control",
    "chemical",
    "coatings",
    "ceramic",
  ],
  "Physical Science": [
    "manufacturing",
    "materials",
    "optics",
    "energy",
    "instrumentation",
    "quality control",
    "sensors",
    "semiconductor",
    "3d printing",
  ],
  Biology: [
    "biotech",
    "biotechnology",
    "cell",
    "gene",
    "dna",
    "biomedical",
    "molecular biology",
    "medical",
    "health",
    "clinical",
  ],
  Geoscience: [
    "environmental testing",
    "trace metals",
    "mining",
    "earth",
    "remote sensing",
    "materials characterization",
    "sample preparation",
  ],
  "Environmental Science": [
    "environmental",
    "testing",
    "trace metals",
    "energy",
    "water",
    "agriculture",
    "quality control",
    "sustainability",
  ],
  Zoology: [
    "biomedical",
    "biology",
    "sensors",
    "health",
    "clinical",
    "biotechnology",
    "medical",
  ],
  Astronomy: [
    "optics",
    "sensors",
    "instrumentation",
    "data analysis",
    "aerospace",
    "light",
    "thin films",
  ],
  Engineering: [
    "engineering",
    "manufacturing",
    "automation",
    "semiconductor",
    "aerospace",
    "prototyping",
    "additive manufacturing",
    "motion control",
    "electronics",
    "fluid system",
    "materials",
  ],
  "Computer Science": [
    "software",
    "data",
    "automation",
    "supply chain",
    "sensor",
    "memory",
    "mram",
    "cyber",
    "ai",
    "analytics",
  ],
  Mathematics: [
    "data analysis",
    "measurement",
    "quality control",
    "instrumentation",
    "modeling",
    "automation",
    "statistics",
    "testing",
  ],
  "Health Science": [
    "health",
    "medical",
    "biomedical",
    "consumer healthcare",
    "clinical",
    "product testing",
    "gene therapy",
    "biomanufacturing",
    "hearing",
  ],
  "General STEM": [
    "stem outreach",
    "career exploration",
    "student opportunities",
    "workforce",
    "research",
    "manufacturing",
    "technology",
    "engineering",
  ],
};

const seedPartners: Partner[] = [];

function parseCsv(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;

  for (let i = 0; i < csv.length; i += 1) {
    const char = csv[i];
    const next = csv[i + 1];

    if (char === '"' && quoted && next === '"') {
      value += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(value);
      value = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(value);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  row.push(value);
  if (row.some((cell) => cell.trim())) rows.push(row);
  return rows;
}

function normalizeHeader(header: string) {
  return header.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function partnersFromRows(rows: string[][]): Partner[] {
  const headers = rows[0]?.map(normalizeHeader) ?? [];
  const find = (aliases: string[]) =>
    headers.findIndex((header) => aliases.includes(header));
  const columns = {
    organization: find(["organizationname", "organization", "companyname"]),
    sector: find(["industrysector", "industry", "sector"]),
    location: find(["locationaddress", "location", "citystate"]),
    website: find(["website", "url"]),
    contacts: find(["primarycontact", "contactnames", "contactname"]),
    contactRole: find(["contactroletitle", "contactrole", "title"]),
    email: find(["email", "emailaddresses", "contactemail"]),
    phone: find(["phone", "phonenumber"]),
    tags: find(["retrelevancetags", "starlabrelevancetags", "relevancetags"]),
    tour: find(["touravailability", "tours"]),
    speaker: find(["guestspeakeravailability", "speakeravailability"]),
    virtual: find(["virtualoption", "virtualavailability"]),
    status: find(["status"]),
    notes: find([
      "notes",
      "generalnotes",
      "suggestedclassroomconnections",
      "internalnotes",
      "relationshiphistoryorfollowupnotes",
    ]),
  };

  return rows
    .slice(1)
    .map((row, index) => ({
      id: `sheet-${index + 1}-${row[columns.organization] ?? ""}`,
      organization: row[columns.organization] ?? "",
      sector: row[columns.sector] ?? "",
      location: row[columns.location] ?? "",
      website: row[columns.website] ?? "",
      contacts: row[columns.contacts] ?? "",
      contactRole: row[columns.contactRole] ?? "",
      email: row[columns.email] ?? "",
      phone: row[columns.phone] ?? "",
      tags: row[columns.tags] ?? "",
      tour: row[columns.tour] ?? "",
      speaker: row[columns.speaker] ?? "",
      virtual: row[columns.virtual] ?? "",
      status: row[columns.status] ?? "",
      notes: row[columns.notes] ?? "",
    }))
    .filter((partner) => partner.organization.trim());
}

function partnerFromRecord(record: Record<string, unknown>, index: number): Partner {
  const value = (...keys: string[]) => {
    for (const key of keys) {
      const found = record[key];
      if (found !== undefined && found !== null) return String(found);
    }
    return "";
  };

  return {
    id: value("id") || `json-${index + 1}-${value("Organization Name", "organization")}`,
    organization: value("Organization Name", "organization"),
    sector: value("Industry / Sector", "sector"),
    location: value("Location / Address", "location"),
    website: value("Website", "website"),
    contacts: value("Primary Contact", "contacts"),
    contactRole: value("Contact Role / Title", "contactRole"),
    email: value("Email", "email"),
    phone: value("Phone", "phone"),
    tags: value("RET Relevance Tags", "tags"),
    tour: value("Tour Availability", "tour"),
    speaker: value("Guest Speaker Availability", "speaker"),
    virtual: value("Virtual Option", "virtual"),
    status: value("Status", "status"),
    notes: value("Notes", "notes"),
  };
}

function partnersFromJson(payload: unknown): Partner[] {
  const records = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { partners?: unknown }).partners)
      ? (payload as { partners: unknown[] }).partners
      : [];

  return records
    .filter((record): record is Record<string, unknown> => {
      return Boolean(record) && typeof record === "object" && !Array.isArray(record);
    })
    .map(partnerFromRecord)
    .filter((partner) => partner.organization.trim());
}

function cleanText(value: string) {
  return value.replace(/STARLAB/g, "RET").trim();
}

function searchable(partner: Partner) {
  return cleanText(
    [
      partner.organization,
      partner.sector,
      partner.location,
      partner.website,
      partner.tags,
      partner.notes,
      partner.status,
      partner.contacts,
      partner.contactRole,
    ].join(" ")
  ).toLowerCase();
}

function availabilityValue(value: string) {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return "Unknown";
  if (normalized.includes("yes")) return "Yes";
  if (normalized.includes("maybe")) return "Maybe";
  if (normalized.includes("no")) return "No";
  return value;
}

function isPositive(value: string) {
  const normalized = availabilityValue(value);
  return normalized === "Yes" || normalized === "Maybe";
}

function inferSector(partner: Partner) {
  if (partner.sector) return partner.sector;
  const haystack = searchable(partner);
  if (haystack.includes("semiconductor") || haystack.includes("microelectronics"))
    return "Semiconductor / Microelectronics";
  if (haystack.includes("biotech") || haystack.includes("medical"))
    return "Biotech / Medical";
  if (haystack.includes("software") || haystack.includes("data"))
    return "Software / Data";
  if (haystack.includes("manufacturing")) return "Manufacturing";
  if (haystack.includes("aerospace")) return "Aerospace";
  if (haystack.includes("energy")) return "Energy / Utilities";
  if (haystack.includes("instrumentation") || haystack.includes("sensor"))
    return "Scientific Instrumentation";
  return "STEM Partner";
}

function regionScore(partner: Partner, region: string) {
  const location = partner.location.toLowerCase();
  if (region === "All regions") return 1;
  if (region === "Georgia / Atlanta")
    return location.includes("ga") || location.includes("atlanta") ? 5 : 0;
  if (region === "Minnesota / Twin Cities")
    return location.includes("mn") ||
      location.includes("minneapolis") ||
      location.includes("bloomington") ||
      location.includes("chaska") ||
      location.includes("eden prairie")
      ? 5
      : 0;
  if (region === "Nebraska / Lincoln-Omaha")
    return location.includes("ne") ||
      location.includes("lincoln") ||
      location.includes("omaha")
      ? 5
      : 0;
  return 0;
}

function subjectScore(partner: Partner, subject: Subject) {
  const haystack = searchable(partner);
  const exactSubject = subject.toLowerCase();
  const exact = haystack.includes(exactSubject) ? 3 : 0;
  const keywordScore = subjectKeywords[subject].reduce(
    (score, keyword) => score + (haystack.includes(keyword) ? 1 : 0),
    0
  );
  return exact + keywordScore;
}

function matchedIdeas(partner: Partner, subject: Subject) {
  const haystack = searchable(partner);
  return subjectKeywords[subject]
    .filter((keyword) => haystack.includes(keyword))
    .slice(0, 4);
}

function readableList(items: string[]) {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function classroomFrame(subject: Subject) {
  const frames: Record<Subject, string> = {
    Physics:
      "forces, energy, light, sensors, measurement, and the tools engineers use to study physical systems",
    Chemistry:
      "materials, chemical testing, product formulation, quality control, and the way substances are designed or measured",
    "Physical Science":
      "matter, energy, materials, measurement, and the engineering decisions behind real products and processes",
    Biology:
      "living systems, biotechnology, health applications, lab methods, and the way research moves into real-world tools",
    Geoscience:
      "Earth materials, environmental testing, instrumentation, data collection, and the systems that shape local communities",
    "Environmental Science":
      "environmental monitoring, resource use, sustainability, testing, and science-based decision making",
    Zoology:
      "life science, health, sensing, biotechnology, and how STEM tools help researchers understand organisms and systems",
    Astronomy:
      "light, optics, sensors, data analysis, instrumentation, and the technologies used to observe distant systems",
    Engineering:
      "design, manufacturing, materials, testing, prototyping, automation, and how teams solve technical problems",
    "Computer Science":
      "data, automation, software, sensing, cybersecurity, and the digital systems behind modern STEM work",
    Mathematics:
      "measurement, modeling, data analysis, quality control, and the quantitative reasoning used in technical workplaces",
    "Health Science":
      "biomedical innovation, product testing, patient-centered technology, biotechnology, and healthcare careers",
    "General STEM":
      "career exploration, problem solving, workplace tools, and the many ways STEM shows up outside the classroom",
  };
  return frames[subject];
}

function subjectDescription(partner: Partner, subject: Subject) {
  const ideas = matchedIdeas(partner, subject);
  const org = partner.organization;
  const sector = inferSector(partner).toLowerCase();
  const notes = cleanText(partner.notes);
  const firstNote = notes
    .split(".")
    .map((sentence) => sentence.trim())
    .filter(Boolean)[0];

  if (ideas.length > 0) {
    return `${org} connects naturally to ${subject.toLowerCase()} through ${readableList(
      ideas
    )}. A visit, speaker, or virtual conversation could help students see ${classroomFrame(
      subject
    )} in the context of real work in ${sector}.`;
  }

  if (subject === "General STEM") {
    return `${org} can support broad STEM career exploration through its work in ${sector}. ${
      firstNote?.slice(0, 140) ||
      "Teachers could explore whether a tour, talk, mentoring conversation, or project feedback session would fit their students."
    }.`;
  }

  return `${org} may be useful for ${subject.toLowerCase()} when framed around ${classroomFrame(
    subject
  )}. Teachers can use this lead to explore authentic STEM careers, workplace tools, and student-facing outreach in ${sector}.`;
}

function splitPeople(value: string) {
  return value
    .split(/;|, and | and /i)
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitEmails(value: string) {
  return value
    .split(/;|,|\s+/)
    .map((item) => item.trim())
    .filter((item) => item.includes("@"));
}

function opportunityText(filters: Record<string, boolean>) {
  const selected = [
    filters.tour ? "a student tour" : "",
    filters.speaker ? "a guest speaker visit" : "",
    filters.virtual ? "a virtual presentation" : "",
    filters.mentor ? "mentoring or project feedback" : "",
  ].filter(Boolean);
  return selected.length ? selected.join(", ") : "a tour, guest speaker visit, virtual presentation, mentoring, or project feedback";
}

function generateEmail(
  partner: Partner,
  subject: Subject,
  filters: Record<string, boolean>
) {
  const contact = splitPeople(partner.contacts)[0] || "there";
  const opportunities = opportunityText(filters);
  return `Subject: Exploring a student STEM connection with ${partner.organization}

Hello ${contact},

I am a teacher connected to an RET-supported teacher network that is looking for authentic STEM and industry connections for students. I teach ${subject.toLowerCase()}, and ${partner.organization} stood out as a possible partner because of your work in ${inferSector(
    partner
  ).toLowerCase()}.

I am interested in exploring ${opportunities}. We are especially interested in experiences that help students see how classroom science, engineering, technology, or mathematics connects to real careers and current industry work.

Would you be open to a short conversation about possible outreach opportunities, such as a tour, guest speaker visit, virtual presentation, mentoring, or feedback on student projects?

Thank you for considering it,

[Your name]
[School / district]
[Best contact information]`;
}

export default function Home() {
  const [partners, setPartners] = useState<Partner[]>(seedPartners);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("All regions");
  const [subject, setSubject] = useState<Subject>("General STEM");
  const [filters, setFilters] = useState({
    tour: false,
    speaker: false,
    virtual: false,
    mentor: false,
    best: false,
  });
  const [sort, setSort] = useState("Best subject match");
  const [selected, setSelected] = useState<Partner | null>(null);
  const [emailDraft, setEmailDraft] = useState("");
  const [suggestionDraft, setSuggestionDraft] = useState("");
  const [copied, setCopied] = useState(false);
  const [suggestionCopied, setSuggestionCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const liveSource = APPS_SCRIPT_JSON_URL || SHEET_CSV_URL;

    fetch(liveSource)
      .then(async (response) => {
        if (!response.ok) throw new Error("Sheet data was not available.");
        if (APPS_SCRIPT_JSON_URL) return partnersFromJson(await response.json());
        return partnersFromRows(parseCsv(await response.text()));
      })
      .then((parsed) => {
        if (!cancelled && parsed.length > 0) {
          setPartners(parsed);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (selected) setEmailDraft(generateEmail(selected, subject, filters));
    setCopied(false);
  }, [selected, subject, filters]);

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();

    return partners
      .map((partner) => {
        const subjectRank = subjectScore(partner, subject);
        const localRank = regionScore(partner, region);
        const virtualRank = isPositive(partner.virtual) ? 2 : 0;
        const score =
          subjectRank * 8 +
          localRank * 4 +
          virtualRank +
          (isPositive(partner.tour) ? 1 : 0) +
          (isPositive(partner.speaker) ? 1 : 0);
        return { partner, score, subjectRank, localRank };
      })
      .filter(({ partner, subjectRank, localRank }) => {
        const outOfRegion = region !== "All regions" && localRank === 0;
        if (text && !searchable(partner).includes(text)) return false;
        if (outOfRegion) {
          if (!isPositive(partner.virtual)) return false;
          if ((filters.tour || filters.speaker || filters.mentor) && !filters.virtual) {
            return false;
          }
        }
        if (filters.best && subjectRank === 0 && subject !== "General STEM")
          return false;
        if (filters.tour && !isPositive(partner.tour)) return false;
        if (filters.speaker && !isPositive(partner.speaker)) return false;
        if (filters.virtual && !isPositive(partner.virtual)) return false;
        if (filters.mentor) {
          const haystack = searchable(partner);
          if (!/(mentor|feedback|student|internship|project|research|q&a)/.test(haystack))
            return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sort === "Nearest") return b.localRank - a.localRank || b.score - a.score;
        if (sort === "Virtual available")
          return Number(isPositive(b.partner.virtual)) - Number(isPositive(a.partner.virtual));
        if (sort === "Tour available")
          return Number(isPositive(b.partner.tour)) - Number(isPositive(a.partner.tour));
        if (sort === "Speaker available")
          return Number(isPositive(b.partner.speaker)) - Number(isPositive(a.partner.speaker));
        return b.score - a.score;
      });
  }, [partners, query, region, subject, filters, sort]);

  function toggleFilter(key: keyof typeof filters) {
    setFilters((current) => ({ ...current, [key]: !current[key] }));
  }

  function openContact(partner: Partner) {
    setSelected(partner);
    setCopied(false);
  }

  function handleSuggestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const suggestion = {
      organization: String(form.get("organization") || ""),
      website: String(form.get("website") || ""),
      location: String(form.get("location") || ""),
      connection: String(form.get("connection") || ""),
      subject: String(form.get("subject") || "General STEM") as Subject,
      notes: String(form.get("notes") || ""),
    };
    const emailSubject = `RET partner suggestion: ${suggestion.organization}`;
    const emailBody = [
      "To: bhageman@lps.org",
      `Subject: ${emailSubject}`,
      "",
      "A teacher suggested a new partner for the RET Industry Partner Directory.",
      "",
      `Organization: ${suggestion.organization}`,
      `Website: ${suggestion.website || "Not provided"}`,
      `Location: ${suggestion.location || "Not provided"}`,
      `Suggested connection: ${suggestion.connection || "Not provided"}`,
      `Relevant content area: ${suggestion.subject}`,
      "",
      "Notes:",
      suggestion.notes || "Not provided",
      "",
      "Please review this lead and add it to the partner database if it is a good fit.",
    ].join("\n");

    setSuggestionDraft(emailBody);
    setSuggestionCopied(false);
    event.currentTarget.reset();
  }

  return (
    <main>
      <section className="hero">
        <div className="hero__content">
          <div>
            <p className="eyebrow">RET Industry Partner Directory</p>
            <h1>Connect your classroom to real-world STEM.</h1>
            <p className="hero__copy">
              This directory helps teachers find local and virtual industry partners who may be able to support classroom learning through tours, guest speakers, virtual visits, career connections, mentoring, and project feedback. Use it to discover organizations connected to the subjects you teach and to start building authentic STEM experiences for your students.
            </p>
          </div>
        </div>
        <div className="quickstart" aria-label="Start a teacher search">
          <label>
            Region
            <select value={region} onChange={(event) => setRegion(event.target.value)}>
              {regions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Content Area
            <select
              value={subject}
              onChange={(event) => setSubject(event.target.value as Subject)}
            >
              {subjects.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Search
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, industry, city, website, topic..."
            />
          </label>
          <a className="search-button" href="#directory">
            Search
          </a>
        </div>
      </section>

      <section className="directory" id="directory">
        <aside className="filters" aria-label="Partner filters">
          <div>
            <p className="eyebrow">Partner Finder</p>
            <h2>Filter by opportunity type</h2>
          </div>
          <div className="opportunity-checks" aria-label="Opportunity filters">
            <label className="check">
              <input
                type="checkbox"
                checked={filters.tour}
                onChange={() => toggleFilter("tour")}
              />
              Tour
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={filters.speaker}
                onChange={() => toggleFilter("speaker")}
              />
              Guest Speaker
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={filters.virtual}
                onChange={() => toggleFilter("virtual")}
              />
              Virtual
            </label>
          </div>
          <label>
            Sort
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option>Best subject match</option>
              <option>Nearest</option>
              <option>Virtual available</option>
              <option>Tour available</option>
              <option>Speaker available</option>
            </select>
          </label>
        </aside>

        <div className="results">
          <div className="results__bar">
            <div>
              <strong>{filtered.length}</strong> matches for <strong>{subject}</strong>
            </div>
            <a href="#suggest">Suggest a partner</a>
          </div>

          {filtered.map(({ partner }) => (
            <article className="partner-card" key={partner.id}>
              <div className="partner-card__main">
                <div>
                  <p className="sector">{inferSector(partner)}</p>
                  <h3>{partner.organization}</h3>
                  <p className="location">{partner.location || "Location not listed"}</p>
                </div>
              </div>
              <p className="description">{subjectDescription(partner, subject)}</p>
              <div className="badges" aria-label="Opportunity availability">
                <span className={`badge badge--${availabilityValue(partner.tour).toLowerCase()}`}>
                  Tour: {availabilityValue(partner.tour)}
                </span>
                <span className={`badge badge--${availabilityValue(partner.speaker).toLowerCase()}`}>
                  Speaker: {availabilityValue(partner.speaker)}
                </span>
                <span className={`badge badge--${availabilityValue(partner.virtual).toLowerCase()}`}>
                  Virtual: {availabilityValue(partner.virtual)}
                </span>
              </div>
              <div className="partner-card__actions">
                {partner.website ? (
                  <a href={partner.website} target="_blank" rel="noreferrer">
                    Website
                  </a>
                ) : (
                  <span>No website listed</span>
                )}
                <button onClick={() => openContact(partner)}>Contact</button>
              </div>
            </article>
          ))}

          {filtered.length === 0 && (
            <div className="empty">
              <h3>No exact matches yet</h3>
              <p>
                Try clearing an opportunity filter, broadening your search, or choosing "All regions" to include more partners.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="suggest" id="suggest">
        <div>
          <p className="eyebrow">Suggest a Partner</p>
          <h2>Want to add a lead to the list?</h2>
          <p>
            Know an organization that could support students through a tour, speaker, or virtual visit? Submit the suggestion and it will open an email to the directory coordinator for review. All suggestions are appreciated!
          </p>
        </div>
        <form onSubmit={handleSuggestion} className="suggest-form">
          <input name="organization" placeholder="Organization name" required />
          <input name="website" placeholder="Website" />
          <input name="location" placeholder="City/state or region" />
          <select name="subject" defaultValue="General STEM">
            {subjects.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <input name="connection" placeholder="Suggested connection, e.g. guest speaker" />
          <textarea name="notes" placeholder="Why this could be useful for students" />
          <button type="submit">Submit</button>
        </form>
      </section>

      {suggestionDraft && (
        <div className="modal-backdrop" role="presentation" onClick={() => setSuggestionDraft("")}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="suggestion-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal__head">
              <div>
                <p className="eyebrow">Suggest a Partner</p>
                <h2 id="suggestion-title">Copy and send this suggestion</h2>
              </div>
              <button
                className="ghost"
                onClick={() => setSuggestionDraft("")}
                aria-label="Close suggestion email draft"
              >
                Close
              </button>
            </div>
            <div className="email-tool">
              <div>
                <h3>Email draft for the directory coordinator</h3>
                <p>
                  Copy this message into your email and send it to bhageman@lps.org.
                </p>
              </div>
              <textarea
                value={suggestionDraft}
                onChange={(event) => setSuggestionDraft(event.target.value)}
                aria-label="Editable partner suggestion email draft"
              />
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(suggestionDraft);
                  setSuggestionCopied(true);
                }}
              >
                {suggestionCopied ? "Copied" : "Copy email draft"}
              </button>
            </div>
          </section>
        </div>
      )}

      {selected && (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelected(null)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal__head">
              <div>
                <p className="eyebrow">Contact</p>
                <h2 id="contact-title">{selected.organization}</h2>
              </div>
              <button className="ghost" onClick={() => setSelected(null)} aria-label="Close contact details">
                Close
              </button>
            </div>
            <dl className="contact-grid">
              <div>
                <dt>Name</dt>
                <dd>{splitPeople(selected.contacts).join(", ") || "Not listed"}</dd>
              </div>
              <div>
                <dt>Role</dt>
                <dd>{selected.contactRole || "Not listed"}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{splitEmails(selected.email).join(", ") || "Not listed"}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{selected.phone || "Not listed"}</dd>
              </div>
              <div>
                <dt>Website</dt>
                <dd>
                  {selected.website ? (
                    <a href={selected.website} target="_blank" rel="noreferrer">
                      {selected.website}
                    </a>
                  ) : (
                    "Not listed"
                  )}
                </dd>
              </div>
              <div>
                <dt>Contact notes</dt>
                <dd>{cleanText(selected.notes) || "No notes listed"}</dd>
              </div>
            </dl>
            <div className="email-tool">
              <div>
                <h3>Generate outreach email</h3>
                <p>
                  Editable copy/paste draft using your selected subject and opportunity filters.
                </p>
              </div>
              <textarea
                value={emailDraft}
                onChange={(event) => setEmailDraft(event.target.value)}
                aria-label="Editable outreach email draft"
              />
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(emailDraft);
                  setCopied(true);
                }}
              >
                {copied ? "Copied" : "Copy email draft"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
