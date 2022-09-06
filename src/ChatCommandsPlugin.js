import React from 'react';
import { FlexPlugin } from '@twilio/flex-plugin';
import { CustomizationProvider } from '@twilio-paste/core/customization';

import MessageInputWithCommands from './components/MessageInputWithCommands/MessageInputWithCommands';
import { commandsList } from './commands';

const PLUGIN_NAME = 'ChatCommandsPlugin';

export default class ChatCommandsPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   */
  async init(flex, manager) {
    flex.setProviders({
      CustomProvider: (RootComponent) => (props) => {
        const pasteProviderProps = {
          baseTheme: props.theme?.isLight ? "default" : "dark",
          theme: props.theme?.tokens,
          style: { minWidth: "100%", height: "100%" },
          elements: {
            COMBOBOX_ELEMENT: {
              fontWeight: 'fontWeightNormal'
            },
            COMBOBOX_LISTBOX: {
              bottom: '100%',
              paddingBottom: 'space0',
              marginBottom: '-24px'
            }
          }
        };
        
        return (
          <CustomizationProvider {...pasteProviderProps}>
            <RootComponent {...props} />
          </CustomizationProvider>
        )
      }
    });
    
    flex.MessageInputV2.Content.remove("textarea");
    flex.MessageInputV2.Content.add(
      <MessageInputWithCommands key="MessageInputWithCommands-component" commandsList={commandsList} manager={manager} />,
      {
        sortOrder: -1
      }
    )
  }
}
