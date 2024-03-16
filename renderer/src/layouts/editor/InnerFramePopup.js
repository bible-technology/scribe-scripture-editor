import { useState, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { PDFViewer } from '@react-pdf/renderer';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

const path = require('path');
const fs = window.require('fs');

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

export default function InnerFramePopup() {
  const [numPages, setNumPages] = useState();
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfPath, setPdfPath] = useState(path.join(localStorage.getItem('userPath'), '..', '/Downloads/tit_page_72-73.pdf'));

  function readPdf(localPath) {
    if(fs.existsSync(localPath)) {
      const data = fs.readFileSync(path.join(localPath));
      return { data };
    }
  }
  const myPdfFile = useMemo(() => readPdf(pdfPath), [pdfPath]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  return (
    <div style={{ display: 'flex', height: '100%', border: '15px solid black' }}>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Toolbar for the PDF Document */}
        <div style={{
          borderBottom: '2px solid gray',
          padding: '10px',
          backgroundColor: '#f0f0f0',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          textAlign: 'center',
        }}>
          <p>Page {pageNumber} of {numPages}</p>
        </div>

        {/* PDF Viewer */}
        <div className="pdfViewer">
          <Document file={myPdfFile} onLoadSuccess={onDocumentLoadSuccess}>
            {Array.from({ length: numPages }, (_, i) => i + 1)
              .map((page, ind) => (
                <Page pageNumber={page} key={`pages_${ind}`} className={"pageContainer"} />
              ))}
          </Document>
        </div>
      </div>
      {/* Second Box */}
      <div style={{
        flex: 1,
        borderLeft: '2px solid gray',
        overflowY: 'scroll',
      }}>
        <p> Hello, I'm a content !</p>
      </div>
    </div>
  );
}
