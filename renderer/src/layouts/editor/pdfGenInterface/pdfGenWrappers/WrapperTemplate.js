import { useEffect, useState } from 'react';
import { Button } from '@material-ui/core';
import { AccordionPicker } from './fieldPicker/specification/AccordionPicker';
import i18n from 'src/translations/i18n';
import Trash from './../../../../../public/icons/trash.svg';
import { ModalSectionSelection } from './modalSectionSelection';
import { OBSWrapperSortableList } from './HeaderWrapper/OBSHeaderWrapper';
import { BCVWrapperSortableList } from './HeaderWrapper/BCVHeaderWrapper';

export function WrapperTemplate({
	setFinalPrint,
	wrapperType,
	keyWrapper,
	setUpdate,
	advanceMode,
	changePrintData,
	changePrintOrder,
}) {
	const [openModal, setOpenModal] = useState(false);
	const [orderSelection, setOrderSelection] = useState([0]);
	const [selected, setSelected] = useState(
		'{"0": { "type": "obs", "content": {} }}',
	);

	const choice = require('./fieldPicker/specification/WrapperSection.json');
	const listChoice = choice[wrapperType];
	const [LoopMode, setLoopMode] = useState(false);

	const sortableListClassName = `sortable-${keyWrapper}-list`;
	const itemClassName = `sortable-${keyWrapper}-item`;

	useEffect(() => {
		setFinalPrint((prev) => {
			const t = { ...prev };
			t[keyWrapper].content.order = orderSelection;
			return t;
		});
	}, [orderSelection]);

	useEffect(() => {
		setFinalPrint((prev) => {
			const t = { ...prev };
			t[keyWrapper].content.content = JSON.parse(selected);
			return t;
		});
	}, [selected]);

	useEffect(() => {
		const sortableList = document.querySelector(
			`.${sortableListClassName}`,
		);
		const items = sortableList.querySelectorAll(`.${itemClassName}`);
		items.forEach((item) => {
			item.addEventListener('dragstart', () => {
				setTimeout(() => item.classList.add('dragging'), 0);
			});
			item.addEventListener('dragend', () => {
				item.classList.remove('dragging');
			});
		});

		const initSortableList = (e) => {
			e.preventDefault();
			e.stopPropagation();

			const draggingItem = document.querySelector(
				`.${itemClassName}.dragging`,
			);
			if (!draggingItem) {
				return;
			}
			let siblings = [
				...sortableList.querySelectorAll(
					`.${itemClassName}:not(.dragging)`,
				),
			];
			let nextSibling = siblings.find((sibling) => {
				return e.clientY <= sibling.offsetTop + sibling.offsetHeight;
			});
			sortableList.insertBefore(draggingItem, nextSibling);
		};

		sortableList.addEventListener('dragend', () =>
			updateElemOrder(sortableList.querySelectorAll(`.${itemClassName}`)),
		);
		sortableList.addEventListener('dragover', initSortableList);
		sortableList.addEventListener('dragenter', (e) => e.preventDefault());

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
	}, [Object.keys(JSON.parse(selected)).length]);

	const updateElemOrder = (items) => {
		const t = [];
		items.forEach((item) => {
			t.push(parseInt(item.id));
		});
		setOrderSelection(t);
	};
	const handleOpenModal = (isOpen) => {
		setOpenModal(isOpen);
	};
	return (
		<div
			style={
				LoopMode
					? {
							width: '100%',
							borderStyle: 'solid',
							borderColor: '#EEEEEE',
							borderWidth: 1,
							backgroundColor: '#FFEEE5',
							padding: 15,
							borderRadius: 10,
					  }
					: {
							width: '100%',
							borderStyle: 'solid',
							borderColor: '#EEEEEE',
							borderWidth: 1,
							backgroundColor: '#FCFAFA',
							padding: 15,
							borderRadius: 10,
					  }
			}>
			{wrapperType === 'bcvWrapper' ? (
				<BCVWrapperSortableList
					keyWrapper={keyWrapper}
					advanceMode={advanceMode}
					changePrintData={changePrintData}
					setLoopMode={setLoopMode}
				/>
			) : (
				<></>
			)}
			{wrapperType === 'obsWrapper' ? (
				<OBSWrapperSortableList
					keyWrapper={keyWrapper}
					advanceMode={advanceMode}
					changePrintData={changePrintData}
					setLoopMode={setLoopMode}
				/>
			) : (
				<></>
			)}

			<div style={{ display: 'flex', justifyContent: 'end' }}>
				{advanceMode ? (
					<div style={{ display: 'flex' }}>
						<Button
							style={{
								borderStyle: 'solid',
								color: 'white',
							}}
							onClick={() => {
								changePrintOrder((prev) => {
									let t = [...prev];
									console.log(t);
									t.splice(t.indexOf(keyWrapper), 1);
									for (let i = 0; i < t.length; i++) {
										if (t[i] > keyWrapper) {
											t[i] -= 1;
										}
									}
									return t;
								});
								changePrintData((prev) => {
									console.log(prev);
									const updatedSelected = {
										...prev,
									};
									const up = {};

									Object.keys(updatedSelected).forEach(
										(key) => {
											console.log(key);
											if (parseInt(key) > keyWrapper) {
												let newIndex =
													parseInt(key) - 1;
												up[newIndex] =
													updatedSelected[key];
											} else if (
												parseInt(key) < keyWrapper
											) {
												up[key] = updatedSelected[key];
											}
										},
									);
									console.log(up);
									return up;
								});
							}}>
							<Trash style={{ height: 35, width: 35 }} />
						</Button>
					</div>
				) : (
					<></>
				)}
			</div>

			<ul className={sortableListClassName}>
				{Object.keys(JSON.parse(selected)).map((k, index) => (
					<li
						id={index}
						className={itemClassName}
						draggable='true'
						key={k + '_' + index}
						onDragStart={() => setUpdate(false)}
						onDragEnd={() => setUpdate(true)}
						style={{ padding: 5 }}>
						<div style={{ flexDirection: 'row', display: 'flex' }}>
							<AccordionPicker
								language={i18n.language}
								wrapperType={wrapperType}
								advanceMode={advanceMode}
								setSelected={setSelected}
								keySpecification={JSON.parse(selected)[k].type}
								idjson={k}
								removeButton={
									advanceMode ? (
										<Button
											style={{
												borderRadius: 4,
												height: 40,
												backgroundColor: '#F50',
												borderStyle: 'solid',
												borderColor: '#F50',
												color: 'white',
											}}
											onClick={() => {
												setOrderSelection((prev) => {
													let t = [...prev];
													t.splice(
														t.indexOf(index),
														1,
													);
													for (
														let i = 0;
														i < t.length;
														i++
													) {
														if (t[i] > index) {
															t[i] -= 1;
														}
													}
													return t;
												});
												setSelected((prev) => {
													const updatedSelected = {
														...JSON.parse(prev),
													};
													const up = {};

													Object.keys(
														updatedSelected,
													).forEach((key) => {
														console.log(key);
														if (
															parseInt(key) >
															index
														) {
															let newIndex =
																parseInt(key) -
																1;
															up[newIndex] =
																updatedSelected[
																	key
																];
														} else if (
															parseInt(key) <
															index
														) {
															up[key] =
																updatedSelected[
																	key
																];
														}
													});

													return JSON.stringify(up);
												});
											}}>
											Remove
										</Button>
									) : (
										<></>
									)
								}
							/>
						</div>
					</li>
				))}
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
				{advanceMode && LoopMode ? (
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
				) : (
					<div
						style={{
							padding: 17,
						}}></div>
				)}
				<ModalSectionSelection
					open={openModal}
					setOpen={setOpenModal}
					table={listChoice}
					setSelected={(c) => {
						setSelected((prev) => {
							let t = { ...JSON.parse(prev) };
							let nb = Object.keys(t).length;
							t[nb] = { type: c, content: {} };

							return JSON.stringify(t);
						});
						setOrderSelection((prev) => [...prev, prev.length]);
						setOpenModal(false);
					}}
				/>
			</div>
		</div>
	);
}
