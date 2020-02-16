import unified from "unified";
import { Literal, Node } from "unist";
import inspectTree from "unist-util-inspect";
import mapTree from "unist-util-map";
import removePosition from "unist-util-remove-position";

import toVfile from "to-vfile";
import vfileReporter from "vfile-reporter";
import { VFile } from "vfile";

import remarkFrontmatter from "remark-frontmatter";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";

import rehypeAddClasses from "rehype-add-classes";
import rehypeDocument from "rehype-document";
import rehypeFormat from "rehype-format";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";

import YAML from "yaml";

function inspectPlugin() {
  return function(tree: Node) {
    console.log(inspectTree(removePosition(tree)));
  };
}

interface FrontMatter {
  title: string;
  authors: string[];
  course: string;
  semester: string;
}

function titlePage(frontMatter: FrontMatter) {
  return `
<section class="section hero is-info is-large">
  <div class="hero-head"/>
  <div class="hero-body">
    <div class="container">
      <h1 class="title">${frontMatter.title}</h1>
      <h2 class="subtitle">${frontMatter.course}</h2>
      <h2 class="subtitle">${frontMatter.semester}</h2>
      <h2 class="subtitle">${frontMatter.authors.join(", ")}</h2>
    </div>
  </div>
  <div class="hero-foot"/>
</section>
`;
}

function frontmatterPlugin() {
  return function(tree: Node) {
    return mapTree(tree, (node: Node) => {
      if (node.type === "yaml") {
        const value = (node as Literal).value as string;
        const frontMatter = YAML.parse(value);
        return {
          type: "html",
          value: titlePage(frontMatter)
        };
      } else {
        return node;
      }
    });
  };
}

unified()
  .use(remarkParse)
  .use(remarkFrontmatter)
  .use(frontmatterPlugin)
  .use(remarkMath)
  .use(inspectPlugin)
  .use(remarkRehype, { allowDangerousHTML: true })
  .use(rehypeRaw)
  .use(rehypeSlug)
  .use(rehypeHighlight)
  .use(rehypeKatex)
  .use(rehypeDocument, {
    title: "A Lecture",
    css: [
      "https://cdn.jsdelivr.net/npm/bulma@0.8.0/css/bulma.css",
      "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.18.1/styles/default.min.css",
      "https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.css"
    ]
  })
  .use(rehypeAddClasses, {
    h1: "title",
    h2: "subtitle"
  })
  .use(rehypeFormat)
  .use(rehypeStringify)
  .process(toVfile.readSync("src/numbers.md"), function(
    err: Error | null,
    file: VFile
  ) {
    if (err) {
      throw err;
    }
    console.error(vfileReporter(file));
    file.extname = ".html";
    toVfile.writeSync(file);
  });
