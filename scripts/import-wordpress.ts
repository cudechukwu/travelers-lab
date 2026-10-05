/**
 * One-off importer: pulls posts, project pages and people from the old
 * WordPress site's public REST API into Keystatic content files.
 *
 *   npm run import:wp
 *
 * Safe to re-run before launch — it overwrites imported entries and only
 * downloads media it doesn't already have.
 */
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import TurndownService from "turndown";
import { parse, type HTMLElement } from "node-html-parser";
import YAML from "yaml";

const ORIGIN = "https://travelerslab.research.wesleyan.edu";
const API = `${ORIGIN}/wp-json/wp/v2`;
const ROOT = path.resolve(import.meta.dirname, "..");

type WPItem = {
  id: number;
  slug: string;
  date: string;
  link: string;
  author: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
};

// ---------------------------------------------------------------------------
// Editorial metadata the old site never stored in a structured way.

type ProjectMeta = {
  slug: string;
  legacy: string;
  title: string;
  shortTitle: string;
  status: "active" | "archived";
  order: number;
  summary: string;
  period: string;
  region: string;
  startYear: number;
  endYear: number;
  leads: string[];
  team?: string[];
  methods: string[];
  links?: { label: string; url: string }[];
};

const PROJECTS: ProjectMeta[] = [
  {
    slug: "cder",
    legacy: "/cder/",
    title: "C-DER: Constantinopolitana, Database of East Rome",
    shortTitle: "C-DER",
    status: "active",
    order: 1,
    summary:
      "A relational database and interactive map of every object known to have existed in Byzantine Constantinople.",
    period: "ca. 250–1453",
    region: "Constantinople",
    startYear: 250,
    endYear: 1453,
    leads: ["Jesse W. Torgerson", "A.L. McMichael"],
    methods: ["Nodegoat", "Relational databases", "Spatio-temporal mapping"],
    links: [{ label: "Nodegoat platform", url: "https://nodegoat.net" }],
  },
  {
    slug: "comparing-chronicles",
    legacy: "/early-medieval-chronicles/",
    title: "Comparing Early Medieval Chronicles",
    shortTitle: "Comparing Chronicles",
    status: "active",
    order: 2,
    summary:
      "Treating shared events, rather than texts, as the unit of analysis to trace how information moved between Carolingian chronicles.",
    period: "9th century",
    region: "Carolingian Europe",
    startYear: 714,
    endYear: 901,
    leads: ["Jesse W. Torgerson"],
    team: [
      "Diana Q. Tran — Project Manager",
      "Tess Usher — Research Assistant",
      "Chika Simon — Research Assistant",
      "Daniel Feldman — Project Creator",
      "Arla Hoxha — Project Creator",
    ],
    methods: ["Nodegoat", "Knowledge graphs", "Python"],
  },
  {
    slug: "couriers-of-aragon",
    legacy: "/projects/couriers/",
    title: "Couriers in the Crown of Aragon",
    shortTitle: "Couriers of Aragon",
    status: "active",
    order: 3,
    summary:
      "How royal, episcopal and city governments moved and withheld information through networks of runners and ambassadors.",
    period: "14th century",
    region: "Crown of Aragon",
    startYear: 1300,
    endYear: 1420,
    leads: ["Adam Franklin-Lyons"],
    methods: ["GIS", "Network analysis"],
  },
  {
    slug: "episcopal-travel",
    legacy: "/visitation/",
    title: "Episcopal Travel in England",
    shortTitle: "Episcopal Travel",
    status: "active",
    order: 4,
    summary: "Reconstructing the itineraries of medieval English bishops from their registers and acta.",
    period: "13th–15th centuries",
    region: "England",
    startYear: 1200,
    endYear: 1500,
    leads: ["David Gary Shaw"],
    team: [
      "Stephanie Ling",
      "Hanna Korevaar",
      "Elizaveta Kravchenko",
      "Zachary Kaufman",
      "Hyo Jung Jeung",
      "Jeesue Lee",
    ],
    methods: ["GIS", "Itinerary data"],
  },
  {
    slug: "constantinople-as-palimpsest",
    legacy: "/constantinople/",
    title: "Constantinople as Palimpsest",
    shortTitle: "Constantinople as Palimpsest",
    status: "archived",
    order: 10,
    summary: "A student-built, place-based encyclopedia of Byzantine Constantinople — the forerunner of C-DER.",
    period: "Byzantine era",
    region: "Constantinople",
    startYear: 330,
    endYear: 1453,
    leads: ["Jesse W. Torgerson"],
    methods: ["ArcGIS Online", "StoryMaps"],
  },
  {
    slug: "theophanes",
    legacy: "/theophanes/",
    title: "Narrative and Geography in the Chronicle of Theophanes",
    shortTitle: "Theophanes Geography",
    status: "archived",
    order: 11,
    summary: "Mapping every place named in a ninth-century Byzantine chronicle to rethink its historical geography.",
    period: "AD 284–813",
    region: "Eastern Mediterranean",
    startYear: 284,
    endYear: 813,
    leads: ["Jesse W. Torgerson"],
    methods: ["Recogito", "GIS", "GitHub"],
  },
  {
    slug: "datini-letters",
    legacy: "/letters-of-the-datini-company/",
    title: "Letters of the Datini Company",
    shortTitle: "Datini Letters",
    status: "archived",
    order: 12,
    summary:
      "The correspondence network of a fourteenth-century Tuscan trading company, from Florence to Barcelona and beyond.",
    period: "1335–1410",
    region: "Mediterranean",
    startYear: 1335,
    endYear: 1410,
    leads: ["Adam Franklin-Lyons"],
    methods: ["Network analysis", "Sonification"],
  },
  {
    slug: "caesarius",
    legacy: "/projects/caesarius-of-heisterbach-and-network-analysis/",
    title: "Caesarius of Heisterbach and Network Analysis",
    shortTitle: "Caesarius",
    status: "archived",
    order: 13,
    summary: "Reconstructing a Cistercian monk’s social network from the sources of his 800 miracle stories.",
    period: "ca. 1180–1240",
    region: "Rhineland",
    startYear: 1180,
    endYear: 1240,
    leads: ["Helen Birkett"],
    methods: ["Network analysis"],
  },
  {
    slug: "friars-settlements",
    legacy: "/projects/friars-settlement-project/",
    title: "Friars’ Settlement Project",
    shortTitle: "Friars’ Settlements",
    status: "archived",
    order: 14,
    summary: "Mapping where the orders of friars settled across England, and what their networks of houses reveal.",
    period: "13th century onward",
    region: "England",
    startYear: 1220,
    endYear: 1540,
    leads: ["David Gary Shaw"],
    methods: ["GIS"],
  },
  {
    slug: "itineraries",
    legacy: "/the-itineraries-project/",
    title: "The Itineraries Project",
    shortTitle: "Itineraries",
    status: "archived",
    order: 15,
    summary: "A shared, open dataset of royal and episcopal itineraries from across medieval Europe.",
    period: "Later Middle Ages",
    region: "Europe",
    startYear: 1200,
    endYear: 1500,
    leads: ["Adam Franklin-Lyons", "David Gary Shaw"],
    methods: ["Open data", "GitHub"],
  },
  {
    slug: "accommodation-in-england",
    legacy: "/mapping-accommodation-in-medieval-england/",
    title: "Mapping Accommodation in Medieval England",
    shortTitle: "Accommodation in England",
    status: "archived",
    order: 16,
    summary: "Charting how monasteries, hospitals and, finally, inns came to shelter travellers.",
    period: "ca. 1000–1500",
    region: "England",
    startYear: 1000,
    endYear: 1500,
    leads: ["David Gary Shaw"],
    methods: ["GIS"],
  },
  {
    slug: "law-courts",
    legacy: "/projects/law-courts-and-their-mobility-england/",
    title: "Law Courts and their Mobility",
    shortTitle: "Law Courts",
    status: "archived",
    order: 17,
    summary: "How England’s itinerant and central courts generated — and demanded — mobility.",
    period: "Long 13th century",
    region: "England",
    startYear: 1200,
    endYear: 1350,
    leads: ["David Gary Shaw"],
    methods: ["GIS"],
  },
  {
    slug: "the-mobile-word",
    legacy: "/projects/the-mobile-word-letters-and-networks/",
    title: "The Mobile Word: Letters and Networks",
    shortTitle: "The Mobile Word",
    status: "archived",
    order: 18,
    summary: "Networks, geography and the expected speed of communication in surviving medieval correspondence.",
    period: "Later Middle Ages",
    region: "England & Italy",
    startYear: 1250,
    endYear: 1500,
    leads: ["David Gary Shaw"],
    methods: ["Network analysis"],
  },
  {
    slug: "early-english-highways",
    legacy: "/projects/early-english-highways/",
    title: "Early English Highways",
    shortTitle: "English Highways",
    status: "archived",
    order: 19,
    summary: "Usable maps and shapefiles of the roads described in early English sources.",
    period: "16th century",
    region: "England",
    startYear: 1540,
    endYear: 1600,
    leads: ["David Gary Shaw"],
    methods: ["GIS", "Shapefiles"],
  },
  {
    slug: "lost-and-stolen-objects",
    legacy: "/lost-and-stolen-objects-in-eighteenth-century-london/",
    title: "Lost and Stolen Objects in Eighteenth-Century London",
    shortTitle: "Lost & Stolen Objects",
    status: "archived",
    order: 20,
    summary: "Watches, snuffboxes and lottery tickets: the pocket-sized objects that went missing in early modern London.",
    period: "18th century",
    region: "London",
    startYear: 1700,
    endYear: 1800,
    leads: ["Stephanie Koscak"],
    methods: ["Newspaper advertisements"],
  },
];

