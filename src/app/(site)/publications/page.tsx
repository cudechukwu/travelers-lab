import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";

export const metadata: Metadata = { title: "Publications" };

export default function PublicationsPage() {
  return <ContentPage slug="publications" eyebrow="Publications" />;
}
