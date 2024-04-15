import { useEffect, useState, useRef } from 'react';
import { FieldPicker } from './FieldPicker';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
export function AccordionPicker({ language, setSelected, keySpecification,idjson }) {
	const [open, setOpen] = useState(false);
	const [jsonSpecEntry, setJsonSpecEntry] = useState('{}');
	const jsonSpec = require('./specification/jxl1.json');

	useEffect(()=>{
		setSelected(prev => {
			console.log('ici')
			prev[idjson].content = JSON.parse(jsonSpecEntry)
			return prev
			
		})
	},[jsonSpecEntry])
	console.log(jsonSpecEntry)
	return (	
		<Accordion
			style={{ width: '100%' }}
			onChange={() => setOpen((prev) => !prev)}>
			<AccordionSummary
				style={{
					width: '100%',
					fontSize: 18,
					padding: 5,
						borderBottomStyle: 'solid',
					borderBottomWidth: 1,
				}}
				id='panel-header'
				aria-controls='panel-content'>
				{keySpecification}
			</AccordionSummary>

			{open ? (
				<AccordionDetails style={{ width: '100%' }}>
					{jsonSpec[keySpecification].fields.map((f) => (
						<div
							key={f.id} // Ensure each child element has a unique key
							style={{
								borderBottomWidth: 1,
								padding: 5,
								margin: 5,
								paddingBottom: 10,
								borderBottomStyle: 'solid',
							}}>
							<FieldPicker
								setJsonSpec={setJsonSpecEntry}
								fieldInfo={f}
								lang={language}></FieldPicker>
						</div>
					))}
				</AccordionDetails>
			) : (
				<></>
			)}
		</Accordion>
	);
}
