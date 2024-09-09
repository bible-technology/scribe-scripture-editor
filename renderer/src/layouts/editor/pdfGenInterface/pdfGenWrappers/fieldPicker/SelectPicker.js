import * as React from 'react';
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import '../../../../../../../styles/globals.css';
export function SelectPicker({
	fieldInfo,
	require,
	setJsonSpec,
	lang,
	open = true,
}) {
	const [form, setForm] = React.useState(fieldInfo.suggestedDefault || '');

	useEffect(() => {
		setJsonSpec((prev) => {
			const newState = typeof prev == "object" ? prev : JSON.parse(prev);
			newState[fieldInfo.id] = form;
			return JSON.stringify(newState);
		});
	}, [form]);

	const handleChange = (event) => {
		setForm(event.target.value);
	};

	return (
		<div
			style={
				open
					? {
							display: 'flex',
							justifyContent: 'left',
							alignItems: 'center',
							width: 'auto',
							whiteSpace: 'nowrap',
					  }
					: { display: 'none' }
			}>
			<div style={{ marginRight: '16px' }}>{fieldInfo.label[lang]}</div>
			<div style={{ display: 'flex', flexDirection: 'column' }}>
				<select
					className='selectScribeTheme'
					value={form}
					onChange={handleChange}>
					<option value='' disabled selected hidden>
						Please Choose...
					</option>
					{fieldInfo.typeEnum.map((e) => (
						<option key={uuidv4()} value={e.id}>
							{e.label[lang]}
						</option>
					))}
				</select>
			</div>
			{require && form === '' && (
				<div style={{ color: 'red', fontSize: '12px', padding: '5px' }}>
					This field is required
				</div>
			)}
		</div>
	);
}
