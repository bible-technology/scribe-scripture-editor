import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { Select } from '@mui/material';
import { useEffect } from 'react';

export function SelectPicker({
	fieldInfo,
	require,
	setJsonSpec,
	lang,
	open = true,
}) {
	const [form, setForm] = React.useState('');

	useEffect(() => {
    console.log(form)
    console.log(fieldInfo)
		setJsonSpec((prev) => {

			const newState = JSON.parse(prev);
			newState[fieldInfo.id] = form;
      console.log(newState[fieldInfo.id])
			return JSON.stringify(newState);
		});
	}, [form]);

	const handleChange = (event) => {
		setForm(event.target.value);
	};
	return (
		<div style={open ? {} : { display: 'none' }}>
			<Box sx={{ width: '100%' }}>
				<FormControl fullWidth error={require && form === ''}>
					{/* <InputLabel 
          
          id='select-label'>
						{fieldInfo.label[lang]}
					</InputLabel> */}
					<Select
						sx={{
							'& .MuiSelect-select': {
                borderColor:'rgba(115, 115, 115, 1)',
                borderWidth:3,
								backgroundColor: form
									? 'rgba(255, 204, 179, 1)'
									: '#FFFFFF',
								'&:hover': {
									backgroundColor: 'rgba(255, 238, 229, 1)', // Hover color
								},
							},
						}}
						id='select'
						value={form}
						onChange={handleChange}>
						{fieldInfo.typeEnum.map((e) => (
							<MenuItem key={e.id} value={e.id}>
								{e.label[lang]}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			</Box>
		</div>
	);
}
