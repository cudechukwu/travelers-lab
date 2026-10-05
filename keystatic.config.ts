import { collection, config, fields } from "@keystatic/core";

// Local storage while developing; GitHub storage in production so editors
// can sign in at /keystatic and publish without touching code.
const storage =
  process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE === "github"
    ? ({
        kind: "github",
        repo: process.env.NEXT_PUBLIC_KEYSTATIC_REPO as `${string}/${string}`,
      } as const)
    : ({ kind: "local" } as const);

const body = (directory: string) =>
  fields.markdoc({
    label: "Content",
    options: {
      heading: [2, 3, 4],
      image: {
        directory: `public/media/${directory}`,
        publicPath: `/media/${directory}/`,
      },
    },
  });

export default config({
  storage,
  ui: {
    brand: { name: "Travelers’ Lab" },
    navigation: {
      Writing: ["posts"],
      Research: ["projects", "people"],
      Pages: ["pages"],
    },
  },
  collections: {
    posts: collection({
      label: "Blog posts",
      path: "content/posts/*",
      slugField: "title",
      format: { contentField: "content" },
      entryLayout: "content",
      columns: ["title", "date"],
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        date: fields.date({
          label: "Publish date",
          defaultValue: { kind: "today" },
          validation: { isRequired: true },
        }),
        authors: fields.array(fields.text({ label: "Name" }), {
          label: "Authors",
          itemLabel: (props) => props.value || "Author",
        }),
        project: fields.relationship({
          label: "Related project",
          description: "Optional — links the post to a project page.",
          collection: "projects",
        }),
        excerpt: fields.text({
          label: "Summary",
          description: "One or two sentences shown on the blog index. Leave blank to use the opening paragraph.",
          multiline: true,
        }),
        tags: fields.array(fields.text({ label: "Tag" }), {
          label: "Tags",
          itemLabel: (props) => props.value || "Tag",
        }),
        legacyPath: fields.text({
          label: "Old URL path",
          description: "Path on the previous WordPress site, used for redirects. Leave blank for new posts.",
        }),
        content: body("posts"),
      },
    }),

    projects: collection({
      label: "Projects",
      path: "content/projects/*",
      slugField: "title",
      format: { contentField: "content" },
      entryLayout: "content",
      columns: ["title", "status"],
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        shortTitle: fields.text({ label: "Short title", description: "Used on cards and in menus, e.g. “C-DER”." }),
        status: fields.select({
          label: "Status",
          options: [
            { label: "Active", value: "active" },
            { label: "Archived", value: "archived" },
          ],
          defaultValue: "active",
        }),
        order: fields.integer({ label: "Sort order", defaultValue: 50 }),
        summary: fields.text({ label: "One-line summary", multiline: true }),
        period: fields.text({ label: "Historical period", description: "e.g. “ca. 250–1453”" }),
        region: fields.text({ label: "Region", description: "e.g. “Constantinople”" }),
        startYear: fields.integer({
          label: "Timeline start (year CE)",
          description: "Approximate first year the project covers, for the research timeline.",
        }),
        endYear: fields.integer({ label: "Timeline end (year CE)" }),
        leads: fields.array(fields.text({ label: "Name" }), {
          label: "Project leads",
          itemLabel: (props) => props.value || "Lead",
        }),
        team: fields.array(fields.text({ label: "Name and role" }), {
          label: "Team",
          itemLabel: (props) => props.value || "Member",
        }),
        methods: fields.array(fields.text({ label: "Method or tool" }), {
          label: "Methods & tools",
          itemLabel: (props) => props.value || "Method",
        }),
        links: fields.array(
          fields.object({
            label: fields.text({ label: "Label" }),
            url: fields.url({ label: "URL" }),
          }),
          { label: "Links", itemLabel: (props) => props.fields.label.value || "Link" },
        ),
        legacyPath: fields.text({ label: "Old URL path" }),
        content: body("projects"),
      },
    }),

    pages: collection({
      label: "Pages",
      path: "content/pages/*",
      slugField: "title",
      format: { contentField: "content" },
      entryLayout: "content",
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        intro: fields.text({ label: "Intro", description: "Short lead paragraph under the page title.", multiline: true }),
        legacyPath: fields.text({ label: "Old URL path" }),
        content: body("pages"),
      },
    }),

    people: collection({
      label: "People",
      path: "content/people/*",
      slugField: "name",
      format: { data: "yaml" },
      columns: ["name", "group"],
      schema: {
        name: fields.slug({ name: { label: "Name" } }),
        group: fields.select({
          label: "Group",
          options: [
            { label: "Faculty", value: "faculty" },
            { label: "Network member", value: "network" },
            { label: "Current student", value: "student" },
            { label: "Alumni", value: "alumni" },
          ],
          defaultValue: "student",
        }),
        role: fields.text({ label: "Title / role" }),
        institution: fields.text({ label: "Institution" }),
        classYear: fields.text({ label: "Class year", description: "Students and alumni only." }),
        photo: fields.image({
          label: "Photo",
          directory: "public/media/people",
          publicPath: "/media/people/",
        }),
        email: fields.text({ label: "Email", description: "Shown on People and Get involved. Faculty only." }),
        hideFromContact: fields.checkbox({
          label: "Hide from “Contact a faculty member”",
          description: "Faculty only. They still appear on the People page.",
          defaultValue: false,
        }),
        url: fields.url({ label: "Profile link" }),
        bio: fields.text({ label: "Bio", multiline: true }),
        order: fields.integer({ label: "Sort order", defaultValue: 50 }),
      },
    }),
  },
});
