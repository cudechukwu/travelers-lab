import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/blocks";
import { ProjectList, ProjectTimeline } from "@/components/projects";
import { getProjects } from "@/lib/content";

export const metadata: Metadata = {
  title: "Research",
  description: "The Travelers’ Lab’s research projects, active and archived, from Byzantine Constantinople to eighteenth-century London.",
  alternates: { canonical: "/research" },
};

export default async function ResearchPage() {
  const projects = await getProjects();
  const active = projects.filter((p) => p.status === "active");
  const archived = projects.filter((p) => p.status === "archived");

  return (
    <>
      <PageHead
        eyebrow="Research"
        title="Projects"
        intro="Each project draws on a different body of evidence from a different culture. The datasets are built in the open, with the aim of publishing the data alongside the research."
      />

      <section className="gutter py-16 lg:py-24">
        <ProjectTimeline projects={projects} />
        <div className="mb-8 mt-16 flex items-baseline justify-between gap-6 md:mt-24">
          <h2 className="display text-[clamp(1.6rem,2.8vw,2.3rem)] leading-none">Active projects</h2>
          <p className="label text-ink-3">{active.length} projects</p>
        </div>
        <ProjectList projects={active} />
      </section>

      {/* Same dark band as the homepage network section */}
      <section id="archive" className="scroll-mt-20 bg-band py-20 text-on-dark lg:py-32">
        <div className="gutter">
          <div className="mb-8 flex items-baseline justify-between gap-6">
            <h2 className="display text-[clamp(1.6rem,2.8vw,2.3rem)] leading-none">The archive</h2>
            <p className="label text-on-dark/60">{archived.length} projects</p>
          </div>
          <ul className="border-b border-on-dark/15">
            <li className="label hidden border-t border-on-dark/15 py-3 text-on-dark/60 md:grid md:grid-cols-12 md:gap-6">
              <span className="md:col-span-5">Project</span>
              <span className="md:col-span-2">Period</span>
              <span className="md:col-span-2">Region</span>
              <span className="md:col-span-3">Lead</span>
            </li>
            {archived.map((p) => (
              <li key={p.slug} className="border-t border-on-dark/15">
                <Link
                  href={`/research/${p.slug}`}
                  className="group grid gap-1 py-5 transition-colors hover:bg-on-dark/5 md:grid-cols-12 md:gap-6"
                >
                  <span className="md:col-span-5">
                    {/* lighter red: the standard rubric is too dark to read on this background */}
                    <span className="display text-xl tracking-[-0.02em] group-hover:text-[#e46a4f]">{p.title}</span>
                    <span className="mt-1 block text-[0.92rem] text-on-dark/60 md:pr-6">{p.summary}</span>
                  </span>
                  <span className="text-[0.92rem] text-on-dark/80 md:col-span-2 md:pt-1">{p.period}</span>
                  <span className="text-[0.92rem] text-on-dark/80 md:col-span-2 md:pt-1">{p.region}</span>
                  <span className="text-[0.92rem] text-on-dark/80 md:col-span-3 md:pt-1">{p.leads.join(", ")}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
