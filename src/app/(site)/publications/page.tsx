import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IndexList, PageHead } from "@/components/blocks";
import {
  kindLabels,
  PublicationRow,
  YearStrip,
} from "@/components/publications";
import { getPage, getPublications } from "@/lib/content";

export const metadata: Metadata = {
  title: "Publications",
  description:
    "Articles, chapters and digital publications by members of the Travelers’ Lab.",
  alternates: { canonical: "/publications" },
};

export default async function PublicationsPage() {
  const [page, publications] = await Promise.all([
    getPage("publications"),
    getPublications(),
  ]);
  if (!page) notFound();
  const kinds = [...new Set(publications.map((p) => p.kind))];

  return (
    <>
      <PageHead
        title={page.title}
        meta={`${publications.length} works`}
        statement={page.intro || undefined}
        aside={
          <IndexList
            label="By type"
            rows={kinds.map((k) => ({
              label: kindLabels[k],
              count: publications.filter((p) => p.kind === k).length,
              href: `#${publications.find((p) => p.kind === k)!.slug}`,
            }))}
          />
        }
      >
        <div className="mt-10 max-w-md lg:mt-14">
          <YearStrip publications={publications} />
        </div>
      </PageHead>
      <ol className="gutter pb-10 [&>li:first-child]:border-t-0">
        {publications.map((p, i) => (
          <PublicationRow key={p.slug} publication={p} index={i} />
        ))}
      </ol>
    </>
  );
}
