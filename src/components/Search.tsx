"use client";

import type MiniSearch from "minisearch";
import type { SearchResult } from "minisearch";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { SearchDoc, SearchKind } from "@/lib/search";

const GROUPS: { kind: SearchKind; label: string }[] = [
  { kind: "Project", label: "Projects" },
  { kind: "Publication", label: "Publications" },
  { kind: "Person", label: "People" },
  { kind: "Blog", label: "Blog" },
  { kind: "Page", label: "Pages" },
];
const PER_GROUP = 5;
const SUGGESTIONS = [
  "Constantinople",
  "Aragon",
  "Theophanes",
  "Byzantine seals",
  "GIS",
  "Datini letters",
];

type Hit = SearchResult & SearchDoc;

/** The index and search engine load the first time the panel opens, so pages stay light. */
type Engine = { ms: MiniSearch<SearchDoc>; docs: SearchDoc[] };
let engine: Promise<Engine> | null = null;
function loadEngine() {
  engine ??= Promise.all([
    import("minisearch"),
    fetch("/search-index.json").then((r) => r.json()),
  ]).then(
    ([{ default: MiniSearch }, docs]: [
      { default: typeof import("minisearch").default },
      SearchDoc[],
    ]) => {
      const ms = new MiniSearch<SearchDoc>({
        fields: ["title", "keywords", "meta", "text"],
        storeFields: ["kind", "title", "url", "meta", "text"],
        searchOptions: {
          boost: { title: 4, keywords: 2, meta: 1.5 },
          prefix: true,
          fuzzy: (term) => (term.length > 4 ? 0.2 : false),
          combineWith: "AND",
        },
      });
      ms.addAll(docs);
      return { ms, docs };
    },
  );
  engine.catch(() => (engine = null));
  return engine;
}

