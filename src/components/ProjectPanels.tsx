"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Panels = Record<string, ReactNode>;
const PanelContext = createContext<{
  has: (slug: string) => boolean;
  open: (slug: string) => void;
} | null>(null);

const PARAM = "project";
const fromUrl = () => new URLSearchParams(window.location.search).get(PARAM);

/**
 * Opens a project in a side panel instead of leaving the page. The address
 * bar follows (?project=slug), so Back closes it and the link can be shared.
 * Without JavaScript, or with a modified click, links go to the full page.
 */
export function ProjectPanels({
  panels,
  children,
}: {
  panels: Panels;
  children: ReactNode;
}) {
  const [slug, setSlug] = useState<string | null>(null);
  const pushed = useRef(false);
  const dialog = useRef<HTMLDialogElement>(null);

  // Follow the address bar: on load, and on Back/Forward
  useEffect(() => {
    const sync = () => {
      const s = fromUrl();
      setSlug(s && s in panels ? s : null);
      if (!s) pushed.current = false;
    };
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, [panels]);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (slug && !d.open) d.showModal();
    if (!slug && d.open) d.close();
    if (slug) d.scrollTop = 0;
  }, [slug]);

  const open = useCallback((s: string) => {
    window.history.pushState(null, "", `?${PARAM}=${s}`);
    pushed.current = true;
    setSlug(s);
  }, []);

  const close = useCallback(() => {
    if (pushed.current) {
      window.history.back();
    } else {
      window.history.replaceState(null, "", window.location.pathname);
      setSlug(null);
    }
  }, []);

  const has = useCallback((s: string) => s in panels, [panels]);

  return (
    <PanelContext.Provider value={{ has, open }}>
      {children}
      <dialog
        ref={dialog}
        aria-labelledby="project-panel-title"
        // Escape: let us update the URL rather than closing the dialog directly
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        // A click on the dimmed area outside the panel lands on the dialog itself
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        className="project-panel fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto overscroll-contain bg-paper p-0 text-ink sm:w-[min(46rem,92vw)]"
      >
        <div className="sticky top-0 z-10 flex h-[var(--header-h)] items-stretch justify-between border-b border-rule bg-paper">
          <p className="label flex items-center px-5 text-ink-3 sm:px-8">
            Project
          </p>
          <button
            type="button"
            onClick={close}
            className="flex aspect-square h-full items-center justify-center bg-ink text-paper transition-colors hover:bg-rubric"
          >
            <span className="sr-only">Close</span>
            <svg
              viewBox="0 0 20 20"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              aria-hidden
            >
              <path d="M3 3l14 14M17 3L3 17" />
            </svg>
          </button>
        </div>
        {slug && panels[slug]}
      </dialog>
    </PanelContext.Provider>
  );
}

/** A link to a project. Inside <ProjectPanels> a plain click opens the panel; elsewhere it's an ordinary link. */
export function ProjectLink({
  slug,
  className,
  children,
}: {
  slug: string;
  className?: string;
  children: ReactNode;
}) {
  const ctx = useContext(PanelContext);
  return (
    <Link
      href={`/research/${slug}`}
      className={className}
      onClick={(e) => {
        if (
          !ctx?.has(slug) ||
          e.button !== 0 ||
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey
        )
          return;
        e.preventDefault();
        ctx.open(slug);
      }}
    >
      {children}
    </Link>
  );
}
