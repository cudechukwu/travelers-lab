import type { MetadataRoute } from "next";
import { getPosts, getProjects } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts] = await Promise.all([getProjects(), getPosts()]);
  const pages = ["", "/research", "/blog", "/people", "/teaching", "/publications", "/about", "/get-involved"];
  return [
    ...pages.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...projects.map((p) => ({ url: `${SITE_URL}/research/${p.slug}` })),
    ...posts.map((p) => ({ url: `${SITE_URL}/blog/${p.slug}`, lastModified: p.date ?? undefined })),
  ];
}
