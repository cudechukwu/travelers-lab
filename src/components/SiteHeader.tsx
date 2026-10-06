"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV } from "@/lib/nav";
import { Search } from "./Search";
import { WindRose } from "./WindRose";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  // On the homepage the header is see-through over the hero, then turns solid once you scroll past it
  const [pastHero, setPastHero] = useState(false);
  const overHero = pathname === "/";
  useEffect(() => {
    if (!overHero) return;
    const update = () => {
      const hero = document.getElementById("hero");
      setPastHero(!hero || hero.getBoundingClientRect().bottom <= 56);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [overHero]);
  const transparent = overHero && !pastHero && !open;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={`site-header sticky top-0 z-50 border-b text-ink transition-colors duration-300 ${
          transparent
            ? "border-transparent bg-transparent"
            : "border-rule bg-paper/95 backdrop-blur-sm"
        }`}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:bg-ink focus:px-3 focus:py-2 focus:text-paper"
        >
          Skip to content
        </a>
        <div className="flex h-(--header-h) items-stretch">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex shrink-0 items-center gap-2.5 pl-5 pr-6 sm:pl-8 lg:pl-14 xl:pl-20"
          >
            <WindRose className="size-5 text-rubric" />
            <span className="display text-[1.05rem] tracking-[-0.02em]">
              Travelers’ Lab
            </span>
          </Link>

          <nav
            aria-label="Main"
            className="hidden flex-1 items-center justify-center lg:flex"
          >
            <ul className="flex gap-7 text-[0.9rem]">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className="relative py-1 text-ink-2 transition-colors hover:text-ink aria-[current=page]:text-ink aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-0 aria-[current=page]:after:-bottom-0.5 aria-[current=page]:after:h-px aria-[current=page]:after:bg-rubric"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-stretch">
            <Search tone={transparent ? "clear" : "light"} />
            <Link
              href="/get-involved"
              className="hidden items-center gap-3 bg-ink px-6 text-[0.9rem] text-paper transition-colors hover:bg-rubric sm:flex"
            >
              Get involved <span aria-hidden>→</span>
            </Link>
            <button
              type="button"
              className={`flex items-center gap-2 border-l px-4 text-[0.9rem] sm:px-6 lg:hidden ${transparent ? "border-transparent" : "border-rule"}`}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
            >
              <span className="relative block h-2.5 w-4" aria-hidden>
                <span
                  className={`absolute left-0 h-px w-4 bg-current transition-transform ${open ? "top-1.25 rotate-45" : "top-0"}`}
                />
                <span
                  className={`absolute left-0 h-px w-4 bg-current transition-transform ${open ? "top-1.25 -rotate-45" : "top-2.5"}`}
                />
              </span>
              {open ? "Close" : "Menu"}
            </button>
          </div>
        </div>
      </header>

      {/* Rendered outside <header>: its backdrop blur would otherwise trap this fixed panel inside the bar */}
      {open && (
        <div
          id="mobile-menu"
          className="site-header fixed text-ink inset-x-0 bottom-0 top-(--header-h) z-40 flex flex-col overflow-y-auto bg-paper lg:hidden"
        >
          <nav aria-label="Mobile" className="gutter flex-1 py-6">
            <ul className="divide-y divide-rule border-y border-rule">
              {NAV.map((item, i) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className="flex items-baseline justify-between py-4 aria-[current=page]:text-rubric"
                  >
                    <span className="display text-3xl">{item.label}</span>
                    <span className="label text-ink-3">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/get-involved"
              onClick={() => setOpen(false)}
              className="mt-8 flex items-center justify-between bg-ink px-5 py-4 text-paper"
            >
              Get involved <span aria-hidden>→</span>
            </Link>
          </nav>
          <p className="label gutter pb-6 text-ink-3">
            41.55°N 72.66°W · Middletown, CT
          </p>
        </div>
      )}
    </>
  );
}
