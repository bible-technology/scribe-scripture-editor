import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';

import { NumericFormat } from 'react-number-format';

export function IntPicker({
	fieldInfo,
	setJsonSpec,
	require,
	lang,
	open = true,
}) {
	const [value, setValue] = useState('');
	useEffect(() => {
		if (fieldInfo.minValue) {
			setJsonSpec((prev) => {
				const newState = JSON.parse(prev);
				newState[fieldInfo.id] = parseInt(value);
				return JSON.stringify(newState);
			});
		} else {
			setJsonSpec((prev) => {
				const newState = JSON.parse(prev);
				newState[fieldInfo.id] = value;
				return JSON.stringify(newState);
			});
		}
	}, [value]);

	const handleBlur = (event) => {
		const newValue = event.target.value.trim(); // Trim any whitespace
		setValue(newValue);
	};

	const NumericFormatCustom = React.forwardRef(function NumericFormatCustom(
		props,
		ref,
	) {
		const { onChange, ...other } = props;

		return (
			<NumericFormat
				{...other}
				getInputRef={ref}
				onChange={(values) => {
					onChange({
						target: {
							name: props.name,
							value: values.value,
						},
					});
				}}
			/>
		);
	});

	return (
		<div style={open ? {} : { display: 'none' }}>
			<TextField
				label={`${fieldInfo.label[lang]} ${
					fieldInfo.minValue
						? ' ' + fieldInfo.minValue + '-' + fieldInfo.maxValue
						: ''
				}`}
				value={value}
				onBlur={handleBlur}
				name='numberformat'
				id='formatted-numberformat-input'
				InputProps={{
					inputComponent: NumericFormatCustom,
				}}
				variant='standard'
			/>
		</div>
	);
}
