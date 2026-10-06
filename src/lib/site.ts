/**
 * Site-wide settings for search engines. Set these in the hosting dashboard:
 *
 *   NEXT_PUBLIC_SITE_URL   the public address, e.g. https://travelerslab.research.wesleyan.edu
 *   SITE_INDEXABLE=true    lets search engines list the site (leave unset while it's a prototype)
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://travelers-lab.vercel.app").replace(/\/$/, "");
export const INDEXABLE = process.env.SITE_INDEXABLE === "true";

export const SITE_NAME = "Travelers’ Lab";
export const SITE_DESCRIPTION =
  "An international research collaboration based at Wesleyan University, studying the movement of information, people and objects before industrial travel.";
