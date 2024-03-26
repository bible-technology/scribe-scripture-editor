import { useEffect, useRef, useState } from 'react';

import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';

export function SortableList({
	orderSelection,
	setOrderSelection,
	selected,
	setSelected,
	possibleSelection,
	setPossibleSelection,
}) {
	console.log(orderSelection);

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
				<select
					onChange={(e) => {
						if (e.target.value != 'Add content') {
							setPossibleSelection((prev) => {
								let test = [...prev];

								test.splice(test.indexOf(e.target.value), 1);
								console.log(test);
								return test;
							});

							setSelected((prev) => [...prev, e.target.value]);
							setOrderSelection((prev) => [
								...prev,
								e.target.value,
							]);
						}
					}}
					value={'Add content'}
					className='selectPDFprintRender'
					id='payment'
					name='payment'>
					{possibleSelection.map((o) => (
						<option
							style={{
								backgroundColor: '#363739',
							}}
							value={o}>
							{o}
						</option>
					))}
				</select>
			</div>
		</div>
	);
}
