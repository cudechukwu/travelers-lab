import Link from "next/link";
import { Hero } from "@/components/Hero";
import { NetworkMap, hasSite } from "@/components/NetworkMap";
import { PostRow, ProjectCard, SectionHead } from "@/components/blocks";
import { getPeople, getPosts, getProjects } from "@/lib/content";

export default async function HomePage() {
  const [projects, posts, people] = await Promise.all([getProjects(), getPosts(), getPeople()]);
  const active = projects.filter((p) => p.status === "active");
  const archived = projects.filter((p) => p.status === "archived");

  const faculty = people.filter((p) => p.group === "faculty" || p.group === "network");
  const institutions = [...new Set(faculty.map((p) => p.institution).filter((i): i is string => !!i && hasSite(i)))];
  const firstYear = Math.min(...posts.map((p) => parseInt(p.date ?? "9999", 10)));
  const methods = [...new Set(projects.flatMap((p) => p.methods))];

  const stats = [
    { value: active.length, label: "Active projects" },
    { value: projects.length, label: "Projects to date" },
    { value: institutions.length, label: "Partner campuses" },
    { value: posts.length, label: `Lab notes since ${firstYear}` },
  ];

  return (
    <>
      <Hero />

      {/* 01 — The lab */}
      <section className="gutter grid gap-8 py-20 lg:grid-cols-12 lg:py-32">
        <p className="label text-ink-3 lg:col-span-3 lg:pt-4">01 — The lab</p>
        <div className="lg:col-span-9">
          <p className="font-serif text-[clamp(1.75rem,3.4vw,3.1rem)] leading-[1.14] tracking-[-0.01em]">
            Beyond famous travellers, mass migrations and armed campaigns, we follow the everyday traffic of the
            past: edicts, coins, seals, letters, receipts —{" "}
            <em className="text-rubric">and the pockets that carried them.</em>
          </p>
          <div className="mt-12 grid gap-8 text-[1.02rem] leading-relaxed text-ink-2 sm:grid-cols-2">
            <p>
              Our projects use the tools humanists now call “digital” — GIS, text analysis, network analysis, data
              visualization — but we don’t restrict ourselves to them. Whatever turns exacting source work into new
              ways of seeing the past is fair game.
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

      <section aria-label="The lab in numbers" className="border-y border-rule">
        <dl className="gutter grid grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`flex flex-col gap-3 py-8 lg:py-10 ${i % 2 ? "pl-6" : "pr-6"} lg:px-0 ${i > 0 ? "lg:border-l lg:border-rule lg:pl-8" : ""} ${i % 2 ? "border-l border-rule lg:border-l" : ""} ${i < 2 ? "border-b border-rule lg:border-b-0" : ""}`}
            >
              <dt className="label order-2 text-ink-3">{s.label}</dt>
              <dd className="display order-1 text-[clamp(2.75rem,6vw,5rem)] leading-none tracking-[-0.05em]">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 02 — Research */}
      <section className="gutter py-20 lg:py-32">
        <SectionHead
          index="02"
          label="Research"
          title="Active projects"
          link={{ href: "/research", label: `All ${projects.length} projects` }}
        />
        <div className="grid border-l border-t border-rule md:grid-cols-2">
          {active.map((project, i) => (
            <ProjectCard key={project.slug} project={project} index={i} />
          ))}
        </div>
        <div className="mt-10 grid gap-4 lg:grid-cols-12">
          <p className="label pt-1 text-ink-3 lg:col-span-3">The archive · {archived.length} projects</p>
          <p className="text-[1.05rem] leading-relaxed text-ink-2 lg:col-span-9">
            {archived.map((p, i) => (
              <span key={p.slug}>
                <Link href={`/research/${p.slug}`} className="text-ink hover:text-rubric">
                  {p.shortTitle}
                </Link>
                {i < archived.length - 1 && <span className="px-2 text-ink-3">/</span>}
              </span>
            ))}
          </p>
        </div>
      </section>

      {/* 03 — Lab notes */}
      <section className="gutter pb-20 lg:pb-32">
        <SectionHead
          index="03"
          label="Lab notes"
          title="From the research blog"
          link={{ href: "/blog", label: `All ${posts.length} posts` }}
        />
        <ul className="border-b border-rule">
          {posts.slice(0, 4).map((post) => (
            <PostRow key={post.slug} post={post} projects={projects} />
          ))}
        </ul>
      </section>

      {/* 04 — The network */}
      <section className="bg-[#161513] py-20 text-on-dark lg:py-32">
        <div className="gutter">
          <SectionHead
            dark
            index="04"
            label="The network"
            title={
              <>
                One lab, {institutions.length} campuses,{" "}
                <span className="font-serif font-normal italic tracking-[-0.02em]">two continents.</span>
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

      {/* 05 — Methods */}
      <section className="gutter py-20 lg:py-32">
        <SectionHead index="05" label="Methods" title="Old sources, new instruments." />
        <div className="lg:grid lg:grid-cols-12">
          <ul className="display flex flex-wrap gap-x-3 gap-y-1 text-[clamp(1.6rem,3.6vw,3rem)] leading-[1.15] tracking-[-0.03em] text-ink-3 lg:col-span-9 lg:col-start-4">
            {methods.map((m, i) => (
              <li key={m} className="text-ink">
                {m}
                {i < methods.length - 1 && <span className="pl-3 text-ink-3/60">/</span>}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 06 — Join */}
      <section className="bg-rubric text-on-dark">
        <div className="gutter grid gap-12 py-20 lg:grid-cols-12 lg:py-28">
          <div className="lg:col-span-5">
            <p className="label text-on-dark/70">06 — Get involved</p>
            <h2 className="display mt-6 text-[clamp(3rem,7vw,6.5rem)] leading-[0.92] tracking-[-0.045em]">
              Join the lab.
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
                We welcome collaborators working on movement, communication and networks — in any period or
                region.
              </p>
            </div>
            <Link
              href="/get-involved"
              className="inline-flex items-center justify-between gap-3 bg-on-dark px-5 py-3.5 text-[#161513] transition-colors hover:bg-[#161513] hover:text-on-dark sm:col-span-2 sm:w-fit sm:justify-start"
            >
              How to get involved <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
