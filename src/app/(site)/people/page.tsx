import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHead } from "@/components/blocks";
import { Prose } from "@/components/Prose";
import { getPage, getPeople, isCurrentStudent, type Person } from "@/lib/content";

export const metadata: Metadata = { title: "People" };

function Initials({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .filter((w) => /^[A-Z]/.test(w))
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
  return (
    <div className="display flex size-full items-center justify-center text-3xl text-ink-3" aria-hidden>
      {initials}
    </div>
  );
}

function FacultyRow({ person }: { person: Person }) {
  return (
    <li className="grid gap-6 border-t border-rule py-8 sm:grid-cols-12 lg:py-10">
      <div className="relative aspect-[4/5] w-28 overflow-hidden bg-paper-2 sm:col-span-3 sm:w-auto lg:col-span-2">
        {person.photo ? (
          <Image
            src={person.photo}
            alt={`Portrait of ${person.name}`}
            fill
            sizes="(min-width: 1024px) 200px, (min-width: 640px) 25vw, 112px"
            className="object-cover object-top grayscale"
          />
        ) : (
          <Initials name={person.name} />
        )}
      </div>
      <div className="sm:col-span-9 lg:col-span-4">
        <h3 className="display text-2xl leading-tight tracking-[-0.02em] lg:text-[1.75rem]">
          {person.url ? (
            <a href={person.url} className="hover:text-rubric">
              {person.name}
              <span className="ml-2 text-base text-ink-3" aria-hidden>
                ↗
              </span>
            </a>
          ) : (
            person.name
          )}
        </h3>
        {person.role && <p className="mt-2 text-ink-2">{person.role}</p>}
        {person.institution && <p className="label mt-3 text-ink-3">{person.institution}</p>}
      </div>
      {person.bio && (
        <p className="font-serif text-[1.08rem] leading-relaxed text-ink-2 sm:col-span-9 sm:col-start-4 lg:col-span-6 lg:col-start-auto">
          {person.bio}
        </p>
      )}
    </li>
  );
}

function StudentRow({ person }: { person: Person }) {
  return (
    <li className="grid gap-2 border-t border-rule py-6 sm:grid-cols-12 sm:gap-6">
      <div className="sm:col-span-4">
        <h3 className="display text-xl tracking-[-0.02em]">{person.name}</h3>
        <p className="label mt-2 text-ink-3">Class of {person.classYear}</p>
      </div>
      <p className="text-[0.95rem] text-ink-2 sm:col-span-3">{person.role}</p>
      {person.bio && <p className="text-[0.95rem] leading-relaxed text-ink-2 sm:col-span-5">{person.bio}</p>}
    </li>
  );
}

function Group({ id, title, count, children }: { id: string; title: string; count: number; children: React.ReactNode }) {
  return (
    <section id={id} className="gutter scroll-mt-20 py-14 lg:py-20">
      <div className="mb-6 flex items-baseline justify-between gap-6">
        <h2 className="display text-[clamp(2rem,4vw,3.25rem)] leading-none">{title}</h2>
        <p className="label text-ink-3">{count}</p>
      </div>
      {children}
    </section>
  );
}

export default async function PeoplePage() {
  const [people, alumniPage] = await Promise.all([getPeople(), getPage("alumni")]);
  const faculty = people.filter((p) => p.group === "faculty");
  const network = people.filter((p) => p.group === "network");
  const students = people.filter((p) => isCurrentStudent(p));
  const recentAlumni = people
    .filter((p) => p.group === "alumni" || (p.group === "student" && !isCurrentStudent(p)))
    .sort((a, b) => (b.classYear ?? "").localeCompare(a.classYear ?? ""));
  const alumniBody = alumniPage ? (await alumniPage.content()).node : null;

  const jump = [
    { id: "faculty", label: "Faculty" },
    { id: "network", label: "Network" },
    { id: "students", label: "Students" },
    { id: "alumni", label: "Alumni" },
  ];

  return (
    <>
      <PageHead
        eyebrow="People"
        title="The lab"
        intro="Faculty and students across several campuses, united by shared puzzles about movement and communication. To get involved, reach out to any of the faculty below."
      >
        <nav aria-label="On this page" className="label mt-10 flex flex-wrap gap-x-6 gap-y-3 text-ink-2">
          {jump.map((j) => (
            <a key={j.id} href={`#${j.id}`} className="hover:text-rubric">
              {j.label} ↓
            </a>
          ))}
        </nav>
      </PageHead>

      <Group id="faculty" title="Faculty" count={faculty.length}>
        <ul className="border-b border-rule">
          {faculty.map((p) => (
            <FacultyRow key={p.slug} person={p} />
          ))}
        </ul>
      </Group>

      <Group id="network" title="Network members" count={network.length}>
        <ul className="border-b border-rule">
          {network.map((p) => (
            <FacultyRow key={p.slug} person={p} />
          ))}
        </ul>
      </Group>

      <Group id="students" title="Current students" count={students.length}>
        {students.length ? (
          <ul className="border-b border-rule">
            {students.map((p) => (
              <StudentRow key={p.slug} person={p} />
            ))}
          </ul>
        ) : (
          <p className="text-ink-2">
            Student researchers for this year will be listed soon.{" "}
            <Link href="/get-involved" className="underline underline-offset-4 hover:text-rubric">
              Interested in joining?
            </Link>
          </p>
        )}
      </Group>

      <Group id="alumni" title="Alumni" count={recentAlumni.length}>
        {recentAlumni.length > 0 && (
          <ul className="border-b border-rule">
            {recentAlumni.map((p) => (
              <StudentRow key={p.slug} person={p} />
            ))}
          </ul>
        )}
        {alumniBody && (
          <details className="group mt-10 border-t border-rule pt-6">
            <summary className="label flex cursor-pointer list-none items-center justify-between text-ink-2 hover:text-rubric">
              Earlier lab alumni, 2016 onward
              <span className="transition-transform group-open:rotate-45" aria-hidden>
                +
              </span>
            </summary>
            <div className="mt-8 lg:grid lg:grid-cols-12">
              <Prose node={alumniBody} className="lg:col-span-8 lg:col-start-4" />
            </div>
          </details>
        )}
      </Group>
    </>
  );
}
