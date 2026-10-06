import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Crawling stays open even on the prototype: the "noindex" tag in the layout is
// what keeps pages out of results, and crawlers have to be able to read it.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/keystatic", "/api/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
