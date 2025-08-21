import { Node } from "@tiptap/core";
import taskListPlugin from "markdown-it-task-lists";
import BulletList from "tiptap-markdown/src/extensions/nodes/bullet-list";

const TaskList = Node.create({
  name: "taskList",
});

type MarkdownItLike = {
  use: (...args: unknown[]) => unknown;
};

export default TaskList.extend({
  addStorage() {
    return {
      markdown: {
        serialize: BulletList.storage.markdown.serialize,
        parse: {
          setup(markdownit: MarkdownItLike) {
            markdownit.use(taskListPlugin);
          },
          updateDOM(element: HTMLElement) {
            [...element.querySelectorAll(".contains-task-list")].forEach(
              (list) => {
                (list as HTMLElement).setAttribute("data-type", "taskList");
              },
            );
          },
        },
      },
    };
  },
});
