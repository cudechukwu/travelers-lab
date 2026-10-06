import type { Metadata } from "next";
import Image from "next/image";
import { PageHead } from "@/components/blocks";
import { getPeople, type Person } from "@/lib/content";

export const metadata: Metadata = {
  title: "Get involved",
  description:
    "How students and scholars can join the Travelers’ Lab, and which faculty to contact.",
  alternates: { canonical: "/get-involved" },
};

const PATHS = [
  {
    label: "Students",
    subject: "Joining the Travelers’ Lab",
    action: "Reach out",
    button: "bg-on-dark text-band hover:bg-rubric hover:text-on-dark",
    title: "Do real research as an undergraduate.",
    body: "Students join through research apprenticeships, Quantitative Analysis Center summer positions and courses such as Advanced Research in Digital History (COL 375). Students at any affiliated faculty member’s institution are welcome to reach out.",
  },
  {
    label: "Scholars",
    subject: "Collaborating with the Travelers’ Lab",
    action: "Send an email",
    button: "bg-rubric text-on-dark hover:bg-on-dark hover:text-band",
    title: "Collaborate across campuses.",
    body: "The lab is an open working group. We welcome scholars interested in travel and communication, and we aim to publish data on the movement of people, objects and information for others to use. Most of us are medievalists, but the lab isn’t limited to that period or to Europe.",
  },
];

function Portrait({ person }: { person: Person }) {
  const initials = person.name
    .split(/\s+/)
    .filter((w) => /^[A-Z]/.test(w))
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
  return (
    <div className="relative size-24 shrink-0 overflow-hidden rounded-full bg-paper-2 ring-1 ring-rule sm:size-28">
      {person.photo ? (
        <Image
          src={person.photo}
          alt={`Portrait of ${person.name}`}
          fill
          sizes="112px"
          className="object-cover object-top grayscale"
        />
      ) : (
        <span
          className="display flex size-full items-center justify-center text-2xl text-ink-3"
          aria-hidden
        >
          {initials}
        </span>
      )}
    </div>
  );
}

export default async function GetInvolvedPage() {
  const faculty = (await getPeople()).filter(
    (p) => p.group === "faculty" && !p.hideFromContact,
  );
  // The lab's first point of contact: the faculty member listed first on People
  const lead = faculty.find((f) => f.email);

  return (
    <>
      <PageHead
        title="Get involved"
        flip
        meta="Based at Wesleyan’s Quantitative Analysis Center"
        statement="We welcome connections and comments. *Write to one of the faculty below about collaboration or joining the lab.*"
      />

      <section className="bg-band text-on-dark">
        <div className="gutter grid gap-12 py-16 md:grid-cols-2 md:gap-16 lg:py-24">
          {PATHS.map((p) => (
            <div key={p.label}>
              <p className="label text-on-dark/70">
                <span className="text-rubric">¶</span> {p.label}
              </p>
              <h2 className="display mt-5 max-w-[16ch] text-[clamp(1.5rem,2.5vw,1.95rem)] leading-[1.05]">
                {p.title}
              </h2>
              <p className="mt-5 max-w-lg leading-relaxed text-on-dark/90">
                {p.body}
              </p>
              {lead?.email && (
                <div className="mt-8">
                  {/* Opens a filled-in message in Gmail on the web */}
                  <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(lead.email)}&su=${encodeURIComponent(p.subject)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-3 px-5 py-3.5 transition-colors ${p.button}`}
                  >
                    {p.action} <span aria-hidden>→</span>
                    <span className="sr-only"> (opens Gmail in a new tab)</span>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="gutter py-16 lg:py-24">
        <h2 className="label mb-10 text-ink-3">
          <span className="text-rubric">¶</span> Contact a faculty member
        </h2>
        <ul className="grid gap-x-16 gap-y-12 md:grid-cols-2">
          {faculty.map((f) => (
            <li key={f.slug} className="flex items-start gap-6 sm:gap-8">
              <Portrait person={f} />
              <div className="min-w-0 pt-1">
                <h3 className="display text-xl tracking-[-0.02em] lg:text-[1.4rem]">
                  {f.name}
                </h3>
                {f.role && (
                  <p className="mt-2 leading-snug text-ink-2">{f.role}</p>
                )}
                {f.institution && (
                  <p className="label mt-3 text-ink-3">{f.institution}</p>
                )}
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[0.95rem]">
                  {f.email && (
                    <a href={`mailto:${f.email}`} className="link-arrow">
                      {f.email}
                    </a>
                  )}
                  {f.url && (
                    <a href={f.url} className="link-arrow">
                      Profile <span aria-hidden>↗</span>
                    </a>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
