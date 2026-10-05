import type { Metadata } from "next";
import { EB_Garamond, IBM_Plex_Mono, Inter_Tight } from "next/font/google";
import "./globals.css";

const interTight = Inter_Tight({ variable: "--font-inter-tight", subsets: ["latin"] });
const garamond = EB_Garamond({ variable: "--font-garamond", subsets: ["latin"], style: ["normal", "italic"] });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  title: {
    default: "Travelers’ Lab · Wesleyan University",
    template: "%s · Travelers’ Lab",
  },
  description:
    "An international research collaboration based at Wesleyan University, studying the movement of information, people and objects before industrial travel.",
  // Prototype: keep it out of search engines until the lab approves it
  robots: { index: false, follow: false },
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
