import type { Metadata } from "next";
import Link from "next/link";
import { PageHead, ProjectCard } from "@/components/blocks";
import { getProjects } from "@/lib/content";

export const metadata: Metadata = { title: "Research" };

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
        <h2 className="label mb-8 text-ink-3">Active · {active.length}</h2>
        <div className="grid border-l border-t border-rule md:grid-cols-2">
          {active.map((project, i) => (
            <ProjectCard key={project.slug} project={project} index={i} />
          ))}
        </div>
      </section>

      <section id="archive" className="gutter scroll-mt-20 pb-20 lg:pb-32">
        <div className="mb-8 flex items-baseline justify-between gap-6">
          <h2 className="display text-[clamp(2rem,4vw,3.25rem)] leading-none">The archive</h2>
          <p className="label text-ink-3">{archived.length} projects</p>
        </div>
        <ul className="border-b border-rule">
          <li className="label hidden border-t border-rule py-3 text-ink-3 md:grid md:grid-cols-12 md:gap-6">
            <span className="md:col-span-5">Project</span>
            <span className="md:col-span-2">Period</span>
            <span className="md:col-span-2">Region</span>
            <span className="md:col-span-3">Lead</span>
          </li>
          {archived.map((p) => (
            <li key={p.slug} className="border-t border-rule">
              <Link
                href={`/research/${p.slug}`}
                className="group grid gap-1 py-5 transition-colors hover:bg-paper-2 md:grid-cols-12 md:gap-6 md:px-0"
              >
                <span className="md:col-span-5">
                  <span className="display text-xl tracking-[-0.02em] group-hover:text-rubric">{p.title}</span>
                  <span className="mt-1 block text-[0.92rem] text-ink-3 md:pr-6">{p.summary}</span>
                </span>
                <span className="text-[0.92rem] text-ink-2 md:col-span-2 md:pt-1">{p.period}</span>
                <span className="text-[0.92rem] text-ink-2 md:col-span-2 md:pt-1">{p.region}</span>
                <span className="text-[0.92rem] text-ink-2 md:col-span-3 md:pt-1">{p.leads.join(", ")}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
