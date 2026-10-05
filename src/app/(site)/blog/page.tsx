import type { Metadata } from "next";
import Link from "next/link";
import { PageHead, PostRow } from "@/components/blocks";
import { getPosts, getProjects } from "@/lib/content";

export const metadata: Metadata = { title: "Lab notes" };

export default async function BlogPage(props: PageProps<"/blog">) {
  const { project: filter } = await props.searchParams;
  const [posts, projects] = await Promise.all([getPosts(), getProjects()]);

  // Only offer filters for projects that actually have posts
  const counts = new Map<string, number>();
  for (const p of posts) if (p.project) counts.set(p.project, (counts.get(p.project) ?? 0) + 1);
  const filters = projects.filter((p) => counts.has(p.slug));
  const active = typeof filter === "string" && counts.has(filter) ? filter : null;

  const shown = active ? posts.filter((p) => p.project === active) : posts;
  const byYear = new Map<string, typeof posts>();
  for (const post of shown) {
    const year = (post.date ?? "").slice(0, 4);
    byYear.set(year, [...(byYear.get(year) ?? []), post]);
  }

  const chip = (selected: boolean) =>
    `label inline-flex items-center gap-2 border px-3 py-2 transition-colors ${
      selected ? "border-ink bg-ink text-paper" : "border-rule text-ink-2 hover:border-ink hover:text-ink"
    }`;

  return (
    <>
      <PageHead
        eyebrow="Research blog"
        title="Lab notes"
        intro={
          <>
            In-progress write-ups of projects, methods and conference appearances — and, when we remember, lab
            meetings.
          </>
        }
      >
        <nav aria-label="Filter by project" className="mt-10 flex flex-wrap gap-2">
          <Link href="/blog" scroll={false} className={chip(!active)} aria-current={!active ? "true" : undefined}>
            All <span className="opacity-60">{posts.length}</span>
          </Link>
          {filters.map((p) => (
            <Link
              key={p.slug}
              href={`/blog?project=${p.slug}`}
              scroll={false}
              className={chip(active === p.slug)}
              aria-current={active === p.slug ? "true" : undefined}
            >
              {p.shortTitle} <span className="opacity-60">{counts.get(p.slug)}</span>
            </Link>
          ))}
        </nav>
      </PageHead>

      <div className="gutter py-12 lg:py-20">
        {[...byYear].map(([year, items]) => (
          <section key={year} className="grid gap-4 pb-12 lg:grid-cols-12 lg:gap-6 lg:pb-16">
            <h2 className="display text-[clamp(1.6rem,2.8vw,2.45rem)] leading-none text-ink-3 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:col-span-2 lg:self-start">
              {year}
            </h2>
            <ul className="border-b border-rule lg:col-span-10">
              {items.map((post) => (
                <PostRow key={post.slug} post={post} projects={projects} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