// Which project a post belongs to, by keywords in its title/slug.
const POST_PROJECT_RULES: [RegExp, string][] = [
  [/c-?der|constantinopolitana|byzantine seals/i, "cder"],
  [/chronicle(s)? (project|methodology)|fulda|event type|imc leeds|map a chronicle|chronicles/i, "comparing-chronicles"],
  [/theophanes|chronograph|recogito|geography-roman|rewriting/i, "theophanes"],
  [/palimpsest|constantinople/i, "constantinople-as-palimpsest"],
  [/datini/i, "datini-letters"],
  [/caesarius|cistercian|institutional structures/i, "caesarius"],
  [/anti-jewish|couriers|valencia/i, "couriers-of-aragon"],
  [/itinerar|github-data-set|new-github/i, "itineraries"],
];

const USERNAMES: Record<string, string> = {
  adamfl: "Adam Franklin-Lyons",
  gshaw: "David Gary Shaw",
  jtorgerson: "Jesse W. Torgerson",
  hbirkett: "Helen Birkett",
  poleinikov: "Pavel Oleinikov",
  okeyes: "Olivia Keyes",
  vyordanova: "Vasilia Yordanova",
};

// Fixes for roles the faculty page formats inconsistently, and dead profile links
const PEOPLE_OVERRIDES: Record<string, Partial<Person>> = {
  "jesse-w-torgerson": {
    // from the Wesleyan directory, October 2026
    role: "Director of Digital Humanities; Associate Professor of Letters, History & Medieval Studies",
    institution: "Wesleyan University",
    email: "jtorgerson@wesleyan.edu",
    url: "https://www.wesleyan.edu/about/directory/profile.html?id=jtorgerson",
    order: 0, // listed first among faculty
  },
  "chukwudi-udechukwu": { group: "alumni" },
  "pavel-oleinikov": { role: "Associate Director, Quantitative Analysis Center", institution: "Wesleyan University" },
  "silke-schwandt": { role: "Professor of Digital History", institution: "Bielefeld University" },
  // Marlboro College closed in 2020; not listed as a contact on Get involved
  "adam-franklin-lyons": { url: undefined, hideFromContact: true },
};

