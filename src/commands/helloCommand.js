export const helloCommand = {
  shortcut: 'hello',
  description: 'Inserts "Hello (customer name)!" into the message',
  callback: async (flex, manager, task, conversationSid, inputText) => {
    await flex.Actions.invokeAction("SetInputText", {
      body: `${inputText}Hello ${task.attributes.name}!`,
      conversationSid: conversationSid,
    });
  }
}