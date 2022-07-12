export const doneCommand = {
  shortcut: 'done',
  description: 'Wrap up and complete this task',
  callback: async (flex, manager, task, conversationSid, inputText) => {
    await flex.Actions.invokeAction("CompleteTask", {
      task: task
    });
  }
}