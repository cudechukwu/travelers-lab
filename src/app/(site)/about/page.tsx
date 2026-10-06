import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/ContentPage";

export const metadata: Metadata = {
  title: "About",
  description: "About the Travelers’ Lab, an open research group at Wesleyan University studying movement, travel and communication in the premodern world.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <ContentPage
      slug="about"
      eyebrow="About"
      aside={
        <div className="space-y-3 border-t border-rule pt-4 lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
          <p className="label text-ink-3">Based at</p>
          <p className="text-[0.95rem] text-ink-2">
            Quantitative Analysis Center
            <br />
            Wesleyan University, Middletown, CT
          </p>
          <Link href="/get-involved" className="link-arrow pt-3 text-[0.95rem]">
            Get involved <span aria-hidden>→</span>
          </Link>
        </div>
      }
    />
  );
}
