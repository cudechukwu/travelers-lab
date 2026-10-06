import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHead } from "@/components/blocks";
import { kindLabels, PublicationRow } from "@/components/publications";
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
        eyebrow="Publications"
        title={page.title}
        intro={page.intro || undefined}
      >
        <p className="label mt-10 text-ink-3">
          {publications.length} works ·{" "}
          {kinds.map((k) => kindLabels[k]).join(" · ")}
        </p>
      </PageHead>
      <ol className="gutter pb-10 [&>li:first-child]:border-t-0">
        {publications.map((p, i) => (
          <PublicationRow key={p.slug} publication={p} index={i} />
        ))}
      </ol>
    </>
  );
}
