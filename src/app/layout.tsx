import type { Metadata } from "next";
import { EB_Garamond, IBM_Plex_Mono, Inter_Tight } from "next/font/google";
import { INDEXABLE, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const interTight = Inter_Tight({ variable: "--font-inter-tight", subsets: ["latin"] });
const garamond = EB_Garamond({ variable: "--font-garamond", subsets: ["latin"], style: ["normal", "italic"] });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} · Wesleyan University`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_US" },
  // Kept out of search engines until SITE_INDEXABLE=true is set at launch (see src/lib/site.ts)
  robots: INDEXABLE ? { index: true, follow: true } : { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // The site uses the light palette everywhere; remove this to follow the visitor’s dark-mode setting
      data-theme="light"
      className={`${interTight.variable} ${garamond.variable} ${plexMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-svh flex-col">{children}</body>
    </html>
  );
}
