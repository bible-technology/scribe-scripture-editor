import { useState, useEffect } from 'react';

import { Checkbox } from '@mui/material';
export function BooleanPicker({
	setJsonSpec,
	fieldInfo,
	require,
	lang,
	open = true,
}) {
	const [selected, setSelected] = useState(false);
	useEffect(() => {
		setJsonSpec((prev) => {
			let j = JSON.parse(prev);
			j[fieldInfo.id] = selected;
			return JSON.stringify(j);
		});
	}, []);
	
	useEffect(() => {
		setJsonSpec((prev) => {
			let j = JSON.parse(prev);
			j[fieldInfo.id] = selected;
			return JSON.stringify(j);
		});
	}, [selected]);
	return (
		<div
		style={open?{flexDirection:'row',display:'flex',justifyContent:'left',marginTop:15}:{display:'none'}}>
			<Checkbox
				onChange={() => setSelected(prev => !prev)}
				sx={{
					color: 'rgba(115, 115, 115, 1)',
					'&.Mui-checked': {
						color: 'rgba(255, 85, 0, 1)',
						'&:hover': {
							color: 'rgba(255, 119, 51, 1)',
						},
					},
					'&:hover': {
						color: 'rgba(255, 170, 128, 1)',
					},

				}}
			/>
			<div style={{ display: 'flex', alignSelf: 'center',marginLeft:15 }}>
				{fieldInfo.label[lang]}
			</div>
		</div>
	);
}
