import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";

export const metadata: Metadata = {
  title: "Publications",
  description: "Articles, chapters and digital publications by members of the Travelers’ Lab.",
  alternates: { canonical: "/publications" },
};

export default function PublicationsPage() {
  return <ContentPage slug="publications" eyebrow="Publications" />;
}
