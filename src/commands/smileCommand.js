export const smileCommand = {
  shortcut: 'smile',
  description: 'Send 😀',
  callback: async (flex, manager, task, conversationSid, inputText) => {
    await flex.Actions.invokeAction("SendMessage", {
      body: "😀",
      conversationSid: conversationSid,
    });
    
    // SendMessage resets input, put it back
    await flex.Actions.invokeAction("SetInputText", {
      body: inputText,
      conversationSid: conversationSid,
    });
  }
}