// ---------------------------------------------------------------------------
// Helpers

async function getAll(type: string): Promise<WPItem[]> {
  const out: WPItem[] = [];
  for (let page = 1; ; page++) {
    const res = await fetch(`${API}/${type}?per_page=100&page=${page}`, {
      headers: { "User-Agent": "Mozilla/5.0 (travelers-lab importer)" },
    });
    if (!res.ok) break;
    const batch = (await res.json()) as WPItem[];
    out.push(...batch);
    if (batch.length < 100) break;
  }
  return out;
}

const decode = (s: string) => parse(`<p>${s}</p>`).text.replace(/\s+/g, " ").trim();

const legacyPath = (url: string) => new URL(url).pathname;

/** Largest candidate from srcset, else src. */
function bestImageUrl(img: HTMLElement): string | undefined {
  const srcset = img.getAttribute("srcset");
  if (srcset) {
    // WordPress doesn't encode spaces in filenames, so split on the width descriptor
    const best = srcset
      .split(/,\s*(?=https?:)/)
      .map((c) => c.trim().match(/^(.*\S)\s+(\d+)w$/))
      .filter((m): m is RegExpMatchArray => !!m)
      .map(([, url, w]) => ({ url, w: parseInt(w, 10) }))
      .sort((a, b) => b.w - a.w)[0];
    if (best?.url) return best.url;
  }
  return img.getAttribute("src") ?? undefined;
}

