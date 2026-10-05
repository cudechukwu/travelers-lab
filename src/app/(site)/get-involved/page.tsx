import type { Metadata } from "next";
import { PageHead } from "@/components/blocks";
import { getPeople } from "@/lib/content";

export const metadata: Metadata = { title: "Get involved" };

export default async function GetInvolvedPage() {
  const faculty = (await getPeople()).filter((p) => p.group === "faculty");

  const paths = [
    {
      label: "Students",
      title: "Do real research as an undergraduate.",
      body: "Students join through research apprenticeships, Quantitative Analysis Center summer positions and courses such as Advanced Research in Digital History (COL 375). Students at any affiliated faculty member’s institution are welcome to reach out.",
    },
    {
      label: "Scholars",
      title: "Collaborate across campuses.",
      body: "The lab is an open working group. We welcome scholars interested in travel and communication, and we aim to publish data on the movement of people, objects and information for others to use. Most of us are medievalists, but the lab isn’t limited to that period or to Europe.",
    },
  ];

  return (
    <>
      <PageHead
        eyebrow="Get involved"
        title="Join the lab"
        intro="We welcome connections and comments. Send general enquiries, or specific requests about collaboration and participation, directly to one of the faculty below."
      />
      <section className="gutter grid border-b border-rule md:grid-cols-2">
        {paths.map((p, i) => (
          <div key={p.label} className={`py-12 lg:py-16 ${i ? "border-t border-rule md:border-l md:border-t-0 md:pl-10" : "md:pr-10"}`}>
            <p className="label text-ink-3">{p.label}</p>
            <h2 className="display mt-5 max-w-[16ch] text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[1.05]">{p.title}</h2>
            <p className="mt-5 max-w-lg leading-relaxed text-ink-2">{p.body}</p>
          </div>
        ))}
      </section>
      <section className="gutter py-14 lg:py-20">
        <h2 className="label mb-6 text-ink-3">Contact a faculty member</h2>
        <ul className="border-b border-rule">
          {faculty.map((f) => (
            <li key={f.slug} className="grid gap-1 border-t border-rule py-6 sm:grid-cols-12 sm:gap-6">
              <span className="display text-2xl tracking-[-0.02em] sm:col-span-5">{f.name}</span>
              <span className="text-ink-2 sm:col-span-5">
                {f.role}
                {f.institution ? `, ${f.institution}` : ""}
              </span>
              {f.url && (
                <a href={f.url} className="link-arrow text-[0.95rem] sm:col-span-2 sm:justify-self-end">
                  Profile <span aria-hidden>↗</span>
                </a>
              )}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
