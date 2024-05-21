import { useState, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { PDFViewer } from '@react-pdf/renderer';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { SortableList } from './SortableList';
import { selectOption } from './selectOptions';
import { Button } from '@mui/material';
import i18n from 'src/translations/i18n';

const path = require('path');
const fs = window.require('fs');

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
	'pdfjs-dist/build/pdf.worker.min.js',
	import.meta.url,
).toString();

function Fontsizes() {
	let options = [];
	for (let i = 12; i < 48; i += 2) {
		options.push(i);
	}
	return options;
}

export default function InnerFramePopup() {
	const path = require('path');
	const fs = window.require('fs');
	
	// const jxl2 = require("./fieldPicker/specification/jxl2.json")
	const jxl2 = global.PdfGen.pageInfo();
	console.log('pageInfo ==',jxl2);
	console.log('from require',require("./fieldPicker/specification/jxl2.json"));
	//list of all non selected choice

	//the order Of The Selected choice
	const [orderSelection, setOrderSelection] = useState([
	
	]);
	//all the selected choice
	const [selected, setSelected] = useState({});

	const [metaInfo ,setMetaInfo] = useState('{}')
	const [zoom, setZoom] = useState(1);
	const [numPages, setNumPages] = useState();
	const [pageNumber, setPageNumber] = useState(1);
	const [pdfPath, setPdfPath] = useState(
		path.join(
			localStorage.getItem('userPath'),
			'..',
			'/Documents/tit_page_72-73.pdf',
		),
	);

	console.log(selected)

	function readPdf(localPath) {
		if (fs.existsSync(localPath)) {
			const data = fs.readFileSync(path.join(localPath));
			return { data };
		}
	}
	const myPdfFile = useMemo(() => readPdf(pdfPath), [pdfPath]);
	const handleChange = (type,value) => {
		
		let t = JSON.parse(metaInfo)
		t[type] = jxl2[type][value]
		setMetaInfo(JSON.stringify(t))
	}
	function onDocumentLoadSuccess({ numPages }) {
		setNumPages(numPages);
	}

	return (
		<div
			style={{
				display: 'flex',
				height: '100%',
				backgroundColor: '#303134',
				width: '100%',
			}}>
			<div
				style={{
					position: 'relative',
					width: '70%',
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
					width: '40%',
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
					{selectOption("fonts",  "fonts",jxl2.fonts,handleChange)}
					{selectOption('Pages',  "pages" ,jxl2.pages,handleChange)}
					{selectOption('Sizes', "sizes",jxl2.sizes ,handleChange)}
				</div>
				<div
					style={{
						display: 'flex',
						fontSize: 24,
						justifyContent: 'center',
						color: 'white',
						padding: 12,
					}}>
					Content
				</div>
				<SortableList
					orderSelection={orderSelection}
					setOrderSelection={setOrderSelection}
					selected={selected}
					setSelected={setSelected}
				/>
			</div>
			<Button
					style={{
						borderRadius: 4,
						backgroundColor: '#F50',
						borderStyle: 'solid',
						borderColor: '#F50',
						color: 'white',
					}}
					onClick={() =>{console.log({order:orderSelection,metaData:JSON.parse(metaInfo),content:selected})}}>
					Print
				</Button>
		</div>
	);
}

const buttonStyle = {};

