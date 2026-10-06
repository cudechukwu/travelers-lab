import Image from "next/image";
import Link from "next/link";
import hero from "@/assets/hero.jpg";

/**
 * Rhumb lines radiating from two wind roses, as on a portolan chart.
 * Purely decorative, drawn in once on load.
 */
function CompassLines({ className }: { className: string }) {
  const rose = (cx: number, cy: number, count: number, accentEvery: number, delay: number) =>
    Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2;
      const accent = i % accentEvery === 0;
      return (
        <line
          key={`${cx}-${i}`}
          x1={cx}
          y1={cy}
          x2={cx + Math.cos(a) * 2200}
          y2={cy + Math.sin(a) * 2200}
          pathLength={1}
          className="draw-line"
          stroke={accent ? "var(--rubric)" : "currentColor"}
          strokeOpacity={accent ? 0.85 : 0.2}
          vectorEffect="non-scaling-stroke"
          style={{ animationDelay: `${delay + (i % 8) * 0.07}s` }}
        />
      );
    });

  return (
    <svg
      className={`pointer-events-none absolute inset-0 -z-10 size-full ${className}`}
      viewBox="0 0 1600 1000"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      {rose(1190, 560, 32, 8, 0.2)}
      {rose(330, 150, 16, 4, 0.6)}
      <circle
        cx={1190}
        cy={560}
        r={150}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.35}
        strokeDasharray="2 6"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

const LINES = [
  { text: "Tracing how people,", indent: "pl-0" },
  { text: "information and objects", indent: "pl-[0.5em]" },
  { text: "moved through the", indent: "pl-[1em]" },
  { text: "premodern world.", indent: "pl-[1.5em]", serif: true },
];

/** "light" = paper background with an inverted photo; "dark" = the original night look. */
const TONE: "light" | "dark" = "light";

const TONES = {
  dark: {
    section: "bg-band text-on-dark",
    image: "",
    wash: "bg-[linear-gradient(90deg,rgb(0_0_0/0.72)_0%,rgb(0_0_0/0.35)_45%,rgb(0_0_0/0.05)_75%),linear-gradient(0deg,rgb(0_0_0/0.55)_0%,transparent_40%)]",
    lines: "text-on-dark",
    muted: "text-on-dark/70",
    body: "text-on-dark/90",
    primary: "bg-on-dark text-band hover:bg-rubric hover:text-on-dark",
  },
  light: {
    section: "bg-paper text-ink",
    // the photo as a negative: shadows turn to paper, map lines to ink
    image: "invert grayscale contrast-[1.25] brightness-[1.1] mix-blend-multiply opacity-75",
    wash: "bg-[linear-gradient(90deg,var(--paper)_0%,rgb(245_245_245/0.8)_40%,rgb(245_245_245/0.1)_75%),linear-gradient(0deg,rgb(245_245_245/0.85)_0%,transparent_45%)]",
    lines: "text-ink",
    muted: "text-ink-3",
    body: "text-ink-2",
    primary: "bg-ink text-paper hover:bg-rubric",
  },
}[TONE];

export function Hero() {
  return (
    // Slides up under the see-through header so the hero fills the top of the screen
    <section id="hero" className={`relative isolate -mt-(--header-h) overflow-hidden pt-(--header-h) ${TONES.section}`}>
      <Image
        src={hero}
        alt=""
        fill
        priority
        placeholder="blur"
        sizes="100vw"
        className={`-z-20 object-cover object-[68%_50%] ${TONES.image}`}
      />
      <div
        className={`absolute inset-0 -z-10 ${TONES.wash}`}
        aria-hidden
      />
      <CompassLines className={TONES.lines} />

      <div className="gutter flex min-h-[clamp(36rem,calc(100svh-var(--header-h)),58rem)] flex-col justify-between gap-12 py-8 lg:py-12">
        <div className={`label flex justify-between gap-4 ${TONES.muted}`}>
          <span>Wesleyan University · Digital Humanities Research</span>
        </div>

        <h1 className="display text-[clamp(2.1rem,7.4vw,4.2rem)] leading-[0.97] tracking-[-0.035em] lg:text-[clamp(2.25rem,4vw,4.2rem)]">
          {LINES.map((line, i) => (
            <span
              key={line.text}
              className={`rise block ${line.indent} ${line.serif ? "font-serif font-normal italic tracking-[-0.02em]" : ""}`}
              style={{ animationDelay: `${0.1 + i * 0.12}s` }}
            >
              {line.text}
            </span>
          ))}
        </h1>

        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <p className={`label md:col-span-5 ${TONES.muted}`}>Fig. 1 — The lab studies edicts, coins, seals, letters &amp; receipts</p>
          <div className="md:col-span-5 md:col-start-8">
            <p className={`text-[1.05rem] leading-relaxed sm:text-lg ${TONES.body}`}>
              The Traveler’s Lab is a Wesleyan-based international research network studying the movement of
              knowledge, messages, people and material objects before industrial travel.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-[0.95rem]">
              <Link
                href="/research"
                className={`inline-flex items-center gap-3 px-5 py-3 transition-colors ${TONES.primary}`}
              >
                Explore our research <span aria-hidden>→</span>
              </Link>
              <Link href="/people" className="underline decoration-1 underline-offset-[0.3em] hover:decoration-2">
                Meet the lab
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
