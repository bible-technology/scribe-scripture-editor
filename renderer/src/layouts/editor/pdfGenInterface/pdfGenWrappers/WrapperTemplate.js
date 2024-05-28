import { useEffect, useState } from 'react';
import { Button } from '@material-ui/core';
import { AccordionPicker } from './SectionAccordion';
import i18n from 'src/translations/i18n';
import Trash from './../../../../../public/icons/trash.svg';
import { ModalSectionSelection } from './modalSectionSelection';
import { OBSWrapperSortableList } from './HeaderWrapper/OBSHeaderWrapper';
import { BCVWrapperSortableList } from './HeaderWrapper/BCVHeaderWrapper';
import { v4 as uuidv4 } from 'uuid';

export function WrapperTemplate({
	setFinalPrint,
	wrapperType,
	keyWrapper,
	setUpdate,
	advanceMode,
	changePrintData,
	changePrintOrder,
}) {
	const [openModalSectionSelection, setOpenModalSectionSelection] =
		useState(false);

	const [orderSections, setOrderSelections] = useState([0]);
	const [sections, setSections] = useState(firstElem(wrapperType));

	//choice is the possible section by wrapper

	const listChoiceSectionByWrapper =
		require('./fieldPicker/WrapperSection.json')[wrapperType];
	const [LoopMode, setLoopMode] = useState(false);

	const sortableListClassName = `sortable-${keyWrapper}-list`;
	const itemClassName = `sortable-${keyWrapper}-item`;

	//update Order selection
	useEffect(() => {
		setFinalPrint((prev) => {
			const t = { ...prev };
			t[keyWrapper].content.order = orderSections;
			return t;
		});
	}, [orderSections]);

	//update final print Json
	useEffect(() => {
		setFinalPrint((prev) => {
			const t = { ...prev };
			t[keyWrapper].content.content = JSON.parse(sections);
			return t;
		});
	}, [sections]);

	//Sortable list logic
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
	}, [Object.keys(JSON.parse(sections)).length]);

	const updateElemOrder = (items) => {
		const t = [];
		items.forEach((item) => {
			t.push(parseInt(item.id));
		});
		setOrderSelections(t);
	};
	const handleOpenModal = (isOpen) => {
		setOpenModalSectionSelection(isOpen);
	};

	return (
		<div
			style={{
				width: '100%',
				borderStyle: 'solid',
				borderColor: '#EEEEEE',
				borderWidth: 1,
				backgroundColor: '#FCFAFA',
				padding: 15,
				borderRadius: 10,
			}}>
			{wrapperType === 'bcvWrapper' ? (
				<BCVWrapperSortableList
					keyWrapper={keyWrapper}
					advanceMode={advanceMode}
					changePrintData={changePrintData}
					setLoopMode={setLoopMode}
					loopMode={LoopMode}
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
					loopMode={LoopMode}
				/>
			) : (
				<></>
			)}
			<div
				style={
					LoopMode
						? {
								backgroundColor: '#FFEEE5',
						  }
						: {
								backgroundColor: '#EEEEEE',
						  }
				}>
				<div
					style={{
						display: 'flex',
						justifyContent: 'end',
					}}>
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
										t.splice(t.indexOf(keyWrapper), 1);
										for (let i = 0; i < t.length; i++) {
											if (t[i] > keyWrapper) {
												t[i] -= 1;
											}
										}
										return t;
									});

									changePrintData((prev) => {
										const updatedSelected = {
											...prev,
										};
										const up = {};

										Object.keys(updatedSelected).forEach(
											(key) => {
												if (
													parseInt(key) > keyWrapper
												) {
													let newIndex =
														parseInt(key) - 1;
													up[newIndex] =
														updatedSelected[key];
												} else if (
													parseInt(key) < keyWrapper
												) {
													up[key] =
														updatedSelected[key];
												}
											},
										);
										return up;
									});
								}}>
								<Trash color={'black'} style={{height: 35, width: 35 }} />
							</Button>
						</div>
					) : (
						<></>
					)}
				</div>

				<ul className={sortableListClassName}>
					{Object.keys(JSON.parse(sections)).map((k, index) => (
						<li
							id={index}
							className={itemClassName}
							draggable='true'
							key={k + '_' + index}
							onDragStart={() => setUpdate(false)}
							onDragEnd={() => setUpdate(true)}
							style={{ padding: 5 }}>
							<div
								style={{
									flexDirection: 'row',
									display: 'flex',
								}}>
								<AccordionPicker
									language={i18n.language}
									wrapperType={wrapperType}
									advanceMode={advanceMode}
									setSelected={setSections}
									keySpecification={
										JSON.parse(sections)[k].type
									}
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
													setOrderSelections(
														(prev) => {
															let t = [...prev];
															t.splice(
																t.indexOf(
																	index,
																),
																1,
															);
															for (
																let i = 0;
																i < t.length;
																i++
															) {
																if (
																	t[i] > index
																) {
																	t[i] -= 1;
																}
															}
															return t;
														},
													);
													setSections((prev) => {
														const updatedSelected =
															{
																...JSON.parse(
																	prev,
																),
															};
														const up = {};

														Object.keys(
															updatedSelected,
														).forEach((key) => {
															if (
																parseInt(key) >
																index
															) {
																let newIndex =
																	parseInt(
																		key,
																	) - 1;
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

														return JSON.stringify(
															up,
														);
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
						open={openModalSectionSelection}
						setOpen={setOpenModalSectionSelection}
						table={listChoiceSectionByWrapper}
						setSelected={(c) => {
							setSections((prev) => {
								let t = { ...JSON.parse(prev) };
								let nb = Object.keys(t).length;
								t[nb] = {
									id: `${uuidv4()}`,
									type: c,
									content: {},
								};

								return JSON.stringify(t);
							});
							setOrderSelections((prev) => [
								...prev,
								prev.length,
							]);
							setOpenModalSectionSelection(false);
						}}
					/>
				</div>
			</div>
		</div>
	);
}

function firstElem(wrapperType) {
	let type;
	if (wrapperType === 'bcvWrapper') {
		type = 'bcvBible';
	}
	if (wrapperType === 'obsWrapper') {
		type = 'obs';
	}
	if (wrapperType === 'JxlWrapper') {
		type = 'JxlSimple';
	}
	if (wrapperType === 'markdown') {
		type = markdown;
	}

	return `{"0": {"id":"${uuidv4()}", "type": "${type}", "content": {} }}`;
}