// absolute local path -> remote url (keyed by destination: one image can appear in several posts)
const downloads = new Map<string, string>();

/** Queue a remote file for download and return its public URL. */
function localise(remote: string, folder: string): string {
  const url = new URL(remote, ORIGIN);
  const file = decodeURIComponent(path.basename(url.pathname)).replace(/[^\w.\-]+/g, "-");
  const rel = `media/${folder}/${file}`;
  downloads.set(path.join(ROOT, "public", rel), url.href);
  return `/${rel}`;
}

async function runDownloads() {
  const queue = [...downloads].filter(([dest]) => !existsSync(dest));
  let failed = 0;
  const worker = async () => {
    for (let item = queue.shift(); item; item = queue.shift()) {
      const [dest, url] = item;
      try {
        const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
        if (!res.ok) throw new Error(String(res.status));
        await mkdir(path.dirname(dest), { recursive: true });
        await writeFile(dest, Buffer.from(await res.arrayBuffer()));
      } catch (e) {
        failed++;
        console.warn(`  ! media ${url} (${(e as Error).message})`);
      }
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
  console.log(`media: ${downloads.size} referenced, ${failed} failed`);
}

async function writeEntry(file: string, data: Record<string, unknown>, body?: string) {
  const clean = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined && v !== "" && !(Array.isArray(v) && !v.length)),
  );
  const yaml = YAML.stringify(clean, { lineWidth: 0 }).trimEnd();
  const out = body === undefined ? `${yaml}\n` : `---\n${yaml}\n---\n\n${body.trim()}\n`;
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, out);
}

// ---------------------------------------------------------------------------
// HTML -> Markdoc

const linkMap = new Map<string, string>(); // old pathname -> new path

function rewriteHref(href: string): string {
  try {
    const url = new URL(href, ORIGIN);
    // e.g. "https://doi.org/10.34055/osf.io/ehmkx." — a trailing period breaks the link
    if (url.host !== new URL(ORIGIN).host) return href.replace(/\.$/, "");
    if (url.pathname.startsWith("/files/")) {
      return /\.(pdf|docx?|pptx?|xlsx?|csv|zip)$/i.test(url.pathname) ? localise(url.href, "files") : href;
    }
    const mapped = linkMap.get(url.pathname) ?? linkMap.get(`${url.pathname.replace(/\/?$/, "/")}`);
    return mapped ? mapped + url.hash : href;
  } catch {
    return href;
  }
}

