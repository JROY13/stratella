import TaskListBase from '@tiptap/extension-task-list'
import taskListPlugin from 'markdown-it-task-lists'
import BulletList from '../../../../node_modules/tiptap-markdown/src/extensions/nodes/bullet-list.js'

export default TaskListBase.extend({
  addStorage() {
    return {
      markdown: {
        serialize: BulletList.storage.markdown.serialize,
        parse: {
          setup(markdownit) {
            markdownit.use(taskListPlugin)
          },
          updateDOM(element) {
            ;[...element.querySelectorAll('.contains-task-list')].forEach((list) => {
              list.setAttribute('data-type', 'taskList')
            })
          },
        },
      },
    }
  },
})
