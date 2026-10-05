import "server-only";
import { cache } from "react";
import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "../../keystatic.config";

const reader = createReader(process.cwd(), keystaticConfig);

export const getPosts = cache(async () => {
  const posts = await reader.collections.posts.all();
  return posts
    .map(({ slug, entry }) => ({ slug, ...entry }))
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
});
export type Post = Awaited<ReturnType<typeof getPosts>>[number];

export const getPost = cache(async (slug: string) => {
  const entry = await reader.collections.posts.read(slug);
  return entry ? { slug, ...entry } : null;
});

export const getProjects = cache(async () => {
  const projects = await reader.collections.projects.all();
  return projects
    .map(({ slug, entry }) => ({ slug, ...entry }))
    .sort((a, b) => (a.order ?? 50) - (b.order ?? 50));
});
export type Project = Awaited<ReturnType<typeof getProjects>>[number];

export const getProject = cache(async (slug: string) => {
  const entry = await reader.collections.projects.read(slug);
  return entry ? { slug, ...entry } : null;
});

export const getPeople = cache(async () => {
  const people = await reader.collections.people.all();
  return people
    .map(({ slug, entry }) => ({ slug, ...entry }))
    .sort((a, b) => (a.order ?? 50) - (b.order ?? 50));
});
export type Person = Awaited<ReturnType<typeof getPeople>>[number];

export const getPage = cache(async (slug: string) => {
  const entry = await reader.collections.pages.read(slug);
  return entry ? { slug, ...entry } : null;
});

/**
 * Students move to alumni automatically once their class has graduated
 * (class of 2026 → alumni from June 2026), so the page never goes stale.
 */
export function isCurrentStudent(person: Person, now = new Date()) {
  if (person.group !== "student") return false;
  const year = parseInt(person.classYear ?? "", 10);
  if (!year) return true;
  const graduatingClass = now.getMonth() >= 5 ? now.getFullYear() + 1 : now.getFullYear();
  return year >= graduatingClass;
}

export function formatDate(iso: string | null, style: "long" | "short" = "long") {
  if (!iso) return "";
  const date = new Date(`${iso}T12:00:00Z`);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: style === "long" ? "long" : "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
