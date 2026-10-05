import Link from "next/link";
import { NAV } from "@/lib/nav";
import { WindRose } from "./WindRose";

const PARTNERS = [
  { label: "Wesleyan University", href: "https://www.wesleyan.edu" },
  { label: "Quantitative Analysis Center", href: "https://www.wesleyan.edu/qac/" },
  { label: "WesGIS", href: "https://wesgis.blogs.wesleyan.edu/" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-rule">
      <div className="gutter grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="max-w-sm text-ink-2">
            A multi-campus research hub at Wesleyan University for the movement of information, people and
            objects before industrial travel.
          </p>
          <Link href="/get-involved" className="link-arrow mt-5 text-[0.95rem]">
            Get involved <span aria-hidden>→</span>
          </Link>
        </div>
        <nav aria-label="Footer" className="lg:col-span-3 lg:col-start-7">
          <p className="label mb-4 text-ink-3">The lab</p>
          <ul className="space-y-2 text-[0.95rem]">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-rubric">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="lg:col-span-3">
          <p className="label mb-4 text-ink-3">Supported by</p>
          <ul className="space-y-2 text-[0.95rem]">
            {PARTNERS.map((p) => (
              <li key={p.href}>
                <a href={p.href} className="hover:text-rubric">
                  {p.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="gutter overflow-hidden" aria-hidden>
        <p className="display flex items-end gap-[0.12em] whitespace-nowrap text-[clamp(3.5rem,13.5vw,12.5rem)] leading-[0.8] tracking-[-0.055em]">
          Travelers’ Lab
          <WindRose className="mb-[0.06em] size-[0.42em] shrink-0 text-rubric" />
        </p>
      </div>

      <div className="gutter label flex flex-wrap justify-between gap-3 border-t border-rule py-5 text-ink-3">
        <span>© {new Date().getFullYear()} Wesleyan University</span>
        <span>41.5556°N 72.6566°W · Middletown, Connecticut</span>
      </div>
    </footer>
  );
}
