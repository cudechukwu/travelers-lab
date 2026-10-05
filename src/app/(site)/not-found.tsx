import Link from "next/link";

export default function NotFound() {
  return (
    <section className="gutter flex min-h-[60vh] flex-col justify-center py-24">
      <p className="label text-ink-3">404 — Off the map</p>
      <h1 className="display mt-6 max-w-[14ch] text-[clamp(2.25rem,4.9vw,4.2rem)] leading-[0.98] tracking-[-0.045em]">
        This road leads <span className="font-serif font-normal italic">nowhere.</span>
      </h1>
      <Link href="/" className="link-arrow mt-10 text-[0.95rem]">
        Back to the homepage <span aria-hidden>→</span>
      </Link>
    </section>
  );
}
