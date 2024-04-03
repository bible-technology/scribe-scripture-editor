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
	const fourColumnSpread = require('./fieldPicker/specification/fourColumnSpread.json');

	const [openModal, setOpenModal] = useState(false);
	const [searchText, setSearchText] = useState('');
	const [localListResourcesForPdf, setLocalListResourcesForPdf] = useState(
		Object.keys(listResourcesForPdf).reduce(
			(a, v) => ({ ...a, [v]: {} }),
			{},
		),
	);

	useEffect(() => {
		if (searchText.length > 2) {
			let contentTypes = Object.keys(listResourcesForPdf);
			let newListResources = contentTypes.reduce(
				(a, v) => ({ ...a, [v]: {} }),
				{},
			);
			let regexSearch = new RegExp(`.*${searchText}.*`, 'i');
			contentTypes.forEach((contentType) => {
				for (let [pathKey, val] of Object.entries(
					listResourcesForPdf[contentType],
				).sort()) {
					if (
						regexSearch.test(
							pathKey.replace('[', '').replace(']', ''),
						)
					) {
						newListResources[contentType][pathKey] = val;
					}
				}
			});
			setLocalListResourcesForPdf(newListResources);
		} else {
			setLocalListResourcesForPdf(listResourcesForPdf);
		}
	}, [searchText, setSearchText, openModal, setOpenModal]);

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

	const handleInputSearch = (e) => {
		setSearchText(e.target.value);
	};

	const handleOpenModal = (isOpen) => {
		setOpenModal(isOpen);
		setSearchText('');
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
				<Modal
					open={openModal}
					onClose={() => handleOpenModal(false)}
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						flexDirection: 'row',
					}}>
					<div
						style={{
							backgroundColor: 'white',
							width: '50%',
							height: '50%',
						}}>
						<div className={'picker-container'}>
							<div className={'searchContainer'}>
								<input
									className={'searchInput'}
									type='text'
									placeholder='Search'
									onInput={handleInputSearch}
								/>
							</div>
							{localListResourcesForPdf ? (
								<ScriptureContentPicker
									onSelect={(e) => {
										setSelected((prev) => [
											...prev,
											e.description,
										]);
										setOrderSelection((prev) => [
											...prev,
											e.description,
										]);
										handleOpenModal(false);
									}}
									source={localListResourcesForPdf}
								/>
							) : (
								<LoadingSpinner />
							)}
						</div>
					</div>
				</Modal>
			</div>
		</div>
	);
}
