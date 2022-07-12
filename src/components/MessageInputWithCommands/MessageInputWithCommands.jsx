import React, { useEffect, useState } from "react";
import * as Flex from "@twilio/flex-ui";
import { Combobox, useCombobox } from '@twilio-paste/core/combobox';
import { Text } from '@twilio-paste/text';

const MessageInputWithCommands = ({ commandsList, conversationSid, manager, messageState: { inputText: inputText }, task }) => {
  const [command, setCommand] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [filteredCommands, setFilteredCommands] = useState([]);
  
  const {closeMenu, openMenu, selectItem, ...state} = useCombobox({
    items: filteredCommands,
    inputValue: inputText,
    itemToString: _item => inputText,
    onSelectedItemChange: ({selectedItem}) => selectCommand(selectedItem),
    onInputValueChange: ({inputValue}) => handleInput(inputValue),
    onHighlightedIndexChange: ({highlightedIndex}) => handleHighlight(highlightedIndex),
    onIsOpenChange: e => (e.isOpen === true && filteredCommands.length < 1) && closeMenu()
  })
  
  useEffect(() => {
    // determine if user is typing a command
    
    let matchedCommand = matchCommand();
    
    if (!matchedCommand) {
      setCommand(null);
      return;
    }
    
    setCommand(matchedCommand);
  }, [inputText]);
  
  useEffect(() => {
    // update filtered command list based on user-entered command
    
    if (!command) {
      setFilteredCommands([]);
      return;
    }
    
    setFilteredCommands(commandsList.filter(commandDefinition => commandDefinition.shortcut.toLowerCase().startsWith(command.toLowerCase())));
  }, [command])
  
  useEffect(() => {
    // set menu visibility based on presence of matching commands
    
    if (filteredCommands.length > 0) {
      openMenu()
    } else {
      closeMenu()
    }
    
  }, [filteredCommands])
  
  const matchCommand = () => {
    const match = inputText.match(/(\s|^)(\/)([^\/\s]*)$/);
    
    if (!match) return;
    
    return match[match.length-1];
  }
  
  const selectCommand = async (commandDefinition) => {
    if (!commandDefinition || !command) return;
    
    // remove command from the input text
    let commandLength = 1 + command.length;
    let newInputText = inputText.slice(0, commandLength * -1);
    
    await Flex.Actions.invokeAction("SetInputText", {
      body: newInputText,
      conversationSid: conversationSid,
    });
    
    // reset state
    setCommand(null);
    selectItem(null);
    
    // execute command
    commandDefinition.callback(Flex, manager, task, conversationSid, newInputText);
  }
  
  const handleInput = async (inputValue) => {
    await Flex.Actions.invokeAction("SetInputText", {
      body: inputValue,
      conversationSid: conversationSid,
    });
  }
  
  const handleKeyDown = async (e) => {
    if (e.keyCode !== 13) {
      // Ignore key down events for everything except the return key
      return;
    }
    
    if (highlightedIndex >= 0) {
      // menu item is highlighted, so don't do anything
      return;
    }
    
    await Flex.Actions.invokeAction("SendMessage", {
      body: e.target.value,
      conversationSid: conversationSid,
    });
  }
  
  const handleHighlight = (highlightedIndex) => {
    // set highlight state to override return key handling
    setHighlightedIndex(highlightedIndex)
  }
  
  return (
    <Combobox
      autocomplete
      items={filteredCommands}
      labelText={manager.strings.InputPlaceHolder + ":"}
      optionTemplate={item => <><Text as="span" fontWeight="fontWeightBold" paddingRight="space30">/{item.shortcut}</Text> {item.description}</>}
      onKeyDown={e => handleKeyDown(e)}
      state={{...state}} />
  );
};

export default Flex.withTaskContext(MessageInputWithCommands);