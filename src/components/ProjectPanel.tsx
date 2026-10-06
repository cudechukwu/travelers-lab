import Markdoc, { type Node } from "@markdoc/markdoc";
import Image from "next/image";
import Link from "next/link";
import { StatusTag } from "./blocks";
import { Prose } from "./Prose";
import type { Project } from "@/lib/content";

/** The first image in the write-up, if any, to head the panel. */
function firstImage(node: Node) {
  for (const n of node.walk()) {
    if (n.type === "image")
      return {
        src: String(n.attributes.src),
        alt: String(n.attributes.alt ?? ""),
      };
  }
  return null;
}

/** The opening paragraphs of the write-up, without images. */
function opening(node: Node, count = 2) {
  const paragraphs = node.children.filter(
    (n) =>
      n.type === "paragraph" && ![...n.walk()].some((c) => c.type === "image"),
  );
  return new Markdoc.Ast.Node("document", {}, paragraphs.slice(0, count));
}

/** A preview of a project for the homepage side panel. The full page stays the place to read it all. */
export async function ProjectPanel({ project: p }: { project: Project }) {
  const { node } = await p.content();
  const image = firstImage(node);
  const facts = [
    { label: "Period", value: p.period },
    { label: "Region", value: p.region },
    { label: p.leads.length > 1 ? "Leads" : "Lead", value: p.leads.join(", ") },
    { label: "Methods", value: p.methods.join(", ") },
  ].filter((f) => f.value);

  return (
    <article>
      {image && (
        <div
          className={`relative bg-paper-2 ${p.panelImage === "whole" ? "h-[min(20rem,34vh)] border-b border-rule" : "aspect-[16/9]"}`}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 640px) 46rem, 100vw"
            className={
              p.panelImage === "whole"
                ? "object-contain p-6 sm:p-8"
                : "object-cover grayscale"
            }
          />
        </div>
      )}
      <div className="px-5 py-10 sm:px-8 sm:py-12">
        <StatusTag status={p.status} />
        <h2
          id="project-panel-title"
          className="display mt-5 text-[clamp(1.8rem,3.4vw,2.6rem)] leading-[1.02] tracking-[-0.04em]"
        >
          {p.title}
        </h2>
        {p.summary && (
          <p className="mt-6 text-lg leading-relaxed text-ink-2">{p.summary}</p>
        )}
      </div>

      <dl className="grid grid-cols-2 border-y border-rule">
        {facts.map((f, i) => (
          <div
            key={f.label}
            className={`px-5 py-5 sm:px-8 ${i % 2 ? "border-l border-rule" : ""} ${i < facts.length - 2 ? "border-b border-rule" : ""}`}
          >
            <dt className="label text-ink-3">{f.label}</dt>
            <dd className="mt-2.5 text-[0.98rem]">{f.value}</dd>
          </div>
        ))}
      </dl>

      <div className="space-y-10 px-5 py-10 sm:px-8 sm:py-12">
        <Prose node={opening(node)} className="text-[1.1rem]" />
        {p.links.length > 0 && (
          <ul className="space-y-1.5 text-[0.95rem]">
            {p.links.map((l) => (
              <li key={l.url}>
                <a href={l.url ?? undefined} className="link-arrow">
                  {l.label} <span aria-hidden>↗</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link
        href={`/research/${p.slug}`}
        // Hover previews the colour the project page opens in: black for archived, red for active
        className={`sticky bottom-0 flex items-center justify-between gap-4 px-5 py-5 text-white transition-colors sm:px-8 ${
          p.status === "archived"
            ? "bg-rubric hover:bg-black"
            : "bg-black hover:bg-rubric"
        }`}
      >
        Read the full project <span aria-hidden>→</span>
      </Link>
    </article>
  );
}
