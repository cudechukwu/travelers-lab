import Image from "next/image";
import Link from "next/link";
import hero from "@/assets/hero.jpg";

/**
 * Rhumb lines radiating from two wind roses, as on a portolan chart.
 * Purely decorative, drawn in once on load.
 */
function CompassLines() {
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
      className="pointer-events-none absolute inset-0 -z-10 size-full text-on-dark"
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

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#0d0d0c] text-on-dark">
      <Image
        src={hero}
        alt=""
        fill
        priority
        placeholder="blur"
        sizes="100vw"
        className="-z-20 object-cover object-[68%_50%]"
      />
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(0_0_0/0.72)_0%,rgb(0_0_0/0.35)_45%,rgb(0_0_0/0.05)_75%),linear-gradient(0deg,rgb(0_0_0/0.55)_0%,transparent_40%)]"
        aria-hidden
      />
      <CompassLines />

      <div className="gutter flex min-h-[clamp(36rem,calc(100svh-var(--header-h)),58rem)] flex-col justify-between gap-12 py-8 lg:py-12">
        <div className="label flex justify-between gap-4 text-on-dark/70">
          <span>Wesleyan University · Digital Humanities Research</span>
          <span className="hidden sm:inline">41.55°N 72.66°W</span>
        </div>

        <h1 className="display text-[clamp(2.4rem,8.4vw,6rem)] leading-[0.95] tracking-[-0.04em] lg:text-[clamp(3rem,5.6vw,6rem)]">
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
          <p className="label text-on-dark/70 md:col-span-5">Fig. 1 — The lab studies edicts, coins, seals, letters &amp; receipts</p>
          <div className="md:col-span-5 md:col-start-8">
            <p className="text-[1.05rem] leading-relaxed text-on-dark/90 sm:text-lg">
              The Traveler’s Lab is a Wesleyan-based international research network studying the movement of
              knowledge, messages, people and material objects before industrial travel.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-[0.95rem]">
              <Link
                href="/research"
                className="inline-flex items-center gap-3 bg-on-dark px-5 py-3 text-[#161513] transition-colors hover:bg-rubric hover:text-on-dark"
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
