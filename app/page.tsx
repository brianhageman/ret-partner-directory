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
  "Atlanta / Georgia",
  "Minnesota / Twin Cities",
  "Nebraska / Lincoln-Omaha",
  "Virtual friendly",
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

const seedPartners: Partner[] = [
  {
    id: "seed-1",
    organization: "Example Manufacturing Co.",
    sector: "Manufacturing",
    location: "Lincoln, NE",
    website: "https://example.com",
    contacts: "Jane Smith",
    contactRole: "Plant Manager",
    email: "jane@example.com",
    phone: "402-555-0123",
    tags: "manufacturing, materials science, quality control",
    tour: "Maybe",
    speaker: "Yes",
    virtual: "Yes",
    status: "Not contacted",
    notes: "Replace this row with a real partner lead.",
  },
  {
    id: "seed-2",
    organization: "Example University Lab",
    sector: "University / Research",
    location: "Lincoln, NE",
    website: "https://example.edu",
    contacts: "Dr. Alex Lee",
    contactRole: "Research Scientist",
    email: "alex@example.edu",
    phone: "",
    tags: "optics, sensors, data analysis, research design",
    tour: "No",
    speaker: "Maybe",
    virtual: "Yes",
    status: "Not contacted",
    notes: "Good fit for RET connections and student research feedback.",
  },
  {
    id: "seed-3",
    organization: "Haleon (Novartis)",
    sector: "Materials / Nanomaterials",
    location: "Lincoln, NE",
    website: "https://www.haleon.com/",
    contacts: "",
    contactRole: "",
    email: "",
    phone: "",
    tags: "Consumer healthcare, Biomedical science, Product formulation, Quality control, Manufacturing",
    tour: "",
    speaker: "",
    virtual: "",
    status: "Contacted",
    notes:
      "Connects to health science, chemistry, product testing, manufacturing, safety, effectiveness, packaging, and regulation.",
  },
  {
    id: "seed-4",
    organization: "Aldevron (Nature Technology Corporation)",
    sector: "Biotech / Medical",
    location: "Lincoln, NE",
    website: "https://www.aldevron.com/catalog-products/aldevron-and-ntc",
    contacts: "",
    contactRole: "",
    email: "",
    phone: "",
    tags: "Cell and gene therapy, Plasmid DNA manufacturing, Genetic medicine, Biomanufacturing, Biotechnology R&D",
    tour: "",
    speaker: "",
    virtual: "",
    status: "Not contacted",
    notes:
      "Useful for biotechnology, genetics, molecular biology, biomedical research, vaccine development, and advanced biomanufacturing.",
  },
  {
    id: "seed-5",
    organization: "Woollam JA Co Inc",
    sector: "Scientific Instrumentation / Materials Characterization",
    location: "Lincoln, NE",
    website: "https://www.jawoollam.com/",
    contacts: "Cathy Rustermier",
    contactRole: "HR Manager",
    email: "crustermier@jawoollam.com",
    phone: "402-477-7501",
    tags: "Ellipsometry, Optics, Thin films, Materials characterization, Instrumentation",
    tour: "Yes",
    speaker: "Yes",
    virtual: "Yes",
    status: "Interested",
    notes:
      "Researchers use polarized light and ellipsometry to measure material properties, test coatings, analyze surfaces, and support engineering, electronics, and nanoscience.",
  },
  {
    id: "seed-6",
    organization: "Elemental Scientific, Inc.",
    sector: "Scientific Instrumentation / Materials Characterization",
    location: "Omaha, NE",
    website: "https://www.icpms.com/",
    contacts: "Tyler Yost",
    contactRole: "",
    email: "tyler@icpms.com",
    phone: "402-991-7800",
    tags: "Laboratory automation, Analytical chemistry, ICP-MS, Sample preparation, Scientific instrumentation",
    tour: "Yes",
    speaker: "Maybe",
    virtual: "Maybe",
    status: "Interested",
    notes:
      "Connects to lab automation, environmental testing, semiconductor analysis, trace metals, measurement accuracy, clinical testing, mining, agriculture, and advanced manufacturing.",
  },
  {
    id: "seed-7",
    organization: "Tethon3D",
    sector: "Advanced Materials / Additive Manufacturing",
    location: "Omaha, NE",
    website: "https://tethon3d.com/",
    contacts: "",
    contactRole: "",
    email: "",
    phone: "",
    tags: "Ceramic 3D printing, Materials science, Additive manufacturing, Product prototyping, Advanced materials",
    tour: "",
    speaker: "",
    virtual: "",
    status: "Contacted",
    notes:
      "Connects to ceramics, materials science, engineering design, CAD-to-part workflows, heat resistance, strength, and surface finish.",
  },
  {
    id: "seed-8",
    organization: "Lincoln STEM Ecosystems",
    sector: "STEM Outreach",
    location: "Lincoln, NE",
    website: "https://stemecosystems.org/",
    contacts: "",
    contactRole: "",
    email: "",
    phone: "",
    tags: "STEM outreach, Career exploration, Community partnerships, Student opportunities, Workforce development",
    tour: "",
    speaker: "",
    virtual: "",
    status: "Contacted",
    notes:
      "Connector organization for schools, educators, nonprofits, industry partners, guest speakers, tour hosts, STEM career pathways, mentors, judges, and community partners.",
  },
  {
    id: "seed-9",
    organization: "Omaha STEM Ecosystems",
    sector: "STEM Outreach",
    location: "Omaha, NE",
    website: "https://omahastem.com/",
    contacts: "",
    contactRole: "",
    email: "",
    phone: "",
    tags: "STEM outreach, Career exploration, Community partnerships, Student opportunities, Workforce development",
    tour: "",
    speaker: "",
    virtual: "",
    status: "Contacted",
    notes:
      "Connector organization for schools, educators, nonprofits, industry partners, guest speakers, tour hosts, STEM career pathways, mentors, judges, and community partners.",
  },
  {
    id: "seed-10",
    organization: "Entegris",
    sector: "Advanced Manufacturing / Semiconductor Supply Chain",
    location: "Chaska & Bloomington, MN",
    website: "https://www.entegris.com/",
    contacts: "Justin Hubbard, Amanda Van Den Berg",
    contactRole: "HR Director, Advanced Purity Solutions, North America",
    email: "Justin.Hubbard@entegris.com; Amanda.VanDenBerg@entegris.com",
    phone: "",
    tags: "manufacturing, engineering, materials, semiconductor, purity, internships, school tours",
    tour: "Yes",
    speaker: "Yes",
    virtual: "Yes",
    status: "Interested",
    notes:
      "Manufacturing facilities in Chaska and Bloomington. Open to school connections, tours, Q&A with engineering teams, and opportunities that help students get excited about STEM.",
  },
  {
    id: "seed-11",
    organization: "NVE",
    sector: "Spintronics / Sensors",
    location: "Eden Prairie, MN",
    website: "https://www.nve.com/",
    contacts: "Pete Eames",
    contactRole: "VP of Advanced Technology",
    email: "peames@nve.com",
    phone: "",
    tags: "spintronics, nanotechnology, sensors, couplers, MRAM, medical, scientific applications",
    tour: "Yes",
    speaker: "No",
    virtual: "No",
    status: "Interested",
    notes:
      "Uses electron spin rather than electrical charge to acquire, store, and transmit data. Manufactures sensors, couplers, and non-volatile memory for industrial, medical, and scientific applications.",
  },
  {
    id: "seed-12",
    organization: "Swagelok",
    sector: "Industrial Fluid Systems",
    location: "Chaska, MN",
    website: "https://minn.swagelok.com/",
    contacts: "Casey McKinstrey",
    contactRole: "HR Business Partner",
    email: "casey.mckinstrey@swagelok.com",
    phone: "952-466-7596",
    tags: "fluid systems, manufacturing, valves, regulators, hoses, fittings, chemical processing, semiconductor",
    tour: "Yes",
    speaker: "Yes",
    virtual: "Yes",
    status: "Interested",
    notes:
      "Industrial fluid system solutions including valves, regulators, hoses, and leak-tight fittings used in oil and gas, semiconductor manufacturing, and chemical processing.",
  },
  {
    id: "seed-13",
    organization: "Trusted Semiconductor Solutions",
    sector: "Microelectronics",
    location: "Brooklyn Park, MN",
    website: "https://trustedsemi.com/",
    contacts: "Doug McKenney",
    contactRole: "ASIC Mentor",
    email: "Doug.McKenney@trustedsemi.com",
    phone: "",
    tags: "microelectronics, ASIC, semiconductor, aerospace, avionics, industrial, defense, supply chain",
    tour: "No",
    speaker: "Yes",
    virtual: "Yes",
    status: "Interested",
    notes:
      "Microelectronics design, manufacturing, and supply chain management for mission-critical and high-reliability environments.",
  },
  {
    id: "seed-14",
    organization: "Acuity Brands, Inc",
    sector: "Lighting / Building Technology",
    location: "Atlanta, GA",
    website: "http://www.acuitybrands.com/",
    contacts: "",
    contactRole: "",
    email: "",
    phone: "",
    tags: "lighting, sensors, energy, building systems, engineering, electronics",
    tour: "",
    speaker: "",
    virtual: "",
    status: "",
    notes: "Atlanta-area company with possible connections to lighting, controls, energy efficiency, and building technology.",
  },
  {
    id: "seed-15",
    organization: "Andson Biotech",
    sector: "Scientific Instrumentation / Materials Characterization",
    location: "Atlanta, GA",
    website: "https://andsonbiotech.com/",
    contacts: "Mason Chilmonczyk",
    contactRole: "",
    email: "",
    phone: "",
    tags: "biotech, instrumentation, analytical chemistry, biomedical, engineering",
    tour: "",
    speaker: "",
    virtual: "",
    status: "",
    notes: "Atlanta biotech lead with possible connections to scientific instrumentation, biomedical analysis, and applied engineering.",
  },
  {
    id: "seed-16",
    organization: "Axion Biosystems",
    sector: "Scientific Instrumentation / Materials Characterization",
    location: "Atlanta, GA",
    website: "http://www.axionbiosystems.com/",
    contacts: "",
    contactRole: "",
    email: "",
    phone: "",
    tags: "biosystems, biomedical, sensors, instrumentation, data analysis, biology",
    tour: "",
    speaker: "",
    virtual: "",
    status: "",
    notes: "Potential fit for life science instrumentation, biological systems, data collection, and biomedical engineering.",
  },
  {
    id: "seed-17",
    organization: "Bastille",
    sector: "Software / Data",
    location: "Atlanta, GA",
    website: "https://www.bastille.io/",
    contacts: "Dr. Brett Walkenhorst",
    contactRole: "",
    email: "",
    phone: "",
    tags: "software, data, cybersecurity, radio frequency, wireless, sensors",
    tour: "",
    speaker: "",
    virtual: "",
    status: "",
    notes: "Possible connection for cybersecurity, wireless sensing, data systems, radio frequency signals, and computer science.",
  },
  {
    id: "seed-18",
    organization: "Enovis, MedShape",
    sector: "Biotech / Medical",
    location: "Atlanta, GA",
    website: "http://www.medshape.com/",
    contacts: "",
    contactRole: "",
    email: "",
    phone: "",
    tags: "medical devices, biomedical engineering, materials, health science, manufacturing",
    tour: "",
    speaker: "",
    virtual: "",
    status: "",
    notes: "Medical device and biomedical engineering lead relevant to health science, materials, prototyping, and manufacturing.",
  },
  {
    id: "seed-19",
    organization: "Engenius Micro, LLC",
    sector: "Biotech / Medical",
    location: "Atlanta, GA",
    website: "http://www.engeniusmicro.com/",
    contacts: "",
    contactRole: "",
    email: "",
    phone: "",
    tags: "microtechnology, engineering, sensors, biomedical, aerospace, electronics",
    tour: "",
    speaker: "",
    virtual: "",
    status: "",
    notes: "Engineering lead with possible ties to microdevices, sensors, biomedical systems, and aerospace applications.",
  },
  {
    id: "seed-20",
    organization: "Luxcore",
    sector: "Energy / Utilities",
    location: "Atlanta, GA",
    website: "http://www.luxcore.com/",
    contacts: "",
    contactRole: "",
    email: "",
    phone: "",
    tags: "energy, utilities, physics, engineering, sustainability",
    tour: "",
    speaker: "",
    virtual: "",
    status: "",
    notes: "Possible energy and utilities partner for physical science, engineering, and environmental science connections.",
  },
  {
    id: "seed-21",
    organization: "Luna Innovations",
    sector: "Optics / Sensors",
    location: "Atlanta, GA",
    website: "https://lunainc.com/",
    contacts: "",
    contactRole: "",
    email: "",
    phone: "",
    tags: "fiber optics, sensors, instrumentation, materials, data analysis, physics",
    tour: "",
    speaker: "",
    virtual: "",
    status: "",
    notes: "Formerly listed as Micron Optics. Strong fit for optics, sensors, instrumentation, and measurement.",
  },
  {
    id: "seed-22",
    organization: "Next Input / Qorvo Inc",
    sector: "Software / Data",
    location: "Atlanta, GA",
    website: "https://nextinput.com/",
    contacts: "",
    contactRole: "",
    email: "",
    phone: "",
    tags: "sensors, electronics, data, software, semiconductor, engineering",
    tour: "",
    speaker: "",
    virtual: "",
    status: "",
    notes: "Possible connection for sensor technology, electronics, embedded systems, and data-driven products.",
  },
  {
    id: "seed-23",
    organization: "Rapid Precision Castings",
    sector: "Manufacturing",
    location: "Atlanta, GA",
    website: "https://rapidprecisioncastings.com/",
    contacts: "",
    contactRole: "",
    email: "",
    phone: "",
    tags: "manufacturing, casting, materials, engineering, product prototyping",
    tour: "",
    speaker: "",
    virtual: "",
    status: "",
    notes: "Manufacturing lead relevant to materials, casting, engineering design, product prototyping, and quality control.",
  },
];

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
  if (region === "Virtual friendly") return isPositive(partner.virtual) ? 4 : 0;
  if (region === "Atlanta / Georgia")
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

