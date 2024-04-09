import { useState, useEffect } from 'react';
import { Checkbox } from '@mui/material';

export function BooleanPicker({ setJsonSpec, fieldInfo, require, lang }) {
	const [selected, setSelected] = useState(false);

	useEffect(() => {
		setJsonSpec((prev) => {
			let j = JSON.parse(prev);

			j[fieldInfo.id] = selected;
			return JSON.stringify(j);
		});
	}, [selected]);
	return (
		<div style={{ display: 'flex' }}>
			<Checkbox
				value={selected}
				onChange={() => setSelected((prev) => !prev)}
			/>
			<div style={{ display: 'flex', alignSelf: 'center' }}>
				{fieldInfo.label[lang]}{' '}
			</div>
		</div>
	);
}
