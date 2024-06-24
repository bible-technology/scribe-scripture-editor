import React, { useState, useRef } from "react";
// Input, Stack, InputProps, Box
import Button from "@mui/material/Button";
import Input, { InputProps } from "@mui/material/Input";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Markdown from "react-markdown";
import { IoCheckmark, IoCreate } from "react-icons/io5";

export const MarkdownInput = ({ setIsEditing, isEditing, fontSize, selectedFont, ...props }: InputProps & { setIsEditing: (value: boolean) => boolean, isEditing: boolean, fontSize: number, selectedFont: string }) => {
  const [isHovered, setIsHovered] = useState(false);
  const clickRef = useRef(0);

  const enterPressed = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (isEditing && e.key == "Enter") {
      setIsEditing(false);
    }
  }
  const handleDoubleClickToEdit = () => {
    clickRef.current += 1
    if (clickRef.current === 1) {
      setTimeout(() => {
        if (clickRef.current === 2) {
          setIsEditing(true);
        }
        clickRef.current = 0
      }, 300)
    }
  }

  if (isEditing) {
    return (
      <Stack
        flexDirection={"row"}
        sx={{ background: "lightgrey", width: "100%", height: "36px", pl: "8px" }}
      >
        <Box flexGrow={1}>
          <Input autoFocus onKeyDown={enterPressed} {...props} fullWidth onBlur={() => setIsEditing(false)} style={{
            // fontFamily: selectedFont || 'sans-serif',
            fontSize: `${fontSize}rem`,
            lineHeight: (fontSize > 1.3) ? 1.5 : '',
          }} ></Input>
        </Box>
        <Box sx={{ padding: "6px" }}>
          <Button
            onClick={() => setIsEditing(false)}
            sx={{ width: "24px", minWidth: "24px", padding: "4px" }}
            variant="contained"
          >
            <IoCheckmark size={16} />
          </Button>
        </Box>
      </Stack>
    );
  }

  return (
    <Stack
      flexDirection={"row"}
      sx={{ background: "lightgrey", width: "100%", height: "36px", pl: "8px" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => handleDoubleClickToEdit()}
    >
      <Stack
        flexGrow={1}
        justifyContent={"center"}
        sx={{ width: "100%", height: "100%" }}
      >
        <Markdown
          unwrapDisallowed
          allowedElements={['em', 'strong', 'italic', 'p']}
        >
          {props.value as string}
        </Markdown>
      </Stack>
      {isHovered ? (
        <Box sx={{ padding: "6px" }}>
          <Button
            onClick={() => setIsEditing(true)}
            sx={{ width: "24px", minWidth: "24px", padding: "4px" }}
            variant="contained"
          >
            <IoCreate size={16} />
          </Button>
        </Box>
      ) : (
        <></>
      )}
    </Stack>
  );
};
