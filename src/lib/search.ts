import "server-only";
import type { Node } from "@markdoc/markdoc";
import {
  getPage,
  getPeople,
  getPosts,
  getProjects,
  getPublications,
  isCurrentStudent,
} from "./content";

export type SearchKind = "Project" | "Publication" | "Person" | "Blog" | "Page";

/** One entry in the site search. `text` is the full plain text that gets searched; `meta` is shown under the title. */
export type SearchDoc = {
  id: string;
  kind: SearchKind;
  title: string;
  url: string;
  meta: string;
  keywords: string;
  text: string;
};

/** Plain text of a Markdoc body, paragraphs separated by spaces. */
function plain(node: Node): string {
  const out: string[] = [];
  for (const n of node.walk()) {
    if (n.type === "text" || n.type === "code")
      out.push(String(n.attributes.content ?? ""));
    else if (n.type === "softbreak" || n.type === "hardbreak") out.push(" ");
    else if (
      n.type === "paragraph" ||
      n.type === "heading" ||
      n.type === "item"
    )
      out.push(" ");
  }
  return out.join("").replace(/\s+/g, " ").trim();
}

const year = (iso: string | null | undefined) => (iso ?? "").slice(0, 4);

/** Everything a visitor might look for, built from the content files when the site is built. */
export async function buildSearchIndex(): Promise<SearchDoc[]> {
  const [projects, posts, publications, people] = await Promise.all([
    getProjects(),
    getPosts(),
    getPublications(),
    getPeople(),
  ]);
  const projectName = new Map(
    projects.map((p) => [p.slug, p.shortTitle || p.title]),
  );
  const docs: SearchDoc[] = [];

  for (const p of projects) {
    docs.push({
      id: `project:${p.slug}`,
      kind: "Project",
      title: p.title,
      url: `/research/${p.slug}`,
      meta: [p.period, p.region, p.status === "active" ? "Active" : "Archived"]
        .filter(Boolean)
        .join(" · "),
      keywords: [p.shortTitle, p.summary, ...p.leads, ...p.team, ...p.methods]
        .filter(Boolean)
        .join(" "),
      text: plain((await p.content()).node),
    });
  }

  for (const p of posts) {
    docs.push({
      id: `post:${p.slug}`,
      kind: "Blog",
      title: p.title,
      url: `/blog/${p.slug}`,
      meta: [
        year(p.date),
        p.authors.join(", "),
        p.project ? projectName.get(p.project) : null,
      ]
        .filter(Boolean)
        .join(" · "),
      keywords: [
        p.excerpt,
        ...p.authors,
        ...p.tags,
        p.project ? projectName.get(p.project) : "",
      ]
        .filter(Boolean)
        .join(" "),
      text: plain((await p.content()).node),
    });
  }

  for (const p of publications) {
    docs.push({
      id: `publication:${p.slug}`,
      kind: "Publication",
      title: p.title,
      url: `/publications#${p.slug}`,
      meta: [year(p.date), p.authors.join(", ")].filter(Boolean).join(" · "),
      keywords: [...p.authors, p.venue, p.doi].filter(Boolean).join(" "),
      text: plain((await p.abstract()).node),
    });
  }

  for (const p of people) {
    const group =
      p.group === "faculty"
        ? "Faculty"
        : p.group === "network"
          ? "Network member"
          : isCurrentStudent(p)
            ? "Student"
            : "Alumni";
    docs.push({
      id: `person:${p.slug}`,
      kind: "Person",
      title: p.name,
      url: `/people#${p.slug}`,
      meta: [
        group,
        p.role,
        p.institution,
        p.classYear ? `Class of ${p.classYear}` : null,
      ]
        .filter(Boolean)
        .join(" · "),
      keywords: [p.role, p.institution].filter(Boolean).join(" "),
      text: p.bio ?? "",
    });
  }

  // Pages with their own text
  const pages: { slug: string; title: string; url: string }[] = [
    { slug: "about", title: "About the lab", url: "/about" },
    { slug: "courses", title: "Teaching", url: "/teaching" },
    {
      slug: "digital-history",
      title: "Digital History",
      url: "/teaching#digital-history",
    },
    {
      slug: "acceleration-of-europe",
      title: "The Acceleration of Europe",
      url: "/teaching#acceleration-of-europe",
    },
    { slug: "alumni", title: "Earlier lab alumni", url: "/people#alumni" },
  ];
  for (const pg of pages) {
    const page = await getPage(pg.slug);
    if (!page) continue;
    docs.push({
      id: `page:${pg.slug}`,
      kind: "Page",
      title: pg.title,
      url: pg.url,
      meta:
        pg.slug === "alumni"
          ? "People"
          : pg.url.startsWith("/teaching")
            ? "Teaching"
            : "About",
      keywords: (page.intro ?? "").replace(/\*/g, ""),
      text: plain((await page.content()).node),
    });
  }

  return docs;
}
