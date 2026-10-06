import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/Hero";
import { NetworkMap, hasSite } from "@/components/NetworkMap";
import { SectionHead } from "@/components/blocks";
import { ProjectPanel } from "@/components/ProjectPanel";
import { ProjectPanels } from "@/components/ProjectPanels";
import { ProjectList, ProjectTimeline, centuryRange } from "@/components/projects";
import { getPeople, getProjects } from "@/lib/content";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const NUMBER_WORDS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
];
const numberWord = (n: number) => NUMBER_WORDS[n] ?? String(n);
const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default async function HomePage() {
  const [projects, people] = await Promise.all([getProjects(), getPeople()]);
  const active = projects.filter((p) => p.status === "active");

  const faculty = people.filter((p) => p.group === "faculty" || p.group === "network");
  const institutions = [...new Set(faculty.map((p) => p.institution).filter((i): i is string => !!i && hasSite(i)))];
  const methods = [...new Set(projects.flatMap((p) => p.methods))];
  const panels = Object.fromEntries(projects.map((p) => [p.slug, <ProjectPanel key={p.slug} project={p} />]));

  return (
    <>
      <Hero />

      {/* The lab */}
      <section className="gutter grid gap-8 pb-12 pt-20 lg:grid-cols-12 lg:pb-20 lg:pt-28">
        <p className="label text-ink-3 lg:col-span-3 lg:pt-4">
          <span className="text-rubric">¶</span> The lab
        </p>
        <div className="lg:col-span-9">
          <p className="max-w-[19em] font-serif text-[clamp(1.5rem,2.4vw,2.2rem)] leading-[1.2] tracking-[-0.01em]">
            Beyond famous travellers, mass migrations and armed campaigns, we follow the everyday traffic of the
            past: edicts, coins, seals, letters, receipts,{" "}
            <em className="text-rubric">and the pockets that carried them.</em>
          </p>
          <div className="mt-12 grid gap-8 text-[1.02rem] leading-relaxed text-ink-2 sm:grid-cols-2">
            <p>
              Our projects use the tools humanists now call “digital”, such as GIS, text analysis, network analysis
              and data visualization, but we don’t restrict ourselves to them. Methods vary according to the sources
              and questions of each project.
            </p>
            <p>
              Established with Wesleyan’s Quantitative Analysis Center and supported by WesGIS, the lab brings
              faculty and undergraduate researchers together on shared problems across several campuses.{" "}
              <Link href="/about" className="text-ink underline decoration-1 underline-offset-[0.25em] hover:text-rubric">
                More about the lab
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Research */}
      <section className="gutter py-20 lg:py-28">
        <SectionHead
          label="Research"
          title={
            <>
              {capitalise(numberWord(projects.length))} projects spanning{" "}
              <span className="block font-serif font-normal italic tracking-[-0.02em]">
                {centuryRange(projects)}.
              </span>
            </>
          }
          link={{ href: "/research", label: `All ${projects.length} projects` }}
        />
        <ProjectPanels panels={panels}>
          <ProjectTimeline projects={projects} />
          <div className="mt-12 md:mt-20">
            <p className="label mb-4 text-ink-3">
              <span className="text-rubric">●</span> Active now · {active.length}
            </p>
            <ProjectList projects={active} />
          </div>
        </ProjectPanels>
      </section>

      {/* The network */}
      <section className="bg-band py-16 text-on-dark lg:py-24">
        <div className="gutter">
          <SectionHead
            dark
            label="The network"
            title={
              <>
                The Travelers’ Lab includes researchers at {numberWord(institutions.length)} universities in{" "}
                <span className="whitespace-nowrap font-serif font-normal italic tracking-[-0.02em]">the United States and Europe.</span>
              </>
            }
          />
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-9 lg:col-start-4">
              <NetworkMap institutions={institutions} />
            </div>
            <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:col-span-9 lg:col-start-4 lg:grid-cols-3">
              {institutions.map((inst) => (
                <li key={inst} className="border-t border-on-dark/15 pt-4">
                  <p className="label text-on-dark/60">{inst}</p>
                  <p className="mt-2 text-[0.95rem]">
                    {faculty
                      .filter((p) => p.institution === inst)
                      .map((p) => p.name)
                      .join(", ")}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Methods */}
      <section className="gutter py-20 lg:py-28">
        <SectionHead label="Methods" title="Methods and tools" />
        <div className="lg:grid lg:grid-cols-12">
          <ul className="display flex flex-wrap gap-x-3 gap-y-1 text-[clamp(1.35rem,2.5vw,2.1rem)] leading-[1.2] tracking-[-0.03em] text-ink-3 lg:col-span-9 lg:col-start-4">
            {methods.map((m, i) => (
              <li key={m} className="text-ink">
                {m}
                {i < methods.length - 1 && <span className="pl-3 text-ink-3/60">/</span>}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Join */}
      <section className="bg-rubric text-on-dark">
        <div className="gutter grid gap-12 py-16 lg:grid-cols-12 lg:py-24">
          <div className="lg:col-span-5">
            <p className="label text-on-dark/70">¶ Students and scholars</p>
            <h2 className="display mt-6 text-[clamp(2.25rem,4.9vw,4.5rem)] leading-[0.95] tracking-[-0.045em]">
              Get involved
            </h2>
          </div>
          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-6 lg:col-start-7 lg:self-end">
            <div>
              <p className="label text-on-dark/70">Students</p>
              <p className="mt-3 leading-relaxed">
                Undergraduates join through research apprenticeships, QAC summer positions and courses like
                Advanced Research in Digital History.
              </p>
            </div>
            <div>
              <p className="label text-on-dark/70">Scholars</p>
              <p className="mt-3 leading-relaxed">
                We welcome collaborators working on movement, communication and networks in any period or region.
              </p>
            </div>
            <Link
              href="/get-involved"
              className="inline-flex items-center justify-between gap-3 bg-on-dark px-5 py-3.5 text-band transition-colors hover:bg-band hover:text-on-dark sm:col-span-2 sm:w-fit sm:justify-start"
            >
              How to get involved <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
