// import { Document, Page } from 'react-pdf';
// import { PDFViewer } from '@react-pdf/renderer';
// import { useState, useMemo, useEffect } from 'react';
// // Correcting the URL construction
// import { pdfjs } from 'react-pdf';

// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   'pdfjs-dist/build/pdf.worker.min.js',
//   import.meta.url
// ).toString();

// //This component is te pdf preview view, it is mostly a place holder for now
// export function PdfPreview() {
//   const path = require('path');
//   const fs = window.require('fs');
//   const [zoom, setZoom] = useState(1);
//   const [numPages, setNumPages] = useState();
//   const [pageNumber, setPageNumber] = useState(1);
//   const [pdfPath, setPdfPath] = useState(
//     path.join(
//       localStorage.getItem('userPath'),
//       '..',
//       '/Documents/tit_page_72-73.pdf',
//     ),
//   );
//   const myPdfFile = useMemo(() => readPdf(pdfPath), [pdfPath]);

//   function readPdf(localPath) {
//     if (fs.existsSync(localPath)) {
//       const data = fs.readFileSync(path.join(localPath));
//       return { data };
//     }
//   }

//   function onDocumentLoadSuccess({ numPages }) {
//     setNumPages(numPages);
//   }

//   return (
//     <div
//       style={{
//         position: 'relative',
//         width: '50%',
//         display: 'flex',
//         flexDirection: 'column',
//         flex: 1,
//       }}>
//       {/* Toolbar for the PDF Document */}
//       <div
//         style={{
//           position: 'absolute',
//           width: 'fit-content',
//           backgroundColor: '#303134',
//           bottom: 10,
//           right: 10,
//           zIndex: 1,
//           borderRadius: 30,
//           display: 'flex',
//           paddingLeft: 12,
//           paddingRight: 12,
//           paddingTop: 6,
//           paddingBottom: 6,
//           justifyContent: 'center',
//           alignItems: 'center',
//           color: 'white',
//           userSelect: 'none',
//         }}>
//         <div>
//           {pageNumber} / {numPages ? numPages : 'none'}
//         </div>
//       </div>
//       <div
//         onClick={() => setZoom((prev) => prev + 0.1)}
//         style={{
//           position: 'absolute',
//           width: 40,
//           height: 40,
//           backgroundColor: '#303134',
//           borderRadius: 30,
//           bottom: 60,
//           left: 10,
//           zIndex: 1,
//           display: 'flex',
//           padding: 6,
//           fontSize: 24,
//           justifyContent: 'center',
//           alignItems: 'center',
//           color: 'white',
//           cursor: 'pointer',
//           userSelect: 'none',
//         }}>
//         +
//       </div>
//       <div
//         onClick={() => setZoom((prev) => prev - 0.1)}
//         style={{
//           position: 'absolute',
//           width: 40,
//           height: 40,
//           backgroundColor: '#303134',
//           borderRadius: 30,
//           bottom: 10,
//           left: 10,
//           zIndex: 1,
//           display: 'flex',
//           padding: 6,
//           fontSize: 24,
//           justifyContent: 'center',
//           alignItems: 'center',
//           color: 'white',
//           cursor: 'pointer',
//           userSelect: 'none',
//         }}>
//         &ndash;
//       </div>
//       {/* PDF Viewer */}
//       <div
//         className='pdfViewer'
//         style={{
//           backgroundColor: '#eeeeee',
//           display: 'flex',
//           justifyContent: 'center',
//           padding: '8px',
//           zIndex: 0,
//         }}>
//         <Document
//           file={myPdfFile}
//           onLoadSuccess={onDocumentLoadSuccess}>
//           {Array.from({ length: numPages }, (_, i) => i + 1).map(
//             (page, ind) => (
//               <Page
//                 pageNumber={page}
//                 key={`pages_${ind}`}
//                 className={'pageContainer'}
//                 scale={zoom}
//               />
//             ),
//           )}
//         </Document>
//       </div>
//     </div>
//   );
// }
