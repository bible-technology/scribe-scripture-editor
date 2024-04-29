import { useEffect, useState } from 'react';
import { FieldPicker } from './FieldPicker';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
export function AccordionPicker({
	language,
	setSelected,
	keySpecification,
	idjson,
	removeButton,
	advanceMode,
}) {
	const [open, setOpen] = useState(true);
	const [jsonSpecEntry, setJsonSpecEntry] = useState('{}');

	const jsonSpec = require('./specification/jxl1.json');

	const handleAccordionChange = () => {
		setOpen((prevOpen) => !prevOpen);
	};

	useEffect(() => {
		// Update selected state when the jsonSpecEntry changes
		setSelected((prevSelected) => {
			const updatedSelected = { ...JSON.parse(prevSelected )};
			if (updatedSelected[idjson]) {
				updatedSelected[idjson].content = JSON.parse(jsonSpecEntry);
			}
			return JSON.stringify(updatedSelected);
		});
	}, [jsonSpecEntry]);

	return (
		<Accordion
			defaultExpanded
			disabled={!advanceMode} // Disable based on advanceMode prop
			style={{
				width: '100%',
				backgroundColor: '#747474',
				opacity: advanceMode ? 1 : 1, // Reduce opacity when disabled
			}}
			onChange={handleAccordionChange}>
			<AccordionSummary
				disabled={!advanceMode} // Disable based on advanceMode prop
				style={{
					width: '100%',
					backgroundColor: '#747474',
					opacity: advanceMode ? 1 : 1, // Reduce opacity when disabled
					borderBottomStyle: 'solid',
					borderBottomWidth: 1,
					color: 'white', // Text color
				}}
				id='panel-header'
				aria-controls='panel-content'>
				<div
					style={{
						width: '100%',
						display: 'flex',
						justifyContent: 'space-between',
					}}>
					<p style={{ alignSelf: 'center', color: 'white' }}>
						{keySpecification}
					</p>
					{removeButton}
				</div>
			</AccordionSummary>

			{
				<AccordionDetails style={{ width: '100%', display: 'false' }}>
					{jsonSpec[keySpecification].fields.map((f) => (
						<FieldPicker
							jsonSpec={jsonSpec}
							setJsonSpec={setJsonSpecEntry}
							jsonSpecEntry={jsonSpecEntry}
							fieldInfo={f}
							open={open}
							lang={language}
						/>
					))}
				</AccordionDetails>
			}
		</Accordion>
	);
}
