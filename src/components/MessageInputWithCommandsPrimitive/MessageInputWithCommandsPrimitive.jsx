import React, { useEffect, useState } from "react";
import * as Flex from "@twilio/flex-ui";
import { ComboboxListbox, ComboboxListboxGroup, ComboboxListboxOption } from '@twilio-paste/core/combobox';
import { useComboboxPrimitive } from '@twilio-paste/core';
import { Box } from '@twilio-paste/core/box';
import { Stack } from "@twilio-paste/core/stack";
import { Text } from '@twilio-paste/text';
import { useUIDSeed } from 'react-uid';
import MessageInputAttachment from '../MessageInputAttachment/MessageInputAttachment'

const MessageInputWithCommandsPrimitive = ({ commandsList, conversationSid, disabledReason, manager, messageState: { attachedFiles, inputText }, task }) => {
  const inputPrompt = manager.strings.InputPlaceHolder;
  const [command, setCommand] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [filteredCommands, setFilteredCommands] = useState([]);
  const [isDisabled, setIsDisabled] = useState(false);
  const [labelText, setLabelText] = useState(inputPrompt);
  const [isOpen, setIsOpen] = useState(false);
  
  const seed = useUIDSeed();
  const { getComboboxProps,
    getInputProps,
    getItemProps,
    getMenuProps,
    getToggleButtonProps,
    selectItem,
    setHighlightedIndex: setComboboxHighlightedIndex } = useComboboxPrimitive({
    items: filteredCommands,
    inputValue: inputText,
    itemToString: _item => inputText,
    onSelectedItemChange: ({selectedItem}) => selectCommand(selectedItem),
    onInputValueChange: ({inputValue}) => handleInput(inputValue),
    onHighlightedIndexChange: ({highlightedIndex}) => handleHighlight(highlightedIndex)
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
      setIsOpen(true)
      
      // highlight first item in menu for keyboard access
      if (highlightedIndex < 0) {
        setComboboxHighlightedIndex(0);
      }
    } else {
      setIsOpen(false)
    }
    
  }, [filteredCommands])
  
  useEffect(() => {
    if (!disabledReason) {
      setLabelText(inputPrompt);
      setIsDisabled(false);
    } else {
      setLabelText(disabledReason);
      setIsDisabled(true);
    }
  }, [disabledReason])
  
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
    setHighlightedIndex(-1);
    
    // execute command
    commandDefinition.callback(Flex, manager, task, conversationSid, newInputText);
  }
  
  const handleInput = async (inputValue) => {
    // update Flex state with current input contents
    await Flex.Actions.invokeAction("SetInputText", {
      body: inputValue,
      conversationSid: conversationSid,
    });
  }
  
  const handleKeyDown = async (e) => {
    if (e.keyCode !== 13 && e.keyCode !== 9) {
      // Ignore key down events for everything except the return and tab keys
      return;
    }
    
    if (highlightedIndex >= 0 && e.keyCode === 9) {
      // select highlighted item with tab key
      selectItem(filteredCommands[highlightedIndex]);
      // prevent tabbing over to another element
      e.preventDefault();
      return;
    } else if (highlightedIndex >= 0) {
      // when a menu item is highlighted, combobox handles return key, so do nothing
      return;
    }
    
    if ((!e.target.value || e.target.value.length < 1) && (!attachedFiles || attachedFiles.length < 1)) {
      // no message contents, don't send
      return
    }
    
    await Flex.Actions.invokeAction("SendMessage", {
      body: e.target.value,
      conversationSid: conversationSid,
      attachedFiles: attachedFiles
    });
  }
  
  const handleHighlight = (highlightedIndex) => {
    // set highlight state to use with return/tab key handling
    setHighlightedIndex(highlightedIndex)
  }
  
  return (
    <Stack orientation='vertical'>
      <Box marginBottom="space40" position="relative">
        <Box {...getComboboxProps({role: 'combobox'})}>
          <ComboboxListbox hidden={!isOpen} {...getMenuProps()}>
            <ComboboxListboxGroup>
              {filteredCommands.map((filteredItem, index) => (
                <ComboboxListboxOption
                  highlighted={highlightedIndex === index}
                  variant="default"
                  {...getItemProps({item: filteredItem, index, key: seed('filtered-item-' + filteredItem)})}
                >
                  <Text as="span" fontWeight="fontWeightBold" paddingRight="space30">/{filteredItem.shortcut}</Text> {filteredItem.description}
                </ComboboxListboxOption>
              ))}
            </ComboboxListboxGroup>
          </ComboboxListbox>
          <textarea
            placeholder={labelText}
            {...getInputProps({
                disabled: isDisabled,
                preventKeyAction: isOpen,
                onKeyDown: e => handleKeyDown(e),
                ...getToggleButtonProps({tabIndex: 0}),
            })}
          />
        </Box>
      </Box>
      <Stack orientation='horizontal'>
        {attachedFiles.map((attachedFile) => {
          return <MessageInputAttachment attachedFile={attachedFile} conversationSid={conversationSid} />
        })}
      </Stack>
    </Stack>
  );
};

export default Flex.withTaskContext(MessageInputWithCommandsPrimitive);