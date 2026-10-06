import type { Publication } from "@/lib/content";
import { Abstract } from "./Abstract";
import { Prose } from "./Prose";

export const kindLabels: Record<Publication["kind"], string> = {
  article: "Article",
  chapter: "Book chapter",
  book: "Book",
  digital: "Digital project",
  data: "Data & archive",
};

const ring = (cx: number, cy: number, rx: number, ry = rx) => (
  <ellipse key={`${rx}-${ry}`} cx={cx} cy={cy} rx={rx} ry={ry} />
);

/**
 * Hairline drawings, one per entry in turn so neighbours never repeat:
 * a globe, a radiating network, stacked leaves of a palimpsest, a map grid,
 * paired orbits and a route between waypoints.
 */
const GLYPHS = [
  () => (
    <>
      {ring(50, 50, 46)}
      {[8, 20, 32, 42].map((rx) => ring(50, 50, rx, 46))}
      <line x1="50" y1="4" x2="50" y2="96" />
      {[22, 50, 78].map((y) => {
        const half = Math.sqrt(46 ** 2 - (y - 50) ** 2);
        return <line key={y} x1={50 - half} y1={y} x2={50 + half} y2={y} />;
      })}
    </>
  ),
  () => (
    <>
      {ring(50, 50, 46)}
      {Array.from({ length: 48 }, (_, i) => {
        const a = (i * Math.PI) / 24;
        return (
          <line
            key={i}
            x1={50 + 6 * Math.cos(a)}
            y1={50 + 6 * Math.sin(a)}
            x2={50 + 42 * Math.cos(a)}
            y2={50 + 42 * Math.sin(a)}
            strokeDasharray="1.5 2"
          />
        );
      })}
      {ring(50, 50, 3)}
    </>
  ),
  () =>
    Array.from({ length: 5 }, (_, i) => (
      <rect key={i} x={14 + i * 4} y={8 + i * 4} width="52" height="66" />
    )),
  () => (
    <>
      <rect x="6" y="6" width="88" height="88" strokeDasharray="1 1.5" />
      {[28, 50, 72].map((v) => (
        <g key={v}>
          <line x1={v} y1="6" x2={v} y2="94" />
          <line x1="6" y1={v} x2="94" y2={v} />
        </g>
      ))}
      {[
        [17, 39],
        [61, 17],
        [39, 61],
        [83, 83],
        [61, 61],
      ].map(([x, y]) => (
        <rect
          key={`${x}-${y}`}
          x={x - 3}
          y={y - 3}
          width="6"
          height="6"
          fill="currentColor"
        />
      ))}
    </>
  ),
  () => (
    <>
      <circle cx="50" cy="50" r="46" strokeDasharray="0.6 1.6" />
      {[8, 14, 20, 26, 32, 38].flatMap((r) => [
        <ellipse
          key={`l${r}`}
          cx={50 - r}
          cy="50"
          rx={r}
          ry={Math.min(30, r * 1.6)}
        />,
        <ellipse
          key={`r${r}`}
          cx={50 + r}
          cy="50"
          rx={r}
          ry={Math.min(30, r * 1.6)}
        />,
      ])}
    </>
  ),
  () => {
    const stops = [
      [10, 78],
      [30, 52],
      [52, 62],
      [70, 30],
      [90, 18],
    ];
    return (
      <>
        <rect x="4" y="4" width="92" height="92" strokeDasharray="1 1.5" />
        <path
          d="M10,78 C18,60 22,50 30,52 S46,70 52,62 S62,34 70,30 S84,22 90,18"
          strokeDasharray="2 1.5"
        />
        {stops.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="2.5" fill="currentColor" />
        ))}
        {ring(90, 18, 6)}
      </>
    );
  },
];

function Glyph({ index }: { index: number }) {
  const shape = GLYPHS[index % GLYPHS.length]();
  return (
    <svg
      viewBox="0 0 100 100"
      className="size-full text-ink-3"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.5"
      aria-hidden
    >
      {shape}
    </svg>
  );
}

export async function PublicationRow({
  publication: p,
  index,
}: {
  publication: Publication;
  index: number;
}) {
  const { node } = await p.abstract();
  const hasAbstract = node.children.length > 0;
  const facts = [kindLabels[p.kind], p.date?.slice(0, 4), p.venue].filter(
    Boolean,
  );

  return (
    <li className="grid gap-x-6 gap-y-8 border-t border-rule py-12 lg:grid-cols-12 lg:py-16">
      <div className="flex gap-5 lg:col-span-6 lg:gap-6">
        <span className="pt-2 font-mono text-[0.85rem] text-ink-3 lg:pt-3">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="flex flex-col gap-10">
          <h2 className="display max-w-[20ch] text-[clamp(1.6rem,2.7vw,2.5rem)] leading-[1.05]">
            {p.url ? (
              <a href={p.url} className="transition-colors hover:text-rubric">
                {p.title}
                <span
                  className="ml-2 align-[0.15em] text-[0.55em] text-ink-3"
                  aria-hidden
                >
                  ↗
                </span>
              </a>
            ) : (
              p.title
            )}
          </h2>
          <div className="hidden size-36 lg:block xl:size-40">
            <Glyph index={index} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:col-span-5 lg:col-start-8 lg:pt-3">
        <p className="text-[1.02rem] leading-snug text-ink-2">
          {p.authors.join(", ")}
        </p>
        {hasAbstract && (
          <Abstract>
            <Prose node={node} className="text-[1.08rem]" />
          </Abstract>
        )}
        <ul className="space-y-2.5 font-mono text-[0.85rem] uppercase leading-snug tracking-[0.04em]">
          {facts.map((f) => (
            <li key={f} className="flex gap-3">
              <span
                className="mt-[0.3em] size-2 shrink-0 bg-rubric"
                aria-hidden
              />
              {f}
            </li>
          ))}
          {p.doi && (
            <li className="flex gap-3">
              <span
                className="mt-[0.3em] size-2 shrink-0 bg-rubric"
                aria-hidden
              />
              <a
                href={`https://doi.org/${p.doi}`}
                className="break-all underline underline-offset-4 hover:text-rubric"
              >
                DOI {p.doi}
              </a>
            </li>
          )}
        </ul>
      </div>
    </li>
  );
}
