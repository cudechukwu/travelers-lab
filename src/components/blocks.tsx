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
      <p
        className={`label lg:col-span-3 lg:pt-3 ${dark ? "text-on-dark/60" : "text-ink-3"}`}
      >
        <span className={dark ? "" : "text-rubric"}>¶</span> {label}
      </p>
      <h2 className="display text-[clamp(1.75rem,3.2vw,2.9rem)] leading-[1.05] lg:col-span-7">
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
      <span
        className={`size-1.5 rounded-full ${status === "active" ? "bg-rubric" : "bg-ink-3"}`}
        aria-hidden
      />
      {status === "active" ? "Active" : "Archived"}
    </span>
  );
}

export function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  return (
    <Link
      href={`/research/${project.slug}`}
      className="group flex min-h-[20rem] flex-col justify-between gap-10 border-b border-r border-rule p-6 transition-colors hover:bg-paper-2 sm:p-8 lg:min-h-[24rem] lg:p-10"
    >
      <div className="flex items-center justify-between">
        <span className="label text-ink-3">
          {String(index + 1).padStart(2, "0")}
        </span>
        <StatusTag status={project.status} />
      </div>
      <div>
        <h3 className="display text-[clamp(1.5rem,2.3vw,1.95rem)] leading-[1.05] transition-colors group-hover:text-rubric">
          {project.shortTitle || project.title}
        </h3>
        <p className="mt-4 max-w-md text-[1.02rem] leading-relaxed text-ink-2">
          {project.summary}
        </p>
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

/** One post in a list. `striped`: alternating tint instead of rules, for long lists like the blog index. */
export function PostRow({
  post,
  projects,
  striped = false,
}: {
  post: Post;
  projects: Project[];
  striped?: boolean;
}) {
  const project = projects.find((p) => p.slug === post.project);
  return (
    <li className={striped ? "even:bg-paper-2" : "border-t border-rule"}>
      <Link
        href={`/blog/${post.slug}`}
        className={`group grid gap-x-6 gap-y-2 py-6 transition-colors sm:grid-cols-12 lg:py-8 ${striped ? "px-4 sm:px-6" : ""}`}
      >
        <time
          dateTime={post.date ?? undefined}
          className="label pt-1.5 text-ink-3 sm:col-span-3 lg:col-span-2"
        >
          {formatDate(post.date, "short")}
        </time>
        <div className="sm:col-span-9 lg:col-span-7">
          <h3 className="display text-[1.25rem] leading-tight tracking-[-0.02em] transition-colors group-hover:text-rubric lg:text-[1.4rem]">
            {post.title}
          </h3>
          {post.authors.length > 0 && (
            <p className="mt-2 text-[0.92rem] text-ink-3">
              {post.authors.join(", ")}
            </p>
          )}
        </div>
        <div className="flex items-start justify-between gap-4 sm:col-span-9 sm:col-start-4 lg:col-span-3 lg:col-start-auto">
          {project && (
            <span className="label pt-1.5 text-ink-2">
              {project.shortTitle}
            </span>
          )}
          <span
            className="ml-auto hidden transition-transform group-hover:translate-x-1 lg:block"
            aria-hidden
          >
            →
          </span>
        </div>
      </Link>
    </li>
  );
}

/**
 * Words wrapped in *asterisks* print dark; the rest of the sentence stays
 * grey. Lets editors set the emphasis of a page's opening line in Keystatic.
 */
export function Statement({ text }: { text: string }) {
  return (
    <>
      {text.split(/\*([^*]+)\*/).map((part, i) =>
        i % 2 ? (
          <span key={i} className="text-ink">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

/**
 * Title block for inner pages. The page name sits small with a fact or two
 * (and, optionally, a summary of the page's contents beneath); the other side
 * carries one large sentence about the page. `flip` swaps the two sides;
 * `hideTitle` keeps the name for screen readers only.
 */
export function PageHead({
  title,
  meta,
  statement,
  aside,
  flip = false,
  hideTitle = false,
  children,
}: {
  title: ReactNode;
  meta?: ReactNode;
  statement?: string;
  aside?: ReactNode;
  flip?: boolean;
  hideTitle?: boolean;
  children?: ReactNode;
}) {
  return (
    // Three blocks so phones read name, sentence, then summary; on wide
    // screens the summary tucks under the name beside the sentence.
    <header className="gutter grid gap-8 border-b border-rule pb-12 pt-10 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-6 lg:gap-y-10 lg:pb-16 lg:pt-14">
      <div
        className={
          hideTitle
            ? "sr-only"
            : `lg:col-span-4 lg:row-start-1 ${flip ? "lg:col-start-9" : "lg:col-start-1"}`
        }
      >
        <h1 className="display text-[1.5rem] leading-tight tracking-[-0.025em]">
          {title}
        </h1>
        {meta && <p className="mt-1.5 text-[1.05rem] text-ink-3">{meta}</p>}
      </div>
      <div
        className={`lg:col-span-7 lg:row-span-2 lg:row-start-1 ${flip ? "lg:col-start-1" : "lg:col-start-6"}`}
      >
        {statement && (
          <p className="display max-w-[24em] text-[clamp(1.6rem,2.9vw,2.7rem)] leading-[1.1] tracking-[-0.03em] text-ink-3/80">
            <Statement text={statement} />
          </p>
        )}
        {children}
      </div>
      {aside && (
        <div
          className={`mt-4 lg:col-span-4 lg:row-start-2 lg:mt-0 ${flip ? "lg:col-start-9" : "lg:col-start-1"}`}
        >
          {aside}
        </div>
      )}
    </header>
  );
}

/** A compact table of contents with counts, for the right side of a page head. */
export function IndexList({
  label,
  rows,
}: {
  label: ReactNode;
  rows: {
    label: ReactNode;
    count: number;
    href?: string;
    detail?: ReactNode;
  }[];
}) {
  return (
    <nav aria-label="On this page">
      <p className="label mb-3 text-ink-3">{label}</p>
      <ul className="border-b border-rule">
        {rows.map((r, i) => {
          const inner = (
            <>
              <span className="font-mono text-[0.85rem] text-ink-3">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex-1">
                <span className="block text-[1.05rem]">{r.label}</span>
                {r.detail && (
                  <span className="mt-1 block text-[0.9rem] leading-snug text-ink-3">
                    {r.detail}
                  </span>
                )}
              </span>
              <span className="display text-[1.6rem] leading-none tabular-nums">
                {r.count}
              </span>
              {r.href && (
                <span
                  className="text-ink-3 transition-transform group-hover:translate-y-0.5 group-hover:text-rubric"
                  aria-hidden
                >
                  ↓
                </span>
              )}
            </>
          );
          const cls = "group flex items-center gap-4 py-3.5";
          return (
            <li key={i} className="border-t border-rule">
              {r.href ? (
                <a
                  href={r.href}
                  className={`${cls} transition-colors hover:text-rubric`}
                >
                  {inner}
                </a>
              ) : (
                <div className={cls}>{inner}</div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
