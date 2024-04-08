import { useEffect, useContext, useState } from 'react';

import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import FramedBouquetPickerPopup from './FramedBouquetPickerPopup';
import ScriptureContentPicker from '@/components/ScriptureContentPicker/ScriptureContentPicker';
import { Button, Modal } from '@material-ui/core';
import localForage from 'localforage';
import packageInfo from '../../../../package.json';
import { ProjectContext } from '@/components/context/ProjectContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { FieldPicker } from './fieldPicker/FieldPicker';
import { ScriptureContentSearchBar } from './ScriptureContentSearchBar';
import { PdfGen } from 'jxl-pdf';

export function SortableList({
	orderSelection,
	setOrderSelection,
	selected,
	setSelected,
	possibleSelection,
	setPossibleSelection,
}) {
	const {
		states: { listResourcesForPdf },
		actions: { setListResourcesForPdf },
	} = useContext(ProjectContext);
	const {
		states: { language },
		actions: { setLanguage },
	} = useContext(ProjectContext);
	
	setLanguage('fr')
	console.log(language)

	const [jsonSpec, setJsonSpec] = useState('{}');
	// const fourColumnSpread = require('./fieldPicker/specification/fourColumnSpread.json');
	const fourColumnSpread = PdfGen.handlerInfo()["4ColumnSpread"];

	const [openModal, setOpenModal] = useState(false);

	useEffect(() => {
		const sortableList = document.querySelector('.sortable-list');
		const items = sortableList.querySelectorAll('.item');

		items.forEach((item) => {
			item.addEventListener('dragstart', () => {
				// Adding dragging class to item after a delay
				setTimeout(() => item.classList.add('dragging'), 0);
			});
			// Removing dragging class from item on dragend event
			item.addEventListener('dragend', () => {
				item.classList.remove('dragging');
			});
		});

		const initSortableList = (e) => {
			e.preventDefault();
			const draggingItem = document.querySelector('.dragging');
			// Getting all items except currently dragging and making array of them
			let siblings = [
				...sortableList.querySelectorAll('.item:not(.dragging)'),
			];
			// Finding the sibling after which the dragging item should be placed
			let nextSibling = siblings.find((sibling) => {
				return e.clientY <= sibling.offsetTop + sibling.offsetHeight;
			});
			// Inserting the dragging item before the found sibling
			sortableList.insertBefore(draggingItem, nextSibling);
		};

		sortableList.addEventListener('dragend', () =>
			updateElemOrder(
				document
					.querySelector('.sortable-list')
					.querySelectorAll('.item'),
			),
		);
		sortableList.addEventListener('dragover', initSortableList);
		sortableList.addEventListener('dragenter', (e) => e.preventDefault());

		// Clean-up function
		return () => {
			sortableList.removeEventListener('dragover', initSortableList);
			items.forEach((item) => {
				item.removeEventListener('dragstart', () => {
					setTimeout(() => item.classList.add('dragging'), 0);
				});
				item.removeEventListener('dragend', () => {
					item.classList.remove('dragging');
					updateElemOrder();
				});
			});
		};
	}, [selected.length]); // Empty dependency array ensures this effect runs only once after initial render

	const updateElemOrder = (items) => {
		const t = [];
		items.forEach((item) => {
			t.push(item.id);
		});
		setOrderSelection(t);
	};

	const handleOpenModal = (isOpen) => {
		setOpenModal(isOpen);
	};

	return (
		<div>
			<ul className='sortable-list'>
				{selected.map((e, index) => (
					<li id={e} className='item' draggable='true' key={index}>
						<div className='details'>
							<span>{e}</span>
						</div>
						<i className='uil uil-draggabledots'></i>
					</li>
				))}
				<li id={'etd'} className='item' draggable='true' key={'etd'}>
					<Accordion style={{width:'100%'}}>	
						<AccordionSummary
							id='panel-header'
							aria-controls='panel-content'>
							<div
								style={{
									width: '100%',
									wordWrap: 'break-word',
								}}>
								Section four coloumn spread test
							</div>
						</AccordionSummary>
						<AccordionDetails style={{ width: '100%' }}>
							{fourColumnSpread.fields.map((f) => (
								<div
									key={f.id} // Ensure each child element has a unique key
									style={{
										borderBottomWidth: 1,
										borderBottomStyle: 'solid',
										wordWrap: 'break-word', // Allow content to wrap if it exceeds the width
									}}>
									<FieldPicker
										setJsonSpec={setJsonSpec}
										fieldInfo={f}
										lang={language}></FieldPicker>
								</div>
							))}
						</AccordionDetails>
					</Accordion>
				</li>
			</ul>

			<div
				style={{
					display: 'flex',
					flexDirection: 'row',
					paddingLeft: 22,
					paddingRight: 22,
					justifyContent: 'center',
					paddingTop: 10,
					alignItems: 'center',
					justifyContent: 'space-between',
				}}>
				<Button
					style={{
						borderRadius: 4,
						backgroundColor: '#F50',
						borderStyle: 'solid',
						borderColor: '#F50',
						color: 'white',
					}}
					onClick={() => handleOpenModal(true)}>
					Add
				</Button>
				<ScriptureContentSearchBar
					openModal={openModal}
					setOpenModal={setOpenModal}
					handleOpenModal={handleOpenModal}
					setOrderSelection={setOrderSelection}
					setSelected={setSelected}
				/>
			</div>
		</div>
	);
}
