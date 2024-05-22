import { useEffect, useState } from 'react';
import { FieldPicker } from '../FieldPicker';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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

	const jsonSpec = require('./jxl1.json');

	const handleAccordionChange = () => {
		setOpen((prevOpen) => !prevOpen);
	};

	useEffect(() => {
		// Update selected state when the jsonSpecEntry changes
		setSelected((prevSelected) => {
			const updatedSelected = { ...JSON.parse(prevSelected) };
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
				margin: 6,
				width: '100%',
				backgroundColor: '#FFFFFF',
				borderStyle: 'solid',
				borderColor: '#EEEEEE',
				boxShadow: 'none', // Remove elevation at the bottom
				borderWidth: 1,
				borderRadius: 6,
				opacity: advanceMode ? 1 : 1, // Reduce opacity when disabled
			}}
			onChange={handleAccordionChange}>
			<AccordionSummary
				disabled={!advanceMode} // Disable based on advanceMode prop
				style={{
					width: '100%',
					backgroundColor: '#FFFFFF',
					opacity: advanceMode ? 1 : 1, // Reduce opacity when disabled
					borderBottomStyle: 'solid',
					borderBottomWidth: 1,
					borderBottom: 'none', // Remove bottom border
				}}
				expandIcon={<ExpandMoreIcon />}
				id='panel-header'
				aria-controls='panel-content'>
				<div
					style={{
						width: '100%',
						display: 'flex',
						justifyContent: 'space-between',
					}}>
					<p style={{ alignSelf: 'center', color: 'black' }}>
						{keySpecification}
					</p>
					{removeButton}
				</div>
			</AccordionSummary>

			<AccordionDetails style={{ width: '100%', display: 'false' }}>
				<div
					style={{
						borderWidth: 1,
						borderStyle: 'solid',
						borderColor: '#EEEEEE',
						justifyContent:'center',
						marginBottom:15,
					}}></div>
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
		</Accordion>
	);
}
