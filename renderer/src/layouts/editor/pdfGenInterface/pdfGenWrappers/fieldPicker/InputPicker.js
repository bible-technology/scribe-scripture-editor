import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { useState, useEffect } from 'react';

export function InputPicker({
  doReset, fieldInfo, setJsonSpec, require, lang, open = true,
}) {
  const [input, setInput] = useState(fieldInfo.suggestedDefault || '');
  useEffect(() => {
    setJsonSpec((prev) => {
      const newState = typeof prev === 'object' ? prev : JSON.parse(prev);
      newState[fieldInfo.id] = input;
      return JSON.stringify(newState);
    });
  }, [input]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const resetField = () => {
    setInput(fieldInfo.suggestedDefault || '');
  };

  useEffect(() => {
    resetField();
  }, [doReset]);

  return (
    <div style={open ? {} : { display: 'none' }}>
      <Box
        component="form"
        sx={{
          '& .MuiTextField-root': { m: 1, width: '100%' },
        }}
        noValidate
        autoComplete="off"
      >
        <TextField
          error={require && input === ''}
          id="filled-search"
          label={fieldInfo.label[lang]}
          type="search"
          variant="filled"
          value={input}
          onChange={handleInputChange}
          helperText={require && input === '' ? '*Required' : ''}
        />
      </Box>
    </div>
  );
}
