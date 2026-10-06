"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Shows the first few lines of a long abstract, with a button to read the rest. Short ones show in full. */
export function Abstract({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [long, setLong] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (el) setLong(el.scrollHeight > el.clientHeight + 4);
  }, []);

  return (
    <div>
      <div
        ref={ref}
        className={`relative overflow-hidden ${open ? "" : "max-h-[10.5em]"}`}
      >
        {children}
        {long && !open && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-paper"
            aria-hidden
          />
        )}
      </div>
      {long && (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="link-arrow mt-4 text-[0.95rem]"
        >
          {open ? "Show less" : "Read full abstract"}
          <span
            className={`transition-transform ${open ? "rotate-45" : ""}`}
            aria-hidden
          >
            +
          </span>
        </button>
      )}
    </div>
  );
}