/** Every word must match; if that finds nothing, any word will do. */
function find(ms: MiniSearch<SearchDoc>, q: string) {
  const found = ms.search(q) as Hit[];
  return found.length ? found : (ms.search(q, { combineWith: "OR" }) as Hit[]);
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Wraps each word that starts with a matched term in red, whole word, so "Chronicles" never reads half-red. */
function highlight(text: string, terms: string[]): ReactNode {
  if (!terms.length) return text;
  const re = new RegExp(
    `(\\b(?:${terms.map(escape).join("|")})[\\p{L}\\p{N}’'-]*)`,
    "giu",
  );
  return text.split(re).map((part, i) =>
    i % 2 ? (
      <mark key={i} className="bg-transparent text-rubric">
        {part}
      </mark>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

/** A line of the text around the first match, cut at word boundaries. */
function snippet(text: string, terms: string[], length = 170) {
  if (!text) return "";
  const lower = text.toLowerCase();
  const at = Math.min(
    ...terms.map((t) => lower.indexOf(t.toLowerCase())).filter((i) => i >= 0),
    Infinity,
  );
  if (!Number.isFinite(at) || at < length / 2) {
    return text.length > length
      ? `${text.slice(0, text.lastIndexOf(" ", length))}…`
      : text;
  }
  const start = text.indexOf(" ", at - length / 3) + 1;
  const end = text.lastIndexOf(" ", start + length);
  return `…${text.slice(start, end > start ? end : start + length)}…`;
}

const Magnifier = ({
  className = "size-[1.05rem]",
}: {
  className?: string;
}) => (
  <svg
    viewBox="0 0 20 20"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    aria-hidden
  >
    <circle cx="8.5" cy="8.5" r="6" />
    <path d="M13 13l5 5" />
  </svg>
);

type Filter = SearchKind | "All";

export function Search({ tone }: { tone: "light" | "clear" }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [data, setData] = useState<Engine | null>(null);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(0);
  const [filter, setFilter] = useState<Filter>("All");

  const show = useCallback(() => {
    setOpen(true);
    setFailed(false);
    loadEngine().then(setData, () => setFailed(true));
  }, []);
  const hide = useCallback(() => setOpen(false), []);

  // "/" or Cmd/Ctrl+K opens search from anywhere, unless you're typing in a field
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      const typing =
        el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);
      if (
        (e.key === "/" && !typing) ||
        (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey))
      ) {
        e.preventDefault();
        show();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [show]);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      input.current?.select();
    }
    if (!open && d.open) d.close();
  }, [open]);

  const status = failed ? "error" : data ? "ready" : "loading";
  const q = query.trim();

  const hits = useMemo(
    () => (data && q ? find(data.ms, q).slice(0, 120) : []),
    [data, q],
  );

  // With no query, a category lists everything in it, so search doubles as an index of the site
  const browse = useMemo(
    () =>
      data && !q && filter !== "All"
        ? (data.docs
            .filter((d) => d.kind === filter)
            .map((d) => ({ ...d, terms: [] as string[] }))
            .sort((a, b) =>
              filter === "Blog" ? 0 : a.title.localeCompare(b.title),
            ) as unknown as Hit[])
        : [],
    [data, q, filter],
  );

  const counts = useMemo(() => {
    const source: { kind: SearchKind }[] = q ? hits : (data?.docs ?? []);
    const c = Object.fromEntries(GROUPS.map((g) => [g.kind, 0])) as Record<
      SearchKind,
      number
    >;
    for (const d of source) c[d.kind] += 1;
    return c;
  }, [q, hits, data]);

  const suggestions = useMemo(
    () =>
      data ? SUGGESTIONS.map((s) => ({ s, n: find(data.ms, s).length })) : [],
    [data],
  );

  const groups = useMemo(() => {
    const pool = q ? hits : browse;
    return GROUPS.filter((g) => filter === "All" || g.kind === filter)
      .map((g) => {
        const all = pool.filter((h) => h.kind === g.kind);
        return {
          ...g,
          all,
          shown: filter === "All" ? all.slice(0, PER_GROUP) : all,
        };
      })
      .filter((g) => g.all.length);
  }, [q, hits, browse, filter]);
  const flat = useMemo(() => groups.flatMap((g) => g.shown), [groups]);

  const type = (value: string) => {
    setQuery(value);
    setActive(0);
  };
  const pick = (f: Filter) => {
    setFilter(f);
    setActive(0);
    input.current?.focus();
  };

  const go = (hit: Hit | undefined) => {
    if (!hit) return;
    hide();
    router.push(hit.url);
  };

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(flat[active]);
    }
  };

  useEffect(() => {
    document
      .getElementById(`search-hit-${active}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const categories: { kind: Filter; label: string; n: number }[] = [
    {
      kind: "All",
      label: "Everything",
      n: q ? hits.length : (data?.docs.length ?? 0),
    },
    ...GROUPS.map((g) => ({
      kind: g.kind as Filter,
      label: g.label,
      n: counts[g.kind],
    })),
  ];

  return (
    <>
      {/* Wide screens: a field-shaped button. Narrow screens: just the magnifier. */}
      <button
        type="button"
        onClick={show}
        className={`hidden items-center gap-2.5 self-center px-3.5 py-2 text-[0.9rem] text-ink-3 transition-colors hover:text-ink-2 lg:mr-4 lg:flex lg:w-52 xl:w-64 ${
          tone === "clear"
            ? "bg-ink/[0.06] backdrop-blur-sm hover:bg-ink/[0.09]"
            : "bg-ink/[0.05] hover:bg-ink/[0.08]"
        }`}
      >
        <Magnifier />
        <span className="flex-1 text-left">Search</span>
        <kbd className="border border-rule px-1.5 font-mono text-[0.75rem] leading-5 text-ink-3">
          /
        </kbd>
      </button>
      <button
        type="button"
        onClick={show}
        className={`flex items-center border-l px-4 text-ink-2 sm:px-5 lg:hidden ${
          tone === "clear" ? "border-transparent" : "border-rule"
        }`}
      >
        <Magnifier />
        <span className="sr-only">Search</span>
      </button>

      <dialog
        ref={dialog}
        aria-label="Search the site"
        onClose={hide}
        // Clicks outside the card land on the dialog itself
        onClick={(e) => e.target === e.currentTarget && hide()}
        className="search-panel fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 text-ink"
      >
        <div className="mx-auto mt-2 flex max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-[1400px] flex-col border border-rule bg-paper/85 shadow-[0_30px_80px_-30px_rgb(0_0_0/0.45)] backdrop-blur-2xl backdrop-saturate-150 sm:mt-3 sm:w-[calc(100%-1.5rem)] lg:max-h-[min(44rem,calc(100dvh-2rem))]">
          {/* Search field */}
          <div className="flex shrink-0 gap-2 p-2">
            <label className="flex h-12 flex-1 items-center gap-3 bg-ink/[0.06] px-4 text-ink-3 focus-within:bg-ink/[0.08]">
              <Magnifier />
              <span className="sr-only">Search</span>
              <input
                ref={input}
                id="site-search"
                type="search"
                role="combobox"
                aria-expanded={flat.length > 0}
                aria-controls="search-results"
                aria-activedescendant={
                  flat.length ? `search-hit-${active}` : undefined
                }
                autoComplete="off"
                spellCheck={false}
                placeholder="Search projects, people, publications and the blog"
                value={query}
                onChange={(e) => type(e.target.value)}
                onKeyDown={onInputKey}
                className="no-focus-ring min-w-0 flex-1 bg-transparent text-[1.05rem] text-ink placeholder:text-ink-3 [&::-webkit-search-cancel-button]:hidden"
              />
            </label>
            <button
              type="button"
              onClick={hide}
              className="flex size-12 shrink-0 items-center justify-center bg-ink text-paper transition-colors hover:bg-rubric"
            >
              <span className="sr-only">Close search</span>
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

          <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
            {/* Categories: a column on wide screens, a scrolling row on phones */}
            <nav
              aria-label="Filter results"
              className="shrink-0 px-2 pb-2 lg:w-60 lg:pb-4"
            >
              <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
                {categories.map((c) => (
                  <li key={c.kind} className="shrink-0">
                    <button
                      type="button"
                      aria-pressed={filter === c.kind}
                      onClick={() => pick(c.kind)}
                      disabled={!!q && c.kind !== "All" && c.n === 0}
                      className={`flex w-full items-center justify-between gap-4 px-3.5 py-2.5 text-left text-[0.95rem] transition-colors disabled:opacity-35 ${
                        filter === c.kind
                          ? "bg-paper text-ink shadow-[0_1px_0_var(--rule)]"
                          : "text-ink-2 hover:bg-ink/[0.04] hover:text-ink"
                      }`}
                    >
                      {c.label}
                      <span className="font-mono text-[0.78rem] tabular-nums text-ink-3">
                        {c.n}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Results */}
            <div
              id="search-results"
              role="listbox"
              aria-label="Results"
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-4 lg:pl-4 lg:pr-6"
            >
              {status === "loading" && (
                <p className="label px-3 py-3 text-ink-3">Loading…</p>
              )}
              {status === "error" && (
                <p className="px-3 py-3 text-ink-2">
                  Search couldn’t load. Check your connection and try again.
                </p>
              )}

              {status === "ready" && !q && filter === "All" && (
                <div>
                  <p className="label px-3 pb-2 pt-3 text-ink-3">Suggested</p>
                  <ul>
                    {suggestions.map(({ s, n }) => (
                      <li key={s}>
                        <button
                          type="button"
                          onClick={() => {
                            type(s);
                            input.current?.focus();
                          }}
                          className="flex w-full items-center justify-between px-3 py-2.5 text-left text-[1rem] transition-colors hover:bg-ink/[0.04]"
                        >
                          {s}
                          <span className="font-mono text-[0.78rem] tabular-nums text-ink-3">
                            {n}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 hidden px-3 text-[0.88rem] text-ink-3 sm:block">
                    Press <kbd className="font-mono text-[0.85em]">/</kbd> on
                    any page to search ·{" "}
                    <kbd className="font-mono text-[0.85em]">↑</kbd>{" "}
                    <kbd className="font-mono text-[0.85em]">↓</kbd> and{" "}
                    <kbd className="font-mono text-[0.85em]">Enter</kbd> to
                    choose · <kbd className="font-mono text-[0.85em]">Esc</kbd>{" "}
                    to close
                  </p>
                </div>
              )}

              {status === "ready" && q && !flat.length && (
                <p className="px-3 py-3 text-ink-2">
                  Nothing matches “{q}”. Try a place, a person or a project
                  name.
                </p>
              )}

              {groups.map((g) => (
                <section key={g.kind} className="pt-3 first:pt-0">
                  {filter === "All" && (
                    <h2 className="label flex items-baseline justify-between px-3 pb-2 pt-3 text-ink-3">
                      {g.label}
                      {g.all.length > PER_GROUP && (
                        <button
                          type="button"
                          onClick={() => pick(g.kind)}
                          className="text-ink-2 transition-colors hover:text-rubric"
                        >
                          All {g.all.length} →
                        </button>
                      )}
                    </h2>
                  )}
                  <ul>
                    {g.shown.map((hit) => {
                      const i = flat.indexOf(hit);
                      const terms = [...new Set(hit.terms)];
                      return (
                        <li key={hit.id}>
                          <Link
                            id={`search-hit-${i}`}
                            role="option"
                            aria-selected={i === active}
                            href={hit.url}
                            onClick={hide}
                            onMouseMove={() => setActive(i)}
                            className={`grid gap-x-6 gap-y-1 px-3 py-3 transition-colors md:grid-cols-10 ${
                              i === active ? "bg-ink/[0.05]" : ""
                            }`}
                          >
                            <span className="md:col-span-4">
                              <span className="display block text-[1.05rem] leading-snug tracking-[-0.015em]">
                                {highlight(hit.title, terms)}
                              </span>
                              {hit.meta && (
                                <span className="mt-0.5 block text-[0.86rem] text-ink-3">
                                  {hit.meta}
                                </span>
                              )}
                            </span>
                            {hit.text && (
                              <span className="font-serif text-[0.98rem] leading-snug text-ink-2 md:col-span-6">
                                {highlight(
                                  snippet(hit.text, terms, q ? 170 : 130),
                                  terms,
                                )}
                              </span>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