function subjectDescription(partner: Partner, subject: Subject) {
  const ideas = matchedIdeas(partner, subject);
  const org = partner.organization;
  const sector = inferSector(partner).toLowerCase();
  const notes = cleanText(partner.notes);

  if (ideas.length > 0) {
    return `${org} is a strong ${subject.toLowerCase()} connection because its hidden RET relevance tags and notes point to ${ideas.join(
      ", "
    )}. Teachers could use this partner to help students connect classroom ideas to real work in ${sector}.`;
  }

  if (subject === "General STEM") {
    return `${org} can support broad STEM career exploration through its work in ${sector}. ${notes
      .split(".")
      .filter(Boolean)[0]
      ?.slice(0, 120) || "Use the contact details to explore tours, talks, mentoring, or project feedback."}.`;
  }

  return `${org} may be useful for ${subject.toLowerCase()} when framed around real-world STEM careers, workplace tools, and authentic problem solving in ${sector}. Check the contact notes to decide whether a tour, speaker, virtual session, or project feedback request fits.`;
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
  const [sourceStatus, setSourceStatus] = useState("Loading live Sheet data...");
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("All regions");
  const [subject, setSubject] = useState<Subject>("General STEM");
  const [filters, setFilters] = useState({
    tour: false,
    speaker: false,
    virtual: false,
    mentor: false,
    best: true,
  });
  const [sort, setSort] = useState("Best subject match");
  const [selected, setSelected] = useState<Partner | null>(null);
  const [emailDraft, setEmailDraft] = useState("");
  const [copied, setCopied] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminCode, setAdminCode] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(SHEET_CSV_URL)
      .then((response) => {
        if (!response.ok) throw new Error("Sheet export was not available.");
        return response.text();
      })
      .then((csv) => {
        const parsed = partnersFromRows(parseCsv(csv));
        if (!cancelled && parsed.length > 0) {
          setPartners(parsed);
          setSourceStatus(`Using live Google Sheet data: ${parsed.length} partners`);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSourceStatus(
            `Previewing with a ${seedPartners.length}-partner snapshot. Publish the Sheet or provide a web app endpoint for live private data.`
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (selected) setEmailDraft(generateEmail(selected, subject, filters));
    setCopied(false);
  }, [selected, subject, filters]);

  const stats = useMemo(
    () => ({
      partners: partners.length,
      tours: partners.filter((partner) => isPositive(partner.tour)).length,
      speakers: partners.filter((partner) => isPositive(partner.speaker)).length,
      virtual: partners.filter((partner) => isPositive(partner.virtual)).length,
    }),
    [partners]
  );

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
        if (text && !searchable(partner).includes(text)) return false;
        if (region !== "All regions" && localRank === 0 && !isPositive(partner.virtual))
          return false;
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
    setSuggestions((current) => [suggestion, ...current]);
    event.currentTarget.reset();
  }

  return (
    <main>
      <section className="hero">
        <div className="hero__content">
          <div>
            <p className="eyebrow">RET Industry Partner Directory</p>
            <h1>Find local and virtual STEM partners without opening the spreadsheet.</h1>
            <p className="hero__copy">
              A teacher-facing finder for RET participants, coordinators, and school colleagues looking for tours, speakers, virtual visits, mentors, and project feedback.
            </p>
          </div>
          <div className="hero__panel" aria-label="Directory snapshot">
            <div>
              <strong>{stats.partners}</strong>
              <span>partners</span>
            </div>
            <div>
              <strong>{stats.tours}</strong>
              <span>tour leads</span>
            </div>
            <div>
              <strong>{stats.speakers}</strong>
              <span>speaker leads</span>
            </div>
            <div>
              <strong>{stats.virtual}</strong>
              <span>virtual-ready</span>
            </div>
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
            Teaching subject
            <select
              value={subject}
              onChange={(event) => setSubject(event.target.value as Subject)}
            >
              {subjects.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <div className="quick-buttons">
            <button
              className={filters.tour ? "chip chip--active" : "chip"}
              onClick={() => toggleFilter("tour")}
            >
              Find a tour
            </button>
            <button
              className={filters.speaker ? "chip chip--active" : "chip"}
              onClick={() => toggleFilter("speaker")}
            >
              Find a guest speaker
            </button>
            <button
              className={filters.virtual ? "chip chip--active" : "chip"}
              onClick={() => toggleFilter("virtual")}
            >
              Find a virtual speaker
            </button>
            <button
              className={filters.mentor ? "chip chip--active" : "chip"}
              onClick={() => toggleFilter("mentor")}
            >
              Mentor or feedback
            </button>
          </div>
        </div>
      </section>

      <section className="directory" id="directory">
        <aside className="filters" aria-label="Partner filters">
          <div>
            <p className="eyebrow">Partner Finder</p>
            <h2>Recommended matches</h2>
            <p>{sourceStatus}</p>
          </div>
          <label>
            Search partners
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, industry, city, website, topic..."
            />
          </label>
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
          <label className="check">
            <input
              type="checkbox"
              checked={filters.best}
              onChange={() => toggleFilter("best")}
            />
            Best matches for my subject
          </label>
          <div className="filter-note">
            Search uses public fields plus hidden metadata, including RET relevance tags, notes, contact history, and classroom-connection language.
          </div>
        </aside>

        <div className="results">
          <div className="results__bar">
            <div>
              <strong>{filtered.length}</strong> matches for <strong>{subject}</strong>
            </div>
            <a href="#suggest">Suggest a partner</a>
          </div>

          {filtered.map(({ partner, score }) => (
            <article className="partner-card" key={partner.id}>
              <div className="partner-card__main">
                <div>
                  <p className="sector">{inferSector(partner)}</p>
                  <h3>{partner.organization}</h3>
                  <p className="location">{partner.location || "Location not listed"}</p>
                </div>
                <div className="score" title="Subject, location, and availability match score">
                  {Math.max(score, 1)}
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
                Try turning off "best matches," clearing a quick filter, or choosing "Virtual friendly" to include farther-away partners.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="suggest" id="suggest">
        <div>
          <p className="eyebrow">Suggest a Partner</p>
          <h2>Add a lead for the coordinator list</h2>
          <p>
            Teachers can draft a suggested organization without touching the source spreadsheet. In a production version, this form can be connected to a Google Form or Apps Script endpoint.
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
          <button type="submit">Save suggestion locally</button>
        </form>
        {suggestions.length > 0 && (
          <div className="suggestions">
            <h3>Draft suggestions</h3>
            {suggestions.map((item, index) => (
              <p key={`${item.organization}-${index}`}>
                <strong>{item.organization}</strong> - {item.subject} - {item.connection}
              </p>
            ))}
          </div>
        )}
      </section>

      <section className="admin">
        <div>
          <p className="eyebrow">Coordinator View</p>
          <h2>Private/internal fields</h2>
          <p>
            This view keeps contacts and follow-up notes off the teacher cards. Use a hosted access gate for real private deployment.
          </p>
        </div>
        {!adminOpen ? (
          <div className="admin-lock">
            <input
              value={adminCode}
              onChange={(event) => setAdminCode(event.target.value)}
              placeholder="Coordinator passcode"
              type="password"
            />
            <button onClick={() => setAdminOpen(adminCode.trim().toLowerCase() === "ret")}>
              Unlock preview
            </button>
          </div>
        ) : (
          <div className="admin-table" role="region" aria-label="Internal partner details">
            <table>
              <thead>
                <tr>
                  <th>Organization</th>
                  <th>Contacts</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>RET relevance tags</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {partners.slice(0, 40).map((partner) => (
                  <tr key={`admin-${partner.id}`}>
                    <td>{partner.organization}</td>
                    <td>{partner.contacts || "Not listed"}</td>
                    <td>{partner.email || "Not listed"}</td>
                    <td>{partner.status || "Not listed"}</td>
                    <td>{partner.tags || "Not listed"}</td>
                    <td>{cleanText(partner.notes) || "Not listed"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

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
