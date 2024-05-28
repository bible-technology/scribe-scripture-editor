import { useState, useMemo, useEffect, useContext } from 'react';

import 'react-pdf/dist/Page/TextLayer.css';
import { Modal } from '@material-ui/core';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { selectOption } from './selectOptions';
import { Button } from '@mui/material';
import ExpandMore from '../../../../public/icons/expand_more.svg';
import { PdfPreview } from './pdfGenInterface/PdfPreview';
import { v4 as uuidv4 } from 'uuid';

import {
	TextOnlyTooltip,
	StyledSwitch,
} from './pdfGenInterface/pdfGenWrappers/fieldPicker/customMuiComponent';
import { WrapperTemplate } from './pdfGenInterface/pdfGenWrappers/WrapperTemplate';

export default function InnerFramePopup() {
	const init = { bcvWrapper: ['bcvBible'], obsWrapper: ['obs'] };
	const jsonWithHeaderChoice = global.PdfGenStatic.pageInfo();
	//use to know if we can drag or not
	const [update, setUpdate] = useState(true);

	//the order Of The Selected choice
	const [orderSelection, setOrderSelection] = useState([0]);

	//is the json is validate or not
	const [isJsonValidate, setIsJsonValidate] = useState(false);

	//the actual kitchenFaucet
	const [selected, setSelected] = useState({
		0: {
			type: 'obsWrapper',
			id: uuidv4(),
			content: {
				content: { 0: { type: 'obs', content: {} } },
				order: [0],
			},
		},
	});

	useEffect(() => {
		console.log(
			global.PdfGenInstance.validateConfig(
				transformPrintDataToKitchenFoset({
					order: orderSelection,
					metaData: JSON.parse(headerInfo),
					content: selected,
				}),
			),
		);
		if (
			global.PdfGenInstance.validateConfig(
				transformPrintDataToKitchenFoset({
					order: orderSelection,
					metaData: JSON.parse(headerInfo),
					content: selected,
				}),
			).length === 0
		) {
			setIsJsonValidate(true);
		} else {
			setIsJsonValidate(false);
		}
	}, [selected]);
	//advenceMode allow adding new Wrapper
	const [advanceMode, setAdvenceMode] = useState(false);

	//the selected headerInfo
	const [headerInfo, setHeaderInfo] = useState('{}');
	//zoom of the preview

	const [openModalAddWrapper, setOpenModalAddWrapper] = useState(false);

	const handleOpenModalAddWrapper = (isOpen) => {
		setOpenModalAddWrapper(isOpen);
	};

	const handleChangeHeaderInfo = (type, value) => {
		let t = JSON.parse(headerInfo);
		t[type] = value;
		setHeaderInfo(JSON.stringify(t));
	};

	let sortableListClassName = 'sortable-TESTWRAPPER-list';
	let itemClassName = 'sortable-test1-item';

	//This useEffect Allow the user to drag end drop element in a list (here the wrapper themSelf)
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
			if (update) {
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
					return (
						e.clientY <=
						sibling.offsetTop - sibling.offsetHeight / 2
					);
				});

				sortableList.insertBefore(draggingItem, nextSibling);
			}
		};

		sortableList.addEventListener('dragover', initSortableList);
		sortableList.addEventListener('dragenter', (e) => e.preventDefault());

		return () => {
			sortableList.removeEventListener('dragover', initSortableList);
			items.forEach((item) => {
				item.removeEventListener('dragstart', () => {
					setTimeout(() => item.classList.add('dragging'), 0);
				});
			});
		};
	}, [update]);

	return (
		<div
			style={{
				display: 'flex',
				height: '100%',
				backgroundColor: '#FFFFFF',
				width: '100%',
				borderBottomWidth: 2,
				borderStyle: 'solid',
				borderColor: '#EEEEEE',
			}}>
			<PdfPreview></PdfPreview>

			<div
				style={{
					width: '50%',
					borderLeft: '2px solid gray',
					overflowY: 'scroll',
					padding: 20,
				}}>
				<div
					style={{
						padding: 20,
						borderBottomWidth: 1,
						borderStyle: 'solid',
						borderColor: '#575757',
					}}>
					{selectOption(
						'fonts',
						'fonts',
						jsonWithHeaderChoice.fonts,
						handleChangeHeaderInfo,
					)}
					{selectOption(
						'Pages',
						'pages',
						jsonWithHeaderChoice.pages,
						handleChangeHeaderInfo,
					)}
					{selectOption(
						'Sizes',
						'sizes',
						jsonWithHeaderChoice.sizes,
						handleChangeHeaderInfo,
					)}
				</div>
				<div style={{ padding: 5 }}>
					<div
						style={{
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'space-between',
						}}>
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								gap: 8,
							}}>
							<div
								style={{
									fontWeight: 'regular',
									display: 'flex',
									fontSize: 18,
									color: 'Black',
									justifyContent: 'left',
								}}>
								Content
							</div>
							<div
								style={{
									backgroundColor: '#464646',
									borderRadius: 25,
									justifyContent: 'center',
									color: 'white',
									alignContent: 'center',
									justifyItems: 'center',
									textAlign: 'center',
									alignItems: 'center',
									paddingTop: 5,
									paddingBottom: 5,
									paddingLeft: 11,
									paddingRight: 11,
								}}
								onClick={() => {}}>
								Reset parameters
							</div>
						</div>
						<TextOnlyTooltip
							placement='top-end'
							title={
								<div>
									<div
										style={{
											fontSize: 14,
											fontStyle: 'normal',
											fontWeight: 600,
										}}>
										Advanced
									</div>
									<div
										style={{
											fontSize: 14,
											fontStyle: 'normal',
											fontWeight: 400,
										}}>
										mode Merge projects into a single
										export, access more print types, and use
										loop mode.
									</div>
								</div>
							}
							arrow>
							<div
								style={{
									display: 'flex',
									flexDirection: 'column',
									gap: 8,
								}}>
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										color: 'black',
										fontFamily: 'Lato',
										fontWeight: 400,
										fontSize: 20,
									}}>
									Advanced mode
								</div>
								<div
									style={{
										display: 'flex',
										flexDirection: 'row',
									}}>
									<StyledSwitch
										onChange={() =>
											setAdvenceMode((prev) => !prev)
										}
									/>
									<div
										style={{
											alignSelf: 'center',
											display: 'flex',
											alignItems: 'center',
											color: 'black',
											fontFamily: 'Lato',
											fontWeight: 400,
											fontSize: 20,
										}}>
										{advanceMode ? 'On' : 'Off'}
									</div>
								</div>
							</div>
						</TextOnlyTooltip>
					</div>
					<ul className={'sortable-TESTWRAPPER-list'}>
						{Object.keys(selected).map((k, index) => {
							return (
								<li
									id={'index'}
									className={'sortable-test1-item'}
									draggable='true'
									key={'index'}
									style={{ margin: 10 }}>
									<WrapperTemplate
										setFinalPrint={setSelected}
										wrapperType={selected[k].type}
										keyWrapper={k}
										setUpdate={setUpdate}
										advanceMode={advanceMode}
										changePrintData={setSelected}
										changePrintOrder={setOrderSelection}
									/>
								</li>
							);
						})}
					</ul>
					{advanceMode ? (
						<div
							style={{
								borderRadius: 6,
								borderWidth: 1,
								borderStyle: 'solid',
								borderCollor: '#EEEEEE',
								display: 'flex',
								padding: 1,
								flexDirection: 'column',
								alignItems: 'flexStart',
								alignSelf: 'stretch',
								backgroundColor: '#FCFAFA',
								padding: 12,
								margin: 12,
							}}>
							<div
								style={{
									display: 'flex',
									width: 80,
									height: 28,
									paddingLeft: 12,
									borderRadius: 4,
									paddingRight: 6,
									justifyContent: 'space-between',
									alignItems: 'center',
									backgroundColor: '#F50',
									color: 'white',
								}}
								onClick={() => handleOpenModalAddWrapper(true)}>
								Add
								<ExpandMore />
							</div>
						</div>
					) : (
						<></>
					)}

					<div
						style={{
							display: 'flex',
							justifyContent: 'center',
							padding: 15,
						}}>
						<Button
							style={
								isJsonValidate
									? {
											borderRadius: 4,
											backgroundColor: '#F50',
											borderStyle: 'solid',
											borderColor: '#F50',
											color: 'white',
											padding: 15,
									  }
									: {
											borderRadius: 4,
											backgroundColor: 'grey',
											borderStyle: 'solid',
											borderColor: '#F50',
											color: 'white',
											padding: 15,
									  }
							}
							onClick={() => {
								transformPrintDataToKitchenFoset({
									order: orderSelection,
									metaData: JSON.parse(headerInfo),
									content: selected,
								});
							}}>
							Print
						</Button>
					</div>
				</div>
				<Modal
					open={openModalAddWrapper}
					onClose={() => handleOpenModalAddWrapper(false)}
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
							borderRadius: 10,
						}}>
						<div>
							{Object.keys(init).map((c, id) => (
								<div
									className='pdfChoice'
									onClick={() => {
										setSelected((prev) => {
											let t = { ...prev };
											let nb = Object.keys(t).length;
											t[nb] = { type: c, content: {} };
											return t;
										});
										setOrderSelection((prev) => [
											...prev,
											prev.length,
										]);
										handleOpenModalAddWrapper(false);
									}}>
									{c}
								</div>
							))}
						</div>
					</div>
				</Modal>
			</div>
		</div>
	);
}

function transformPrintDataToKitchenFoset(jsonData) {
	let kitchenFoset = [];
	if (jsonData.content) {
		for (let i = 0; i < jsonData.order.length; i++) {
			let currentWrapper = jsonData.content[jsonData.order[i]];

			let elem = { ...currentWrapper };
			delete elem['content'];
			elem.sections = [];
			if (currentWrapper.content.order) {
				for (let t = 0; t < currentWrapper.content.order.length; t++) {
					console.log(
						currentWrapper.content.content[
							currentWrapper.content.order[t]
						],
					);
					elem.sections.push(
						currentWrapper.content.content[
							currentWrapper.content.order[t]
						],
					);
				}
			}

			kitchenFoset.push(elem);
		}
	}
	return { global: jsonData.metaData, sections: kitchenFoset };
}
