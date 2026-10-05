import type { NextConfig } from "next";
import legacyRedirects from "./content/redirects.json";

const nextConfig: NextConfig = {
  // Pages rendered on request (e.g. /blog with its project filter) read the
  // content files at runtime, so ship them with every route on Vercel.
  outputFileTracingIncludes: {
    "/**": ["./content/**/*"],
  },
  // Old WordPress URLs (linked from DOIs, papers and other sites) keep working
  async redirects() {
    return legacyRedirects
      .map(({ source, destination }) => ({
        source: source.replace(/\/$/, "") || "/",
        destination,
        permanent: true,
      }))
      .filter((r) => r.source !== r.destination.split("#")[0]);
  },
};

export default nextConfig;
