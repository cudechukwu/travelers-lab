import { buildSearchIndex } from "@/lib/search";

// Built once when the site is built; the search panel downloads it the first time it opens
export const dynamic = "force-static";

export async function GET() {
  return Response.json(await buildSearchIndex());
}
