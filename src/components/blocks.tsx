import Link from "next/link";
import type { ReactNode } from "react";
import { formatDate, type Post, type Project } from "@/lib/content";

/** Section heading: "¶ Research" label, big title, optional link on the right. */
export function SectionHead({
  label,
  title,
  link,
  dark = false,
}: {
  label: string;
  title: ReactNode;
  link?: { href: string; label: string };
  dark?: boolean;
}) {
  return (
    <div className="grid gap-6 pb-10 lg:grid-cols-12 lg:pb-14">
      <p className={`label lg:col-span-3 lg:pt-3 ${dark ? "text-on-dark/60" : "text-ink-3"}`}>
        <span className={dark ? "" : "text-rubric"}>¶</span> {label}
      </p>
      <h2
        className="display text-[clamp(1.75rem,3.2vw,2.9rem)] leading-[1.05] lg:col-span-7"
      >
        {title}
      </h2>
      {link && (
        <div className="lg:col-span-2 lg:flex lg:items-end lg:justify-end">
          <Link href={link.href} className="link-arrow text-[0.95rem]">
            {link.label} <span aria-hidden>→</span>
          </Link>
        </div>
      )}
    </div>
  );
}

export function StatusTag({ status }: { status: Project["status"] }) {
  return (
    <span className="label inline-flex items-center gap-2 text-ink-2">
      <span className={`size-1.5 rounded-full ${status === "active" ? "bg-rubric" : "bg-ink-3"}`} aria-hidden />
      {status === "active" ? "Active" : "Archived"}
    </span>
  );
}

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <Link
      href={`/research/${project.slug}`}
      className="group flex min-h-[20rem] flex-col justify-between gap-10 border-b border-r border-rule p-6 transition-colors hover:bg-paper-2 sm:p-8 lg:min-h-[24rem] lg:p-10"
    >
      <div className="flex items-center justify-between">
        <span className="label text-ink-3">{String(index + 1).padStart(2, "0")}</span>
        <StatusTag status={project.status} />
      </div>
      <div>
        <h3 className="display text-[clamp(1.5rem,2.3vw,1.95rem)] leading-[1.05] transition-colors group-hover:text-rubric">
          {project.shortTitle || project.title}
        </h3>
        <p className="mt-4 max-w-md text-[1.02rem] leading-relaxed text-ink-2">{project.summary}</p>
      </div>
      <div className="flex items-end justify-between gap-6">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[0.85rem]">
          <dt className="label pt-[0.2em] text-ink-3">Period</dt>
          <dd>{project.period}</dd>
          <dt className="label pt-[0.2em] text-ink-3">Lead</dt>
          <dd>{project.leads.join(", ")}</dd>
        </dl>
        <span
          className="text-xl transition-transform group-hover:translate-x-1 group-hover:text-rubric"
          aria-hidden
        >
          →
        </span>
      </div>
    </Link>
  );
}

export function PostRow({ post, projects }: { post: Post; projects: Project[] }) {
  const project = projects.find((p) => p.slug === post.project);
  return (
    <li className="border-t border-rule">
      <Link
        href={`/blog/${post.slug}`}
        className="group grid gap-x-6 gap-y-2 py-6 transition-colors sm:grid-cols-12 lg:py-8"
      >
        <time dateTime={post.date ?? undefined} className="label pt-1.5 text-ink-3 sm:col-span-3 lg:col-span-2">
          {formatDate(post.date, "short")}
        </time>
        <div className="sm:col-span-9 lg:col-span-7">
          <h3 className="display text-[1.25rem] leading-tight tracking-[-0.02em] transition-colors group-hover:text-rubric lg:text-[1.4rem]">
            {post.title}
          </h3>
          {post.authors.length > 0 && <p className="mt-2 text-[0.92rem] text-ink-3">{post.authors.join(", ")}</p>}
        </div>
        <div className="flex items-start justify-between gap-4 sm:col-span-9 sm:col-start-4 lg:col-span-3 lg:col-start-auto">
          {project && <span className="label pt-1.5 text-ink-2">{project.shortTitle}</span>}
          <span className="ml-auto hidden transition-transform group-hover:translate-x-1 lg:block" aria-hidden>
            →
          </span>
        </div>
      </Link>
    </li>
  );
}

/** Title block for inner pages. */
export function PageHead({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="gutter border-b border-rule pb-12 pt-14 lg:pb-16 lg:pt-24">
      <div className="label text-ink-3">{eyebrow}</div>
      <h1 className="display mt-6 max-w-[18ch] text-[clamp(2.25rem,4.9vw,4.5rem)] leading-[0.98] tracking-[-0.045em]">
        {title}
      </h1>
      {intro && <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-2 lg:text-xl">{intro}</p>}
      {children}
    </header>
  );
}
