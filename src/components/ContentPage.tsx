import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { PageHead } from "./blocks";
import { Prose } from "./Prose";
import { getPage } from "@/lib/content";

/** A page whose body is edited in Keystatic under "Pages". */
export async function ContentPage({
  slug,
  title,
  meta,
  aside,
}: {
  slug: string;
  title: string;
  meta?: ReactNode;
  aside?: ReactNode;
}) {
  const page = await getPage(slug);
  if (!page) notFound();
  const { node } = await page.content();
  return (
    <>
      <PageHead title={title} meta={meta} statement={page.intro || undefined} />
      <div className="gutter grid gap-12 py-14 lg:grid-cols-12 lg:py-20">
        {aside && (
          <aside className="order-2 lg:order-1 lg:col-span-3">{aside}</aside>
        )}
        <div className="order-1 lg:order-2 lg:col-span-8 lg:col-start-5">
          <Prose node={node} />
        </div>
      </div>
    </>
  );
}
