import Link from "next/link";
import type { Project } from "@/lib/content";
import { Reveal } from "./Reveal";

const MIN = 200;
const MAX = 1800;
const pct = (year: number) => ((Math.min(Math.max(year, MIN), MAX) - MIN) / (MAX - MIN)) * 100;
const TICKS = [200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800];

// A few fixed points so the bars have something to be read against
const LANDMARKS: { year: number; label: string; before?: boolean }[] = [
  { year: 800, label: "Charlemagne crowned" },
  { year: 1347, label: "Black Death", before: true },
  { year: 1453, label: "Fall of Constantinople" },
];

const range = (p: Project) => `${p.startYear}–${p.endYear}`;

/**
 * Every project placed on one axis, 200–1800 CE. An overview only: the list
 * beneath it does the navigating, and on phones the timeline is hidden.
 */
export function ProjectTimeline({ projects }: { projects: Project[] }) {
  const rows = projects
    .filter((p): p is Project & { startYear: number; endYear: number } => p.startYear != null && p.endYear != null)
    .sort((a, b) => a.startYear - b.startYear || a.endYear - b.endYear);
  const labelCol = "w-44 lg:w-56";

  return (
    <Reveal className="hidden md:block">
      <figure aria-label="Timeline of the periods each project studies">
        <div className="relative">
          {/* landmark lines across every row */}
          <div className="pointer-events-none absolute inset-y-0 right-0 left-44 lg:left-56" aria-hidden>
            {LANDMARKS.map((m) => (
              <div key={m.year} className="absolute inset-y-0 border-l border-dashed border-ink-3/40" style={{ left: `${pct(m.year)}%` }}>
                <span
                  className={`absolute -top-1 whitespace-nowrap font-serif text-[0.85rem] italic text-ink-3 ${m.before ? "right-2" : "left-2"}`}
                >
                  {m.label}, <span className="oldstyle">{m.year}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="h-8" aria-hidden />
          <ul className="border-b border-rule">
            {rows.map((p, i) => {
              const left = pct(p.startYear);
              const width = Math.max(pct(p.endYear) - left, 0.6);
              const yearsOnLeft = left + width > 82;
              const active = p.status === "active";
              return (
                <li key={p.slug} className="border-t border-rule">
                  <Link href={`/research/${p.slug}`} className="group flex h-10 items-center transition-colors hover:bg-paper-2">
                    <span
                      className={`${labelCol} shrink-0 truncate pr-4 text-[0.95rem] transition-colors group-hover:text-rubric ${active ? "text-ink" : "text-ink-3"}`}
                    >
                      {p.shortTitle}
                    </span>
                    <span className="relative h-full flex-1 bg-[linear-gradient(to_right,var(--rule)_1px,transparent_1px)] bg-[length:12.5%_100%]">
                      <span
                        className={`grow absolute top-1/2 h-1.5 -translate-y-1/2 transition-[height] group-hover:h-2.5 ${active ? "bg-rubric" : "bg-ink-3/45 group-hover:bg-ink-3"}`}
                        style={{ left: `${left}%`, width: `${width}%`, animationDelay: `${0.15 + i * 0.05}s` }}
                      />
                      <span
                        className="oldstyle absolute top-1/2 -translate-y-1/2 whitespace-nowrap font-serif text-[0.85rem] text-ink-3"
                        style={
                          yearsOnLeft
                            ? { right: `${100 - left}%`, paddingRight: "0.6rem" }
                            : { left: `${left + width}%`, paddingLeft: "0.6rem" }
                        }
                      >
                        {range(p)}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* axis */}
          <div className="flex">
            <span className={`${labelCol} shrink-0`} />
            <div className="relative h-8 flex-1">
              {TICKS.map((t, i) => (
                <span
                  key={t}
                  className="label absolute top-3 text-ink-3"
                  style={{
                    left: `${pct(t)}%`,
                    transform: i === 0 ? "none" : i === TICKS.length - 1 ? "translateX(-100%)" : "translateX(-50%)",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
        <figcaption className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[0.9rem] text-ink-3">
          <span className="inline-flex items-center gap-2">
            <span className="h-1.5 w-5 bg-rubric" aria-hidden /> Active
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-1.5 w-5 bg-ink-3/45" aria-hidden /> Archived
          </span>
          <span className="font-serif italic">Years are approximate.</span>
        </figcaption>
      </figure>
    </Reveal>
  );
}

export const centuriesSpanned = (projects: Project[]) => {
  const starts = projects.map((p) => p.startYear).filter((y): y is number => y != null);
  const ends = projects.map((p) => p.endYear).filter((y): y is number => y != null);
  if (!starts.length) return 0;
  const century = (y: number) => Math.ceil(y / 100);
  return century(Math.max(...ends)) - century(Math.min(...starts)) + 1;
};

/** The clickable list of projects that sits under the timeline. */
export function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <ul className="border-b border-rule">
      {projects.map((p) => (
        <li key={p.slug} className="border-t border-rule">
          <Link
            href={`/research/${p.slug}`}
            className="group grid gap-x-8 gap-y-3 py-8 transition-colors lg:grid-cols-12 lg:py-10"
          >
            <div className="lg:col-span-4">
              <h3 className="display text-[clamp(1.4rem,2.1vw,1.8rem)] leading-[1.05] transition-colors group-hover:text-rubric">
                {p.shortTitle || p.title}
              </h3>
              <p className="label mt-3 text-ink-3">
                {p.period} · {p.region}
              </p>
            </div>
            <p className="max-w-xl text-[1.05rem] leading-relaxed text-ink-2 lg:col-span-5">{p.summary}</p>
            <div className="flex items-start justify-between gap-4 lg:col-span-3">
              <p className="text-[0.95rem]">
                <span className="label block pb-1.5 text-ink-3">Led by</span>
                {p.leads.join(", ")}
              </p>
              <span className="pt-1 text-xl transition-transform group-hover:translate-x-1 group-hover:text-rubric" aria-hidden>
                →
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
