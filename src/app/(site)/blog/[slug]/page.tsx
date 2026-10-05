import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Prose } from "@/components/Prose";
import { formatDate, getPost, getPosts, getProjects } from "@/lib/content";

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getPost(slug);
  return post ? { title: post.title, description: post.excerpt } : {};
}

export default async function PostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const [post, posts, projects] = await Promise.all([getPost(slug), getPosts(), getProjects()]);
  if (!post) notFound();

  const { node } = await post.content();
  const project = projects.find((p) => p.slug === post.project);
  const index = posts.findIndex((p) => p.slug === slug);
  const newer = posts[index - 1];
  const older = posts[index + 1];

  return (
    <article>
      <header className="gutter border-b border-rule pb-12 pt-14 lg:pb-16 lg:pt-24">
        <nav aria-label="Breadcrumb" className="label text-ink-3">
          <Link href="/blog" className="hover:text-rubric">
            Lab notes
          </Link>
          {project && (
            <>
              <span className="px-2">/</span>
              <Link href={`/blog?project=${project.slug}`} className="hover:text-rubric">
                {project.shortTitle}
              </Link>
            </>
          )}
        </nav>
        <h1 className="display mt-8 max-w-[24ch] text-[clamp(2.25rem,5vw,4.5rem)] leading-[1.02] tracking-[-0.04em]">
          {post.title}
        </h1>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.95rem] text-ink-2">
          {post.authors.length > 0 && <span>By {post.authors.join(", ")}</span>}
          <time dateTime={post.date ?? undefined} className="label text-ink-3">
            {formatDate(post.date)}
          </time>
        </div>
      </header>

      <div className="gutter grid gap-12 py-14 lg:grid-cols-12 lg:py-20">
        <div className="lg:col-span-8 lg:col-start-3">
          <Prose node={node} />
        </div>
        {project && (
          <aside className="lg:col-span-2">
            <Link
              href={`/research/${project.slug}`}
              className="group block border-t border-rule pt-4 lg:sticky lg:top-[calc(var(--header-h)+2rem)]"
            >
              <span className="label text-ink-3">Project</span>
              <span className="display mt-2 block text-lg leading-tight group-hover:text-rubric">
                {project.shortTitle}
              </span>
              <span className="mt-2 block text-[0.9rem] text-ink-3">{project.summary}</span>
            </Link>
          </aside>
        )}
      </div>

      <nav aria-label="More posts" className="grid border-t border-rule sm:grid-cols-2">
        {[
          { post: older, label: "Previous post", align: "" },
          { post: newer, label: "Next post", align: "sm:text-right sm:border-l" },
        ].map(({ post: p, label, align }) =>
          p ? (
            <Link
              key={label}
              href={`/blog/${p.slug}`}
              className={`group border-rule px-4 py-10 transition-colors hover:bg-paper-2 sm:px-6 lg:px-10 ${align} max-sm:border-b`}
            >
              <span className="label text-ink-3">{label}</span>
              <span className="display mt-3 block text-xl leading-tight group-hover:text-rubric lg:text-2xl">
                {p.title}
              </span>
            </Link>
          ) : (
            <span key={label} className={`border-rule ${align}`} />
          ),
        )}
      </nav>
    </article>
  );
}
