import { useEffect, useRef, useState } from 'react';

import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import FramedBouquetPickerPopup from './FramedBouquetPickerPopup';
import ScriptureContentPicker from '@/components/ScriptureContentPicker/ScriptureContentPicker';
import { Button, Modal } from '@material-ui/core';
import localForage from 'localforage';
import packageInfo from '../../../../package.json';
export function SortableList({
	orderSelection,
	setOrderSelection,
	selected,
	setSelected,
	possibleSelection,
	setPossibleSelection,
}) {
	let pickerJson = { book: {} };
	const [open, setOpen] = useState(false);

	localForage.getItem('userProfile').then(async (user) => {
		const fs = window.require('fs');
		const path = require('path');
		const newpath = localStorage.getItem('userPath');
		const currentUser = user?.username;
		const folder = path.join(
			newpath,
			packageInfo.name,
			'users',
			`${currentUser}`,
			'projects',
		);
		const projects = fs.readdirSync(folder);

		for (let project of projects) {
			let jsontest = fs.readFileSync(
				folder + '/' + project + '/' + 'metadata.json',
				'utf-8',
			);
			let jsonParse = JSON.parse(jsontest);
			let projectS = '[' + jsonParse.identification.name.en + ']';
			for (var pathI in jsonParse.ingredients) {
				let book = pathI.split('/')[1].split('.')[0];

				pickerJson.book[book + projectS] = {
					description: `book : ${book} from ${projectS}`,
					language: jsonParse.meta.generator.defaultLocale,
					src: {
						type: 'fs',
						path: `${folder}/${project}/${pathI}`,
					},
					books: [book],
				};
			}
		}
	});

	useEffect(() => {}, [selected.length]);

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
					<Accordion>
						<AccordionSummary
							id='panel-header'
							aria-controls='panel-content'>
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
								}}>
								<div>Header</div>
								<div>+</div>
							</div>
						</AccordionSummary>
						<AccordionDetails>
							Lorem ipsum dolor sit amet, consectetur adipiscing
							elit.
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
            color:'white'
					}}
					onClick={() => setOpen(true)}>
					Add
				</Button>
				<Modal
					open={open}
					onClose={() => setOpen(false)}
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}>
					<div
						style={{
							backgroundColor: 'white',
							width: 'fit-content',
							height: '50%',
						}}>
						<ScriptureContentPicker
							onSelect={(e) => {
								setSelected((prev) => [...prev, e.description]);
								setOrderSelection((prev) => [
									...prev,
									e.description,
								]);
								setOpen(false);
							}}
							source={pickerJson}
						/>
					</div>
				</Modal>
			</div>
		</div>
	);
}
