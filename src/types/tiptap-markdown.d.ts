declare module "tiptap-markdown/src/extensions/nodes/task-item" {
  import { Node } from "@tiptap/core";
  const ext: Node;
  export default ext;
}

declare module "tiptap-markdown/src/extensions/nodes/list-item" {
  import { Node } from "@tiptap/core";
  const ext: Node;
  export default ext;
}

declare module "tiptap-markdown/src/extensions/nodes/bullet-list" {
  import { Node } from "@tiptap/core";
  const ext: Node;
  export default ext;
}

declare module "markdown-it-task-lists" {
  const plugin: (md: unknown, opts?: unknown) => unknown;
  export default plugin;
}
