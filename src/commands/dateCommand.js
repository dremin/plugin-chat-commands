export const dateCommand = {
  shortcut: 'date',
  description: 'Inserts the current date',
  callback: async (flex, manager, task, conversationSid, inputText) => {
    await flex.Actions.invokeAction("SetInputText", {
      body: `${inputText}${new Date().toLocaleDateString()}`,
      conversationSid: conversationSid,
    });
  }
}