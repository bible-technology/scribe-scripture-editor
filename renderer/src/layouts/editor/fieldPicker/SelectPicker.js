import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useEffect } from 'react';
export  function SelectPicker({fieldInfo,require,setJsonSpec}) {
  const [form, setForm] = React.useState('');

  useEffect(() => {
    setJsonSpec((prev) => {
      const newState = JSON.parse(prev);
      newState[fieldInfo.id] = form.id;
      return JSON.stringify(newState);
    });
  }, [form]);

  const handleChange = (event) => {
    setForm(event.target.value);
  };
  return (
    <Box sx={{ minWidth:"100%",maxWidth:"100%"}}>
      <FormControl fullWidth error={require && form === ''}>
        <InputLabel id="filled-search">{fieldInfo.label.fr}</InputLabel>
        <Select
          labelId="filled-search"
          id="filled-search"
          value={form}
          label={fieldInfo.label.fr}
          onChange={handleChange}
        >
          {fieldInfo.typeEnum.map(e => <MenuItem value={e}>{e.label.fr}</MenuItem>)}
        </Select>
      </FormControl>
    </Box>
  );}