import { useEffect, useState, useContext } from 'react';
import { Button } from '@material-ui/core';
import { AccordionPicker } from './SectionAccordion';
import i18n from 'src/translations/i18n';
import Trash from './../../../../../public/icons/trash.svg';
import { OBSWrapperSortableList } from './HeaderWrapper/OBSHeaderWrapper';
import { BCVWrapperSortableList } from './HeaderWrapper/BCVHeaderWrapper';
import { v4 as uuidv4 } from 'uuid';
import { ProjectContext } from '@/components/context/ProjectContext';
import { AutographaContext } from '@/components/context/AutographaContext';
import { findProjectInfo } from '../../InnerFramePopup';
export function WrapperTemplate({
	setFinalPrint,
	projectInfo,
	wrapperType,
	keyWrapper,
	setUpdate,
	advanceMode,
	changePrintData,
	changePrintOrder,
}) {
	
	const [orderSections, setOrderSelections] = useState([0]);
	const [sections, setSections] = useState(
		firstElem(projectInfo),
	);
	console.log(sections);
	//choice is the possible section by wrapper

	useEffect(() => {
		setSections(firstElem(projectInfo));
	}, [projectInfo]);

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
					<div style={{ display: 'flex' }}>
						<Button
							style={{
								borderStyle: 'solid',
								color: 'white',
							}}
							onClick={() => {
								changePrintOrder((prev) => {
									let t = [...prev];
									t.splice(
										t.indexOf(parseInt(keyWrapper)),
										1,
									);
									return t;
								});

								changePrintData((prev) => {
									const updatedSelected = JSON.parse(
										JSON.stringify(prev),
									);
									const up = {};
									// Remove the last key in the map as it's not required
									delete updatedSelected[
										parseInt(keyWrapper)
									];
									return updatedSelected;
								});
							}}>
							<Trash
								color={'black'}
								style={{ height: 35, width: 35 }}
							/>
						</Button>
					</div>
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
									projectInfo={projectInfo}
									advanceMode={advanceMode}
									setSelected={setSections}
									setOrderSelections={setOrderSelections}
									keySpecification={
										JSON.parse(sections)[k].type
									}
									idjson={k}
									removeButton={
										advanceMode ? (
											<Button
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
												<Trash
													color={'black'}
													style={{
														fill: 'black',
														height: 35,
														width: 35,
													}}
												/>
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
							onClick={() => {
								setOrderSelections((prev) => [
									...prev,
									prev.length,
								]);
								setSections((prev) => {
									prev = JSON.parse(prev);
									let len = Object.keys(prev).length;
									prev[len] = {
										id: uuidv4(),
										type: 'null',
										content: {},
									};
									return JSON.stringify(prev);
								});
							}}>
							Add
						</Button>
					) : (
						<div
							style={{
								padding: 17,
							}}></div>
					)}
				</div>
			</div>
		</div>
	);
}

function firstElem(projectInfo) {
	return `{"0": {"id":"${uuidv4()}", "type": "null", "source":"${
		projectInfo.path
	}","content": {} }}`;
}
