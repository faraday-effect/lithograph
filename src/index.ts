import unified from "unified";

import toVfile from "to-vfile";
import vfileReporter from "vfile-reporter";

import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkMath from "remark-math";

import rehypeAddClasses from "rehype-add-classes";
import rehypeContainers from "remark-containers";
import rehypeDocument from "rehype-document";
import rehypeFormat from "rehype-format";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";

unified()
  .use(remarkParse)
  .use(remarkMath)
  .use(rehypeContainers)
  .use(remarkRehype, { allowDangerousHTML: true })
  .use(rehypeRaw)
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
  .process(toVfile.readSync("src/numbers.md"), function(err, file) {
    if (err) {
      throw err;
    }
    console.error(vfileReporter(file));
    file.extname = ".html";
    toVfile.writeSync(file);
  });