function makeConverter(mediaFolder: string) {
  const td = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "_",
  });
  td.remove(["script", "style", "noscript", "iframe", "form", "button"]);

  const imageMd = (img: HTMLElement | null, caption?: string) => {
    if (!img) return "";
    const remote = bestImageUrl(img);
    if (!remote) return "";
    const src = localise(remote, mediaFolder);
    const rawAlt = img.getAttribute("alt") ?? "";
    // WordPress often fills alt with the file URL or name, which helps nobody
    const alt = /^https?:|\.(png|jpe?g|gif|webp)$/i.test(rawAlt) ? "" : rawAlt.replace(/[\[\]]/g, "");
    const title = caption ? ` "${caption.replace(/"/g, "'")}"` : "";
    return `\n\n![${alt}](${src}${title})\n\n`;
  };
  // turndown nodes are DOM nodes; re-parse their HTML to use one API everywhere
  const asEl = (node: TurndownService.Node) => parse((node as unknown as { outerHTML: string }).outerHTML).firstChild as HTMLElement;

  td.addRule("figure", {
    filter: "figure",
    replacement: (_c, node) => {
      const el = asEl(node);
      const caption = el.querySelector("figcaption")?.text.trim();
      return imageMd(el.querySelector("img"), caption);
    },
  });
  td.addRule("img", { filter: "img", replacement: (_c, node) => imageMd(asEl(node)) });
  td.addRule("imageLink", {
    // <a href="big.jpg"><img></a> -> just the image
    filter: (node) =>
      node.nodeName === "A" &&
      !!node.querySelector("img") &&
      (node.textContent ?? "").trim() === "",
    replacement: (_c, node) => imageMd(asEl(node).querySelector("img")),
  });
  td.addRule("links", {
    filter: (node) => node.nodeName === "A" && !!node.getAttribute("href"),
    replacement: (content, node) => {
      const text = content.trim();
      if (!text) return "";
      // turndown gives later rules priority, so image-only links land here too
      if (text.startsWith("![") && !(node.textContent ?? "").trim()) return content;
      return `[${text}](${rewriteHref((node as HTMLAnchorElement).getAttribute("href")!)})`;
    },
  });
  td.addRule("demoteH1", {
    filter: ["h1"],
    replacement: (content) => `\n\n## ${content.trim()}\n\n`,
  });
  td.addRule("flattenSmallHeadings", {
    filter: ["h5", "h6"],
    replacement: (content) => `\n\n#### ${content.trim()}\n\n`,
  });
  td.addRule("underlineHeadings", {
    // The old site used <p><u>Heading</u></p> instead of real headings
    filter: (node) => {
      if (node.nodeName !== "P") return false;
      const text = (node.textContent ?? "").trim();
      if (!text || text.length > 90) return false;
      const u = node.querySelector('span[style*="underline"], u');
      return !!u && (u.textContent ?? "").trim().replace(/[?:]$/, "") === text.replace(/[?:]$/, "");
    },
    replacement: (_c, node) => `\n\n### ${(node.textContent ?? "").trim()}\n\n`,
  });
  td.addRule("sup", { filter: ["sup", "sub"], replacement: (c) => c });
  td.addRule("table", {
    filter: "table",
    replacement: (_c, node) => {
      const el = asEl(node);
      const rows = el.querySelectorAll("tr");
      if (!rows.length) return "";
      const cell = (c: HTMLElement) => td.turndown(c.innerHTML).replace(/\n+/g, " ").trim() || " ";
      const lines = rows.map((r) => r.querySelectorAll("th,td").map((c) => `* ${cell(c)}`).join("\n"));
      return `\n\n{% table %}\n${lines.join("\n---\n")}\n{% /table %}\n\n`;
    },
  });

  return (html: string) =>
    td
      .turndown(html)
      .replace(/ /g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/^\s*(—\s*){2,}\s*$/gm, "")
      .replace(/^(#{2,4}) (?:\*\*|__)(.+?)(?:\*\*|__)\s*$/gm, "$1 $2")
      .trim();
}

function excerptFrom(md: string, wpExcerpt: string): string {
  const fromWp = decode(wpExcerpt)
    .replace(/\s*(\[?(…|\.\.\.)\]?)?\s*Continue\b[\s\S]*$/, "")
    .trim();
  const firstPara =
    md
      .split(/\n\n/)
      .map((p) => p.trim())
      .find((p) => p.length > 80 && !p.startsWith("#") && !p.startsWith("!") && !p.startsWith("{%")) ?? "";
  const text = (fromWp.length > 60 ? fromWp : firstPara)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_\\#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= 220) return text;
  return text.slice(0, 220).replace(/\s+\S*$/, "") + "…";
}

// ---------------------------------------------------------------------------
// People (parsed from the faculty and students pages)

type Person = {
  slug: string;
  name: string;
  group: "faculty" | "network" | "student" | "alumni";
  role?: string;
  institution?: string;
  classYear?: string;
  photo?: string;
  url?: string;
  email?: string;
  hideFromContact?: boolean;
  bio?: string;
  order: number;
};

const slugify = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function splitRole(raw: string): { role?: string; institution?: string } {
  const clean = raw.replace(/\s+/g, " ").trim();
  const m = clean.match(/^(.*?)(?:,| at )\s*((?:the )?[^,]*(?:University|College|Center|Institute)[^,]*)$/i);
  if (m) return { role: m[1].trim(), institution: m[2].replace(/^the /i, "").trim() };
  return { role: clean };
}

function parseFaculty(html: string): Person[] {
  const root = parse(html);
  const people: Person[] = [];
  let group: Person["group"] = "faculty";
  for (const block of root.childNodes as HTMLElement[]) {
    // normalise non-breaking spaces so the name is found where it first appears
    const text = (block.text ?? "").replace(/\s+/g, " ").trim();
    if (/^network members/i.test(text)) {
      group = "network";
      continue;
    }
    if (block.tagName !== "P") continue;
    const strong = block.querySelector("strong");
    if (!strong) continue;
    const name = strong.text.replace(/\s+/g, " ").trim();
    if (!name || name.length > 40 || /projects/i.test(name)) continue;
    const img = block.querySelector("img");
    const nameLink = strong.querySelectorAll("a").find((a) => a.text.trim().length > 1);
    const after = text.slice(text.indexOf(name) + name.length);
    // allow one level of nested parentheses, e.g. "(Associate Director, QAC (QAC), Wesleyan)"
    const roleMatch = after.match(/^\s*\(((?:[^()]|\([^()]*\))+)\)/);
    const bio = (roleMatch ? after.slice(roleMatch[0].length) : after)
      .replace(/^[\s—–-]+/, "")
      .replace(/\s+/g, " ")
      .trim();
    const slug = slugify(name);
    const href = nameLink?.getAttribute("href");
    people.push({
      slug,
      name,
      group,
      ...(roleMatch ? splitRole(roleMatch[1].replace(/\(\s*([^)]*?)\s*\)/g, "($1)")) : {}),
      photo: img ? localise(bestImageUrl(img)!, "people") : undefined,
      url: href && !href.includes("/files/") ? href : undefined,
      bio: bio || undefined,
      order: people.length + 1,
    });
  }
  return people;
}

