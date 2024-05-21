import { useState, useMemo, useEffect, useContext } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { PDFViewer } from '@react-pdf/renderer';
import 'react-pdf/dist/Page/TextLayer.css';
import { Modal } from '@material-ui/core';
import { BCVWrapperSortableList } from './pdfGenWrappers/BCVWrapperSortableList';
import { OBSWrapperSortableList } from './pdfGenWrappers/OBSWrapperSortableList';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { selectOption } from './selectOptions';
import { ProjectContext } from '@/components/context/ProjectContext';
import Switch from '@material-ui/core/Switch';
import { Button } from '@mui/material';

import { styled } from '@material-ui/core/styles';
import ExpandMore from '../../../../public/icons/expand_more.svg';
const StyledSwitch = styled(Switch)(({ theme }) => ({
	'& .MuiSwitch-switchBase.Mui-checked': {
		color: '#FF5500',
		'&:hover': {
			backgroundColor: '#FF5500',
		},
	},
	'& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
		backgroundColor: '#FF5500',
	},
}));
const path = require('path');
const fs = window.require('fs');

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
	'pdfjs-dist/build/pdf.worker.min.js',
	import.meta.url,
).toString();

const test = (values) => {
	console.log(values);
};

export default function InnerFramePopup() {
	const [name, setName] = useState();
	const {
		states: { canonSpecification, canonList },
		actions: { setcanonSpecification },
	} = useContext(ProjectContext);

	const init = { bcvWrapper: ['bcvBible'], obsWrapper: ['obs'] };

	const path = require('path');
	const fs = window.require('fs');

	const jxl2 = require('./fieldPicker/specification/jxl2.json');
	//list of all non selected choice
	const [update, setUpdate] = useState(true);
	//the order Of The Selected choice

	const [orderSelection, setOrderSelection] = useState([0]);
	const [selected, setSelected] = useState({
		0: {
			type: 'obsWrapper',
			content: {
				content: { 0: { type: 'obs', content: {} } },
				order: [0],
			},
		},
	});
	const [advanceMode, setAdvenceMode] = useState(false);
	const [metaInfo, setMetaInfo] = useState('{}');
	const [zoom, setZoom] = useState(1);
	const [numPages, setNumPages] = useState();
	const [pageNumber, setPageNumber] = useState(1);
	const [openModal, setOpenModal] = useState(false);

	console.log(orderSelection);
	const [pdfPath, setPdfPath] = useState(
		path.join(
			localStorage.getItem('userPath'),
			'..',
			'/Documents/tit_page_72-73.pdf',
		),
	);

	const [bibleNav, setBibleNav] = useState(true);

	function closeBooks() {
		setBibleNav(false);
	}
	const handleOpenModal = (isOpen) => {
		setOpenModal(isOpen);
	};
	function readPdf(localPath) {
		if (fs.existsSync(localPath)) {
			const data = fs.readFileSync(path.join(localPath));
			return { data };
		}
	}
	const myPdfFile = useMemo(() => readPdf(pdfPath), [pdfPath]);
	const handleChange = (type, value) => {
		let t = JSON.parse(metaInfo);
		t[type] = value;
		setMetaInfo(JSON.stringify(t));
	};
	function onDocumentLoadSuccess({ numPages }) {
		setNumPages(numPages);
	}

	let sortableListClassName = 'sortable-TESTWRAPPER-list';
	let itemClassName = 'sortable-test1-item';
	false;
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
						e.clientY <= sibling.offsetTop - sibling.offsetHeight /2 
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
			<div
				style={{
					position: 'relative',
					width: '50%',
					display: 'flex',
					flexDirection: 'column',
					flex: 1,
				}}>
				{/* Toolbar for the PDF Document */}
				<div
					style={{
						position: 'absolute',
						width: 'fit-content',
						backgroundColor: '#303134',
						bottom: 10,
						right: 10,
						zIndex: 1,
						borderRadius: 30,
						display: 'flex',
						paddingLeft: 12,
						paddingRight: 12,
						paddingTop: 6,
						paddingBottom: 6,
						justifyContent: 'center',
						alignItems: 'center',
						color: 'white',
						userSelect: 'none',
					}}>
					<div>
						{pageNumber} / {numPages ? numPages : 'none'}
					</div>
				</div>
				<div
					onClick={() => setZoom((prev) => prev + 0.1)}
					style={{
						position: 'absolute',
						width: 40,
						height: 40,
						backgroundColor: '#303134',
						borderRadius: 30,
						bottom: 60,
						left: 10,
						zIndex: 1,
						display: 'flex',
						padding: 6,
						fontSize: 24,
						justifyContent: 'center',
						alignItems: 'center',
						color: 'white',
						cursor: 'pointer',
						userSelect: 'none',
					}}>
					+
				</div>
				<div
					onClick={() => setZoom((prev) => prev - 0.1)}
					style={{
						position: 'absolute',
						width: 40,
						height: 40,
						backgroundColor: '#303134',
						borderRadius: 30,
						bottom: 10,
						left: 10,
						zIndex: 1,
						display: 'flex',
						padding: 6,
						fontSize: 24,
						justifyContent: 'center',
						alignItems: 'center',
						color: 'white',
						cursor: 'pointer',
						userSelect: 'none',
					}}>
					&ndash;
				</div>
				{/* PDF Viewer */}
				<div
					className='pdfViewer'
					style={{
						backgroundColor: '#eeeeee',
						display: 'flex',
						justifyContent: 'center',
						padding: '8px',
						zIndex: 0,
					}}>
					<Document
						file={myPdfFile}
						onLoadSuccess={onDocumentLoadSuccess}>
						{Array.from({ length: numPages }, (_, i) => i + 1).map(
							(page, ind) => (
								<Page
									pageNumber={page}
									key={`pages_${ind}`}
									className={'pageContainer'}
									scale={zoom}
								/>
							),
						)}
					</Document>
				</div>
			</div>

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
					{selectOption('fonts', 'fonts', jxl2.fonts, handleChange)}
					{selectOption('Pages', 'pages', jxl2.pages, handleChange)}
					{selectOption('Sizes', 'sizes', jxl2.sizes, handleChange)}
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
								fontWeight: 'regular',
								display: 'flex',
								fontSize: 24,
								color: 'Black',
								justifyContent: 'left',
							}}>
							Content
						</div>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								color: 'black',
								fontFamily: 'Lato',
								fontWeight: 400,
								fontSize: 20,
							}}>
							advanced mode
						</div>
					</div>
					<div
						style={{
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'space-between',
						}}>
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
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								marginRight: 25,
							}}>
							<StyledSwitch
								onChange={() => setAdvenceMode((prev) => !prev)}
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
					<ul className={'sortable-TESTWRAPPER-list'}>
						{Object.keys(selected).map((k, index) => {
							if (selected[k].type === 'obsWrapper') {
								return (
									<li
										id={'index'}
										className={'sortable-test1-item'}
										draggable='true'
										key={'index'}
										style={{ margin: 10 }}>
										<OBSWrapperSortableList
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
							}
							if (selected[k].type === 'bcvWrapper') {
								return (
									<li
										id={'PREMUER'}
										className={'sortable-test1-item'}
										draggable='true'
										key={'PREMUER'}
										style={{ margin: 10 }}>
										<BCVWrapperSortableList
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
							}
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
								onClick={() => handleOpenModal(true)}>
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
							style={{
								borderRadius: 4,
								backgroundColor: '#F50',
								borderStyle: 'solid',
								borderColor: '#F50',
								color: 'white',
								padding: 15,
							}}
							onClick={() => {
								transformPrintDataToKitchenFoset('test', {
									order: orderSelection,
									metaData: JSON.parse(metaInfo),
									content: selected,
								});
							}}>
							Print
						</Button>
					</div>
				</div>
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
										handleOpenModal(false);
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

function transformPrintDataToKitchenFoset(header, jsonData) {
	let kitchenFoset = [];
	console.log(jsonData);
	for (let i = 0; i < jsonData.order.length; i++) {
		let currentWrapper = jsonData.content[jsonData.order[i]];
		console.log(currentWrapper);

		let elem = {...currentWrapper}
		delete elem["content"]; 
		elem.sections = []

		for (let t = 0; t < currentWrapper.content.order.length; t++) {
			console.log(currentWrapper);
			elem.sections.push(
				currentWrapper.content.content[currentWrapper.content.order[t]],
			);
		}
		kitchenFoset.push(elem);
		
	}

	console.log({global:header,sections:kitchenFoset});
}
