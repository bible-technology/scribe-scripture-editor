import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useState, useEffect } from "react";
import { FormControl } from "@mui/material";

export function InputPicker({ fieldInfo, setJsonSpec, require,lang }) {
  const [input, setInput] = useState("");
  console.log(input);
  useEffect(() => {
    setJsonSpec((prev) => {
      const newState = JSON.parse(prev);
      newState[fieldInfo.id] = input;
      return JSON.stringify(newState);
    });
  }, [input]);

  return (
    <Box
      component="form"
      sx={{
        "& .MuiTextField-root": { m: 1, width: "100%" },
      }}
      noValidate
      autoComplete="off"
    >
        <TextField
          error={require && input === ""}
          id="filled-search"
          label={fieldInfo.label[lang]}
          type="search"
          variant="filled"
          onChange={(e) => setInput(e.target.value)}
          helperText={require && input === ""? "*Require.":""}
        />
    </Box>
  );
}
