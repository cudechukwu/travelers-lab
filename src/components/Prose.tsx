import React from "react";
import Markdoc, { Tag, type Config, type Node, type RenderableTreeNode } from "@markdoc/markdoc";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const textOf = (nodes: RenderableTreeNode[]): string =>
  nodes.map((n) => (typeof n === "string" ? n : Tag.isTag(n) ? textOf(n.children) : "")).join("");

const isFigure = (n: RenderableTreeNode) => Tag.isTag(n) && n.name === "figure";

const config: Config = {
  nodes: {
    // No <article> wrapper: pages already provide their own structure
    document: {
      transform(node, config) {
        return node.transformChildren(config);
      },
    },
    // Images render as <figure>, which can't sit inside <p>: split the paragraph around them
    paragraph: {
      transform(node, config) {
        const out: RenderableTreeNode[] = [];
        let run: RenderableTreeNode[] = [];
        const flush = () => {
          if (run.some((c) => (typeof c === "string" ? c.trim() : true))) out.push(new Tag("p", {}, run));
          run = [];
        };
        for (const child of node.transformChildren(config)) {
          if (isFigure(child)) {
            flush();
            out.push(child);
          } else run.push(child);
        }
        flush();
        return out;
      },
    },
    image: {
      attributes: {
        src: { type: String, required: true },
        alt: { type: String },
        title: { type: String },
      },
      transform(node) {
        const { src, alt, title } = node.attributes;
        const img = new Tag("img", { src, alt: alt ?? "", loading: "lazy", decoding: "async" });
        return new Tag("figure", {}, title ? [img, new Tag("figcaption", {}, [title])] : [img]);
      },
    },
    heading: {
      children: ["inline"],
      attributes: { level: { type: Number, required: true } },
      transform(node, config) {
        const children = node.transformChildren(config);
        return new Tag(`h${node.attributes.level}`, { id: slugify(textOf(children)) }, children);
      },
    },
    table: {
      transform(node, config) {
        return new Tag("div", { class: "table-wrap" }, [new Tag("table", {}, node.transformChildren(config))]);
      },
    },
    link: {
      attributes: { href: { type: String, required: true }, title: { type: String } },
      transform(node, config) {
        const { href, title } = node.attributes;
        const external = /^https?:\/\//.test(href);
        return new Tag(
          "a",
          { href, title, ...(external ? { rel: "noopener noreferrer" } : {}) },
          node.transformChildren(config),
        );
      },
    },
  },
};

export function Prose({ node, className = "" }: { node: Node; className?: string }) {
  const tree = Markdoc.transform(node, config);
  return <div className={`prose ${className}`}>{Markdoc.renderers.react(tree, React)}</div>;
}
