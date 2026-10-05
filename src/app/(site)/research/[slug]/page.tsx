import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Prose } from "@/components/Prose";
import { PostRow, StatusTag } from "@/components/blocks";
import { getPosts, getProject, getProjects } from "@/lib/content";

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/research/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const project = await getProject(slug);
  return project ? { title: project.shortTitle || project.title, description: project.summary } : {};
}

export default async function ProjectPage(props: PageProps<"/research/[slug]">) {
  const { slug } = await props.params;
  const [project, projects, posts] = await Promise.all([getProject(slug), getProjects(), getPosts()]);
  if (!project) notFound();

  const { node } = await project.content();
  const related = posts.filter((p) => p.project === slug);
  const facts = [
    { label: "Period", value: project.period },
    { label: "Region", value: project.region },
    { label: project.leads.length > 1 ? "Leads" : "Lead", value: project.leads.join(", ") },
    { label: "Methods", value: project.methods.join(", ") },
  ].filter((f) => f.value);

  const index = projects.findIndex((p) => p.slug === slug);
  const next = projects[(index + 1) % projects.length];

  return (
    <article>
      <header className="gutter pb-12 pt-14 lg:pb-16 lg:pt-24">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav aria-label="Breadcrumb" className="label text-ink-3">
            <Link href="/research" className="hover:text-rubric">
              Research
            </Link>
            <span className="px-2">/</span>
            <span className="text-ink-2">{project.shortTitle}</span>
          </nav>
          <StatusTag status={project.status} />
        </div>
        <h1 className="display mt-8 max-w-[20ch] text-[clamp(2.5rem,6vw,5.75rem)] leading-[0.97] tracking-[-0.045em]">
          {project.title}
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-2 lg:text-xl">{project.summary}</p>
      </header>

      <dl className="border-y border-rule">
        <div className="gutter grid grid-cols-2 lg:grid-cols-4">
          {facts.map((f, i) => (
            <div
              key={f.label}
              className={`py-6 ${i % 2 ? "border-l border-rule pl-5" : "pr-5"} ${i < facts.length - 2 ? "border-b border-rule lg:border-b-0" : ""} lg:px-0 ${i > 0 ? "lg:border-l lg:pl-6" : ""}`}
            >
              <dt className="label text-ink-3">{f.label}</dt>
              <dd className="mt-2.5 text-[0.98rem]">{f.value}</dd>
            </div>
          ))}
        </div>
      </dl>

      <div className="gutter grid gap-12 py-14 lg:grid-cols-12 lg:py-20">
        <aside className="order-2 space-y-10 lg:order-1 lg:col-span-3">
          <div className="space-y-10 lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
            {project.team.length > 0 && (
              <div>
                <h2 className="label mb-4 text-ink-3">Team</h2>
                <ul className="space-y-1.5 text-[0.95rem] text-ink-2">
                  {project.team.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
            )}
            {project.links.length > 0 && (
              <div>
                <h2 className="label mb-4 text-ink-3">Links</h2>
                <ul className="space-y-1.5 text-[0.95rem]">
                  {project.links.map((l) => (
                    <li key={l.url}>
                      <a href={l.url ?? undefined} className="link-arrow">
                        {l.label} <span aria-hidden>↗</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {related.length > 0 && (
              <a href="#lab-notes" className="link-arrow text-[0.95rem]">
                {related.length} lab {related.length === 1 ? "note" : "notes"} on this project{" "}
                <span aria-hidden>↓</span>
              </a>
            )}
          </div>
        </aside>
        <div className="order-1 lg:order-2 lg:col-span-8 lg:col-start-5">
          <Prose node={node} />
        </div>
      </div>

      {related.length > 0 && (
        <section id="lab-notes" className="gutter scroll-mt-20 pb-20">
          <h2 className="display mb-8 text-[clamp(1.75rem,3.5vw,2.75rem)] leading-none">Lab notes on this project</h2>
          <ul className="border-b border-rule">
            {related.map((post) => (
              <PostRow key={post.slug} post={post} projects={projects} />
            ))}
          </ul>
        </section>
      )}

      <Link
        href={`/research/${next.slug}`}
        className="group block border-t border-rule transition-colors hover:bg-paper-2"
      >
        <div className="gutter flex items-center justify-between gap-6 py-10 lg:py-14">
          <span>
            <span className="label text-ink-3">Next project</span>
            <span className="display mt-3 block text-[clamp(1.75rem,4vw,3.25rem)] leading-none group-hover:text-rubric">
              {next.shortTitle}
            </span>
          </span>
          <span className="text-3xl transition-transform group-hover:translate-x-1" aria-hidden>
            →
          </span>
        </div>
      </Link>
    </article>
  );
}