function parseStudents(html: string): Person[] {
  const root = parse(html);
  return root
    .querySelectorAll("p")
    .filter((p) => /^Name:/i.test(p.text.trim()))
    .map((p, i) => {
      const lines = p.innerHTML.split(/<br\s*\/?>/i).map((l) => decode(l));
      const field = (k: string) => lines.find((l) => l.toLowerCase().startsWith(k))?.split(":").slice(1).join(":").trim();
      const name = field("name")!;
      const bio = lines.filter((l) => !/^(name|year|area of study):/i.test(l)).join(" ").trim();
      return {
        slug: slugify(name),
        name,
        group: "student" as const,
        role: field("area of study"),
        institution: "Wesleyan University",
        classYear: field("year"),
        bio: bio || undefined,
        order: 100 + i,
      };
    });
}

// ---------------------------------------------------------------------------

async function main() {
  console.log("fetching WordPress content…");
  const [posts, pages, users] = await Promise.all([
    getAll("posts"),
    getAll("pages"),
    fetch(`${API}/users?per_page=100`).then((r) => r.json() as Promise<{ id: number; slug: string; name: string }[]>),
  ]);
  const userName = new Map(users.map((u) => [u.id, USERNAMES[u.slug] ?? (u.name.includes(" ") ? u.name : "")]));
  const pageBySlug = new Map(pages.map((p) => [p.slug, p]));

  // Old → new URL map, used for rewriting links and for redirects
  for (const p of posts) linkMap.set(legacyPath(p.link), `/blog/${p.slug}`);
  for (const proj of PROJECTS) linkMap.set(proj.legacy, `/research/${proj.slug}`);
  const pageRoutes: Record<string, string> = {
    "/": "/",
    "/projects/": "/research",
    "/archive/": "/research#archive",
    "/research-blog-2/": "/blog",
    "/research-blog/": "/blog",
    "/category/travelers-blog/": "/blog",
    "/people/": "/people",
    "/faculty/": "/people",
    "/students/": "/people#students",
    "/alumni/": "/people#alumni",
    "/past-students/": "/people#alumni",
    "/publications-2/": "/publications",
    "/courses/": "/teaching",
    "/digital-history/": "/teaching#digital-history",
    "/acceleration-of-europe/": "/teaching#acceleration-of-europe",
    "/about/": "/about",
    "/contact/": "/get-involved",
  };
  for (const [from, to] of Object.entries(pageRoutes)) linkMap.set(from, to);

  // Bylines: the hand-maintained blog index has the real authors
  const bylines = new Map<string, string[]>();
  const index = pageBySlug.get("research-blog-2");
  if (index) {
    for (const a of parse(index.content.rendered).querySelectorAll("a")) {
      const href = a.getAttribute("href");
      const tail = (a.nextSibling?.text ?? "").split("\n")[0];
      const by = tail.match(/^\s*,?\s*by\s+(.+?)\s*$/i)?.[1];
      if (href && by) {
        bylines.set(
          legacyPath(href),
          by
            .split(/,\s*(?:and\s+)?|\s+and\s+/)
            .map((s) => s.trim().replace(/^Adam Franklin Lyons$/, "Adam Franklin-Lyons"))
            .filter(Boolean),
        );
      }
    }
  }

  // ---- posts
  const seenTitles = new Map<string, string>();
  let written = 0;
  for (const p of posts) {
    const title = decode(p.title.rendered);
    if (!title || /^hello world!?$/i.test(title)) {
      console.log(`  skip post ${p.slug} (“${title}”)`);
      continue;
    }
    if (seenTitles.has(title.toLowerCase())) {
      console.log(`  skip duplicate “${title}” (${p.slug}, keeping ${seenTitles.get(title.toLowerCase())})`);
      linkMap.set(legacyPath(p.link), `/blog/${seenTitles.get(title.toLowerCase())}`);
      continue;
    }
    seenTitles.set(title.toLowerCase(), p.slug);
    let body = makeConverter(`posts/${p.slug}`)(p.content.rendered);
    // A leading "By Name" line is the real author (posts were often uploaded by someone else)
    const byLine = body.match(/^[_*]*By ([A-Z][^\n_*]{2,60})[_*]*\s*\n/);
    if (byLine) body = body.slice(byLine[0].length).trim();
    const authors = byLine
      ? [byLine[1].trim()]
      : (bylines.get(legacyPath(p.link)) ?? [userName.get(p.author)].filter((a): a is string => !!a));
    const project = POST_PROJECT_RULES.find(([re]) => re.test(`${title} ${p.slug}`))?.[1];
    await writeEntry(
      path.join(ROOT, "content/posts", `${p.slug}.mdoc`),
      {
        title,
        date: p.date.slice(0, 10),
        authors,
        project,
        excerpt: excerptFrom(body, p.excerpt.rendered),
        legacyPath: legacyPath(p.link),
      },
      body,
    );
    written++;
  }
  console.log(`posts: ${written} written`);

  // ---- projects
  for (const meta of PROJECTS) {
    const page = pages.find((pg) => legacyPath(pg.link) === meta.legacy);
    if (!page) {
      console.warn(`  ! no page for project ${meta.slug} (${meta.legacy})`);
      continue;
    }
    const { slug, legacy, ...rest } = meta;
    await writeEntry(
      path.join(ROOT, "content/projects", `${slug}.mdoc`),
      { ...rest, legacyPath: legacy },
      makeConverter(`projects/${slug}`)(page.content.rendered),
    );
  }
  console.log(`projects: ${PROJECTS.length} written`);

  // ---- standalone pages
  const PAGES: { slug: string; from: string; title: string; intro?: string }[] = [
    {
      slug: "about",
      from: "about",
      title: "About the lab",
      intro: "An open research group studying movement, travel and communication before the age of industrial travel.",
    },
    { slug: "publications", from: "publications-2", title: "Publications" },
    { slug: "alumni", from: "alumni", title: "Lab alumni" },
    { slug: "courses", from: "courses", title: "Courses and pedagogy" },
    { slug: "digital-history", from: "digital-history", title: "Digital History" },
    {
      slug: "acceleration-of-europe",
      from: "acceleration-of-europe",
      title: "The Acceleration of Europe: Mobility and Communication, 1000–1700",
    },
  ];
  for (const pg of PAGES) {
    const page = pageBySlug.get(pg.from);
    if (!page) continue;
    await writeEntry(
      path.join(ROOT, "content/pages", `${pg.slug}.mdoc`),
      { title: pg.title, intro: pg.intro, legacyPath: legacyPath(page.link) },
      // the page title is rendered separately, so drop a leading heading
      makeConverter(`pages/${pg.slug}`)(page.content.rendered).replace(/^#{2,4} .*\n+/, ""),
    );
  }
  console.log(`pages: ${PAGES.length} written`);

  // ---- people
  const people = [
    ...parseFaculty(pageBySlug.get("faculty")?.content.rendered ?? ""),
    ...parseStudents(pageBySlug.get("students")?.content.rendered ?? ""),
  ];
  for (const { slug, ...person } of people.map((p) => ({ ...p, ...PEOPLE_OVERRIDES[p.slug] }))) {
    await writeEntry(path.join(ROOT, "content/people", `${slug}.yaml`), person);
  }
  console.log(`people: ${people.length} written (${people.map((p) => p.name).join(", ")})`);

  // ---- redirects
  const redirects = [...linkMap]
    .filter(([from, to]) => from !== "/" && from !== to)
    .map(([source, destination]) => ({ source, destination }));
  await writeFile(path.join(ROOT, "content/redirects.json"), JSON.stringify(redirects, null, 2) + "\n");
  console.log(`redirects: ${redirects.length}`);

  await runDownloads();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
