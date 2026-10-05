import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHead } from "@/components/blocks";
import { Prose } from "@/components/Prose";
import { getPage } from "@/lib/content";

export const metadata: Metadata = { title: "Teaching" };

const SECTIONS = ["digital-history", "acceleration-of-europe"];

export default async function TeachingPage() {
  const [intro, ...courses] = await Promise.all([getPage("courses"), ...SECTIONS.map((s) => getPage(s))]);
  if (!intro) notFound();
  const introBody = (await intro.content()).node;
  const sections = await Promise.all(
    courses.filter((c) => !!c).map(async (c) => ({ ...c, node: (await c.content()).node })),
  );

  return (
    <>
      <PageHead
        eyebrow="Teaching"
        title="Courses and pedagogy"
        intro="Bringing research into the classroom: undergraduate courses where students do real work on the lab’s projects."
      />
      <div className="gutter grid gap-12 py-14 lg:grid-cols-12 lg:py-20">
        <nav aria-label="Courses" className="lg:col-span-3">
          <ul className="space-y-3 border-t border-rule pt-4 text-[0.95rem] lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
            {sections.map((s, i) => (
              <li key={s.slug}>
                <a href={`#${s.slug}`} className="flex gap-3 hover:text-rubric">
                  <span className="label pt-1 text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="lg:col-span-8 lg:col-start-5">
          <Prose node={introBody} />
          {sections.map((s, i) => (
            <section key={s.slug} id={s.slug} className="mt-16 scroll-mt-24 border-t border-rule pt-10">
              <p className="label text-ink-3">Course {String(i + 1).padStart(2, "0")}</p>
              <h2 className="display mt-4 max-w-[24ch] text-[clamp(1.5rem,2.5vw,1.95rem)] leading-[1.05]">{s.title}</h2>
              <Prose node={s.node} className="mt-8" />
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
