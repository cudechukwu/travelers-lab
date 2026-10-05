import type { NextConfig } from "next";
import legacyRedirects from "./content/redirects.json";

const nextConfig: NextConfig = {
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
