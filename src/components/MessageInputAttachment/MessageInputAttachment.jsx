import React from "react";
import * as Flex from "@twilio/flex-ui";

import { Box } from "@twilio-paste/core/box";
import {
  MediaObject,
  MediaFigure,
  MediaBody,
} from "@twilio-paste/core/media-object";
import { FileIcon } from "@twilio-paste/icons/esm/FileIcon";
import { MMSCapableIcon } from "@twilio-paste/icons/esm/MMSCapableIcon";
import { Stack } from "@twilio-paste/core/stack";
import { Text } from "@twilio-paste/core/text";

const MessageInputAttachment = ({ attachedFile, conversationSid }) => {
  let { name, size } = attachedFile;

  const renderIcon = () => {
    let fileExt = name.substring(name.lastIndexOf(".") + 1);

    switch (fileExt) {
      case "bmp":
      case "gif":
      case "heic":
      case "heif":
      case "jfif":
      case "jpeg":
      case "jpg":
      case "png":
      case "tif":
      case "tiff":
      case "webm":
        return <MMSCapableIcon decorative={true} title={name} />;
      default:
        return <FileIcon decorative={true} title={name} />;
    }
  };
  
  const detach = () => {
    Flex.Actions.invokeAction("DetachFile", {
      file: attachedFile,
      conversationSid: conversationSid
    });
  }
  
  return (
    <Box marginTop="space10" marginRight="space10" padding="space20" borderRadius="borderRadius20" borderStyle="solid" borderWidth="borderWidth10" borderColor="colorBorder">
      <MediaObject verticalAlign="center">
        <MediaFigure spacing="space40">{renderIcon()}</MediaFigure>
        <MediaBody>
          <Stack orientation="vertical">
            <Text fontSize="fontSize20" textAlign="left" fontWeight="fontWeightBold" title={name}>
              {name.substring(name.lastIndexOf("/") + 1)}
            </Text>
            <Text
              color="colorTextWeak"
              fontSize="fontSize10"
              textAlign="left">
              {Math.round(size / 1000)} KB
            </Text>
          </Stack>
        </MediaBody>
        <MediaFigure align="end" spacing="space40">
          <Flex.IconButton icon="Close" sizeMultiplier={1.5} title={`Remove attached file ${name}`} onClick={detach} />
        </MediaFigure>
      </MediaObject>
    </Box>
  );
};

export default MessageInputAttachment;
