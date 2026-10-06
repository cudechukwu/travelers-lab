import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

// Tells search engines what this site is: a research organisation at Wesleyan
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ResearchOrganization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      alternateName: ["Traveler’s Lab", "Travelers Lab"],
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
      description: SITE_DESCRIPTION,
      parentOrganization: { "@type": "CollegeOrUniversity", name: "Wesleyan University", url: "https://www.wesleyan.edu" },
      address: { "@type": "PostalAddress", addressLocality: "Middletown", addressRegion: "CT", addressCountry: "US" },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA).replace(/</g, "\\u003c") }}
      />
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
