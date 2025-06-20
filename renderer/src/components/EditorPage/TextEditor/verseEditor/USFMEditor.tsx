// // // // import React, { useState, useEffect, useRef, useCallback } from 'react';
// // // // import {
// // // //   Upload,
// // // //   Undo,
// // // //   Redo,
// // // //   Edit,
// // // //   Eye,
// // // //   List,
// // // //   AlignLeft,
// // // //   FileText,
// // // //   Code
// // // // } from 'lucide-react';

// // // // const USFMEditor = () => {
// // // //   const [content, setContent] = useState('');
// // // //   const [isEditable, setIsEditable] = useState(true);
// // // //   const [isParaView, setIsParaView] = useState(true);
// // // //   const [isPreviewMode, setIsPreviewMode] = useState(true);
// // // //   const [showRawUSFM, setShowRawUSFM] = useState(false);
// // // //   const [history, setHistory] = useState([]);
// // // //   const [historyIndex, setHistoryIndex] = useState(-1);
// // // //   const editorRef = useRef(null);
// // // //   const fileInputRef = useRef(null);
// // // //   const lastContentRef = useRef('');
// // // //   const isUndoRedoRef = useRef(false);

// // // //   // Sample USFM content
// // // //   const sampleUSFM = `\\id MRK
// // // // \\h MRK
// // // // \\mt MRK
// // // // \\c 1
// // // // \\p
// // // // \\v 1 The beginning of the gospel of Jesus Christ, the Son of God.
// // // // \\v 2 As it is written in Isaiah the prophet, "Behold, I send my messenger before your face, who will prepare your way,
// // // // \\v 3 the voice of one crying in the wilderness: 'Prepare the way of the Lord, make his paths straight.'"
// // // // \\v 4 John appeared, baptizing in the wilderness and proclaiming a baptism of repentance for the forgiveness of sins.
// // // // \\c 2
// // // // \\p
// // // // \\v 1 And when he returned to Capernaum after some days, it was reported that he was at home.
// // // // \\v 2 And many were gathered together, so that there was no more room, not even at the door.`;

// // // //   useEffect(() => {
// // // //     setContent(sampleUSFM);
// // // //     setHistory([sampleUSFM]);
// // // //     setHistoryIndex(0);
// // // //     lastContentRef.current = sampleUSFM;
// // // //   }, []);

// // // //   const parseUSFM = (usfmText) => {
// // // //     const lines = usfmText.split('\n');
// // // //     const parsed = [];
// // // //     let currentParagraph = null;

// // // //     lines.forEach(line => {
// // // //       line = line.trim();
// // // //       if (!line) return;

// // // //       if (line.startsWith('\\id ')) {
// // // //         // Skip ID lines
// // // //         return;
// // // //       } else if (line.startsWith('\\h ')) {
// // // //         parsed.push({
// // // //           type: 'heading',
// // // //           content: line.substring(3).trim()
// // // //         });
// // // //       } else if (line.startsWith('\\mt ')) {
// // // //         // Skip MT lines
// // // //         return;
// // // //       } else if (line.startsWith('\\c ')) {
// // // //         const chapterNum = line.substring(3).trim();
// // // //         parsed.push({
// // // //           type: 'chapter',
// // // //           number: chapterNum,
// // // //           content: isPreviewMode ? `Chapter ${chapterNum}` : line
// // // //         });
// // // //       } else if (line.startsWith('\\p')) {
// // // //         currentParagraph = {
// // // //           type: 'paragraph',
// // // //           verses: []
// // // //         };
// // // //         parsed.push(currentParagraph);
// // // //       } else if (line.startsWith('\\v ')) {
// // // //         const verseMatch = line.match(/\\v (\d+)\s*(.*)/);
// // // //         if (verseMatch && currentParagraph) {
// // // //           currentParagraph.verses.push({
// // // //             number: verseMatch[1],
// // // //             text: verseMatch[2]
// // // //           });
// // // //         }
// // // //       }
// // // //     });

// // // //     return parsed;
// // // //   };



// // // //   const reconstructUSFMFromEditor = () => {
// // // //     if (!editorRef.current || showRawUSFM) return content;

// // // //     let reconstructed = '\\id MRK\n\\h MRK\n\\mt MRK\n';
// // // //     const elements = editorRef.current.children;

// // // //     for (let element of elements) {
// // // //       if (element.tagName === 'H1') {
// // // //         // Skip heading reconstruction as it's derived from \\h
// // // //         continue;
// // // //       } else if (element.tagName === 'H2') {
// // // //         const chapterMatch = element.textContent.match(/Chapter (\d+)/);
// // // //         if (chapterMatch) {
// // // //           reconstructed += `\\c ${chapterMatch[1]}\n`;
// // // //         }
// // // //       } else if (element.tagName === 'P' || element.tagName === 'DIV') {
// // // //         reconstructed += '\\p\n';

// // // //         if (isParaView) {
// // // //           // Handle paragraph view
// // // //           const spans = element.children;
// // // //           for (let span of spans) {
// // // //             if (span.classList && span.classList.contains('verse-container')) {
// // // //               const verseNum = span.querySelector('.verse-number')?.textContent;
// // // //               const verseText = span.querySelector('.editable-text')?.textContent || '';
// // // //               if (verseNum) {
// // // //                 reconstructed += `\\v ${verseNum} ${verseText}\n`;
// // // //               }
// // // //             }
// // // //           }
// // // //         } else {
// // // //           // Handle line-by-line view
// // // //           const lines = element.children;
// // // //           for (let line of lines) {
// // // //             if (line.classList && line.classList.contains('verse-line')) {
// // // //               const verseNum = line.querySelector('.verse-number')?.textContent;
// // // //               const verseText = line.querySelector('.editable-text')?.textContent || '';
// // // //               if (verseNum) {
// // // //                 reconstructed += `\\v ${verseNum} ${verseText}\n`;
// // // //               }
// // // //             }
// // // //           }
// // // //         }
// // // //       }
// // // //     }

// // // //     return reconstructed.trim();
// // // //   };

// // // //   const handleContentChange = useCallback(() => {
// // // //     if (isUndoRedoRef.current) {
// // // //       isUndoRedoRef.current = false;
// // // //       return;
// // // //     }

// // // //     const newContent = reconstructUSFMFromEditor();
// // // //     if (newContent !== lastContentRef.current) {
// // // //       setContent(newContent);
// // // //       saveToHistory(newContent);
// // // //       lastContentRef.current = newContent;
// // // //     }
// // // //   }, []);

// // // //   const saveToHistory = (newContent) => {
// // // //     const newHistory = history.slice(0, historyIndex + 1);
// // // //     newHistory.push(newContent);
// // // //     setHistory(newHistory);
// // // //     setHistoryIndex(newHistory.length - 1);
// // // //   };

// // // //   const handleUndo = () => {
// // // //     if (historyIndex > 0) {
// // // //       isUndoRedoRef.current = true;
// // // //       const newIndex = historyIndex - 1;
// // // //       setHistoryIndex(newIndex);
// // // //       setContent(history[newIndex]);
// // // //       lastContentRef.current = history[newIndex];
// // // //     }
// // // //   };

// // // //   const handleRedo = () => {
// // // //     if (historyIndex < history.length - 1) {
// // // //       isUndoRedoRef.current = true;
// // // //       const newIndex = historyIndex + 1;
// // // //       setHistoryIndex(newIndex);
// // // //       setContent(history[newIndex]);
// // // //       lastContentRef.current = history[newIndex];
// // // //     }
// // // //   };

// // // //   const handleKeyDown = (e) => {
// // // //     const selection = window.getSelection();
// // // //     if (!selection.rangeCount) return;

// // // //     const range = selection.getRangeAt(0);
// // // //     const container = range.commonAncestorContainer;

// // // //     // Check if we're trying to delete protected elements
// // // //     const isInProtectedElement = (node) => {
// // // //       let current = node.nodeType === Node.TEXT_NODE ? node.parentNode : node;
// // // //       while (current && current !== editorRef.current) {
// // // //         if (current.classList && (
// // // //           current.classList.contains('verse-number') ||
// // // //           current.classList.contains('chapter-number') ||
// // // //           current.tagName === 'H2'
// // // //         )) {
// // // //           return true;
// // // //         }
// // // //         current = current.parentNode;
// // // //       }
// // // //       return false;
// // // //     };

// // // //     // Prevent deletion of protected elements
// // // //     if ((e.key === 'Backspace' || e.key === 'Delete') &&
// // // //       (isInProtectedElement(container) ||
// // // //         (range.startContainer !== range.endContainer &&
// // // //           (isInProtectedElement(range.startContainer) || isInProtectedElement(range.endContainer))))) {
// // // //       e.preventDefault();
// // // //       return false;
// // // //     }
// // // //   };

// // // //   const handleMouseDown = (e) => {
// // // //     // Prevent selection of protected elements
// // // //     if (e.target.classList && (
// // // //       e.target.classList.contains('verse-number') ||
// // // //       e.target.classList.contains('chapter-number') ||
// // // //       e.target.tagName === 'H2'
// // // //     )) {
// // // //       e.preventDefault();
// // // //     }
// // // //   };

// // // //   useEffect(() => {
// // // //     if (editorRef.current) {
// // // //       const editor = editorRef.current;
// // // //       editor.addEventListener('input', handleContentChange);
// // // //       editor.addEventListener('keydown', handleKeyDown);
// // // //       editor.addEventListener('mousedown', handleMouseDown);

// // // //       return () => {
// // // //         editor.removeEventListener('input', handleContentChange);
// // // //         editor.removeEventListener('keydown', handleKeyDown);
// // // //         editor.removeEventListener('mousedown', handleMouseDown);
// // // //       };
// // // //     }
// // // //   }, [handleContentChange, isParaView, showRawUSFM]);

// // // //   const renderContent = () => {
// // // //     if (showRawUSFM) {
// // // //       return (
// // // //         <div className="whitespace-pre-wrap font-mono text-sm">
// // // //           {content}
// // // //         </div>
// // // //       );
// // // //     }

// // // //     const parsed = parseUSFM(content);

// // // //     return parsed.map((item, index) => {
// // // //       if (item.type === 'heading') {
// // // //         return (
// // // //           <h1 key={index} className="text-2xl font-bold mb-4 text-blue-800">
// // // //             {item.content}
// // // //           </h1>
// // // //         );
// // // //       } else if (item.type === 'chapter') {
// // // //         return (
// // // //           <h2
// // // //             key={index}
// // // //             className="text-xl font-semibold mb-3 mt-6 text-green-700 chapter-number select-none cursor-default"
// // // //             style={{ userSelect: 'none', pointerEvents: 'none' }}
// // // //           >
// // // //             {item.content}
// // // //           </h2>
// // // //         );
// // // //       } else if (item.type === 'paragraph') {
// // // //         if (isParaView) {
// // // //           return (
// // // //             <p key={index} className="mb-4 leading-relaxed">
// // // //               {item.verses.map((verse, vIndex) => (
// // // //                 <span key={vIndex} className="verse-container">
// // // //                   <span
// // // //                     className="font-bold text-red-600 verse-number select-none cursor-default mr-1"
// // // //                     style={{ userSelect: 'none', pointerEvents: 'none' }}
// // // //                   >
// // // //                     {verse.number}
// // // //                   </span>
// // // //                   <span
// // // //                     className="editable-text"
// // // //                     contentEditable={isEditable}
// // // //                     suppressContentEditableWarning={true}
// // // //                   >
// // // //                     {verse.text}
// // // //                   </span>
// // // //                   {vIndex < item.verses.length - 1 && ' '}
// // // //                 </span>
// // // //               ))}
// // // //             </p>
// // // //           );
// // // //         } else {
// // // //           return (
// // // //             <div key={index} className="mb-4">
// // // //               {item.verses.map((verse, vIndex) => (
// // // //                 <div key={vIndex} className="mb-2 verse-line">
// // // //                   <span
// // // //                     className="font-bold text-red-600 verse-number select-none cursor-default mr-2"
// // // //                     style={{ userSelect: 'none', pointerEvents: 'none' }}
// // // //                   >
// // // //                     {verse.number}
// // // //                   </span>
// // // //                   <span
// // // //                     className="editable-text"
// // // //                     contentEditable={isEditable}
// // // //                     suppressContentEditableWarning={true}
// // // //                   >
// // // //                     {verse.text}
// // // //                   </span>
// // // //                 </div>
// // // //               ))}
// // // //             </div>
// // // //           );
// // // //         }
// // // //       }
// // // //       return null;
// // // //     });
// // // //   };

// // // //   const handleFileUpload = (event) => {
// // // //     const file = event.target.files[0];
// // // //     if (file && file.name.endsWith('.usfm')) {
// // // //       const reader = new FileReader();
// // // //       reader.onload = (e) => {
// // // //         const newContent = e.target.result;
// // // //         setContent(newContent);
// // // //         saveToHistory(newContent);
// // // //         lastContentRef.current = newContent;
// // // //       };
// // // //       reader.readAsText(file);
// // // //     }
// // // //   };

// // // //   const handleContextMenu = (e) => {
// // // //     e.preventDefault();

// // // //     // Don't show context menu on protected elements
// // // //     if (e.target.classList && (
// // // //       e.target.classList.contains('verse-number') ||
// // // //       e.target.classList.contains('chapter-number') ||
// // // //       e.target.tagName === 'H2'
// // // //     )) {
// // // //       return;
// // // //     }

// // // //     // Create context menu
// // // //     const menu = document.createElement('div');
// // // //     menu.className = 'fixed bg-white border border-gray-300 rounded shadow-lg z-50 py-1';
// // // //     menu.style.left = e.pageX + 'px';
// // // //     menu.style.top = e.pageY + 'px';

// // // //     const menuItems = [
// // // //       { label: 'Cut', action: () => document.execCommand('cut') },
// // // //       { label: 'Copy', action: () => document.execCommand('copy') },
// // // //       { label: 'Paste', action: () => document.execCommand('paste') },
// // // //       {
// // // //         label: 'Paste as Plain Text', action: () => {
// // // //           navigator.clipboard.readText().then(text => {
// // // //             document.execCommand('insertText', false, text);
// // // //           });
// // // //         }
// // // //       }
// // // //     ];

// // // //     menuItems.forEach(item => {
// // // //       const menuItem = document.createElement('div');
// // // //       menuItem.className = 'px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm';
// // // //       menuItem.textContent = item.label;
// // // //       menuItem.onclick = () => {
// // // //         item.action();
// // // //         document.body.removeChild(menu);
// // // //       };
// // // //       menu.appendChild(menuItem);
// // // //     });

// // // //     document.body.appendChild(menu);

// // // //     // Remove menu on click outside
// // // //     const removeMenu = () => {
// // // //       if (document.body.contains(menu)) {
// // // //         document.body.removeChild(menu);
// // // //       }
// // // //       document.removeEventListener('click', removeMenu);
// // // //     };

// // // //     setTimeout(() => {
// // // //       document.addEventListener('click', removeMenu);
// // // //     }, 0);
// // // //   };

// // // //   return (
// // // //     <div className="w-full max-w-6xl mx-auto p-4">
// // // //       {/* Toolbar */}
// // // //       <div className="bg-gray-100 border rounded-t-lg p-3 flex items-center gap-2 flex-wrap">
// // // //         <button
// // // //           onClick={handleUndo}
// // // //           disabled={historyIndex <= 0}
// // // //           className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
// // // //           title="Undo"
// // // //         >
// // // //           <Undo size={16} />
// // // //         </button>

// // // //         <button
// // // //           onClick={handleRedo}
// // // //           disabled={historyIndex >= history.length - 1}
// // // //           className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
// // // //           title="Redo"
// // // //         >
// // // //           <Redo size={16} />
// // // //         </button>

// // // //         <div className="w-px h-6 bg-gray-300 mx-1"></div>

// // // //         <button
// // // //           onClick={() => setIsEditable(!isEditable)}
// // // //           className={`p-2 rounded hover:bg-gray-200 ${isEditable ? 'bg-blue-200' : ''}`}
// // // //           title="Toggle Edit Mode"
// // // //         >
// // // //           {isEditable ? <Edit size={16} /> : <Eye size={16} />}
// // // //         </button>

// // // //         <div className="w-px h-6 bg-gray-300 mx-1"></div>

// // // //         <button
// // // //           onClick={() => setIsParaView(!isParaView)}
// // // //           className={`p-2 rounded hover:bg-gray-200 ${isParaView ? 'bg-green-200' : ''}`}
// // // //           title="Toggle Paragraph View"
// // // //         >
// // // //           {isParaView ? <AlignLeft size={16} /> : <List size={16} />}
// // // //         </button>

// // // //         <div className="w-px h-6 bg-gray-300 mx-1"></div>

// // // //         <button
// // // //           onClick={() => setIsPreviewMode(!isPreviewMode)}
// // // //           className={`p-2 rounded hover:bg-gray-200 ${isPreviewMode ? 'bg-purple-200' : ''}`}
// // // //           title="Toggle Preview Mode"
// // // //         >
// // // //           {isPreviewMode ? <Eye size={16} /> : <Code size={16} />}
// // // //         </button>

// // // //         <button
// // // //           onClick={() => setShowRawUSFM(!showRawUSFM)}
// // // //           className={`p-2 rounded hover:bg-gray-200 ${showRawUSFM ? 'bg-orange-200' : ''}`}
// // // //           title="Show Raw USFM"
// // // //         >
// // // //           <FileText size={16} />
// // // //         </button>

// // // //         <div className="w-px h-6 bg-gray-300 mx-1"></div>

// // // //         <button
// // // //           onClick={() => fileInputRef.current?.click()}
// // // //           className="p-2 rounded hover:bg-gray-200"
// // // //           title="Upload USFM File"
// // // //         >
// // // //           <Upload size={16} />
// // // //         </button>

// // // //         <input
// // // //           ref={fileInputRef}
// // // //           type="file"
// // // //           accept=".usfm"
// // // //           onChange={handleFileUpload}
// // // //           className="hidden"
// // // //         />

// // // //         <div className="ml-auto text-sm text-gray-600">
// // // //           <span className="mr-4">
// // // //             {isEditable ? 'Editable' : 'Read-only'}
// // // //           </span>
// // // //           <span className="mr-4">
// // // //             {isParaView ? 'Paragraph' : 'Line-by-line'}
// // // //           </span>
// // // //           <span className="mr-4">
// // // //             {isPreviewMode ? 'Preview' : 'Raw'}
// // // //           </span>
// // // //           {showRawUSFM && <span>Raw USFM</span>}
// // // //         </div>
// // // //       </div>

// // // //       {/* Editor */}
// // // //       <div
// // // //         ref={editorRef}
// // // //         className="border border-t-0 rounded-b-lg p-6 min-h-96 bg-white focus:outline-none"
// // // //         contentEditable={isEditable && !showRawUSFM}
// // // //         onContextMenu={handleContextMenu}
// // // //         suppressContentEditableWarning={true}
// // // //         style={{
// // // //           minHeight: '500px',
// // // //           maxHeight: '800px',
// // // //           overflowY: 'auto'
// // // //         }}
// // // //       >
// // // //         {renderContent()}
// // // //       </div>

// // // //       {/* Status Bar */}
// // // //       <div className="bg-gray-50 border border-t-0 rounded-b-lg px-4 py-2 text-xs text-gray-500">
// // // //         Right-click for context menu | Chapter numbers and verse numbers are protected | History: {historyIndex + 1}/{history.length}
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // };

// // // // export default USFMEditor;

// // // import React, { useState, useEffect, useRef, useCallback } from 'react';
// // // import {
// // //   Upload,
// // //   Undo,
// // //   Redo,
// // //   Edit,
// // //   Eye,
// // //   List,
// // //   AlignLeft,
// // //   FileText,
// // //   Code,
// // //   Download
// // // } from 'lucide-react';

// // // const USFMEditor = () => {
// // //   const [content, setContent] = useState('');
// // //   const [isEditable, setIsEditable] = useState(true);
// // //   const [isParaView, setIsParaView] = useState(true);
// // //   const [isPreviewMode, setIsPreviewMode] = useState(true);
// // //   const [showRawUSFM, setShowRawUSFM] = useState(false);
// // //   const [history, setHistory] = useState([]);
// // //   const [historyIndex, setHistoryIndex] = useState(-1);
// // //   const [hiddenTags, setHiddenTags] = useState({});
// // //   const editorRef = useRef(null);
// // //   const fileInputRef = useRef(null);
// // //   const lastContentRef = useRef('');
// // //   const isUndoRedoRef = useRef(false);

// // //   // Sample USFM content - Psalms
// // //   const sampleUSFM = `\\id PSA Unlocked Literal Bible
// // // \\ide UTF-8
// // // \\h Psalms
// // // \\toc1 The Book of Psalms
// // // \\toc2 Psalms
// // // \\toc3 Psa
// // // \\mt Psalms
// // // \\cl Psalm
// // // \\s5
// // // \\ms Book One
// // // \\c 1
// // // \\q
// // // \\v 1 Blessed is the man who does not walk in the advice of the wicked,
// // // \\q or stand in the pathway with sinners,
// // // \\q or sit in the assembly of mockers.
// // // \\q
// // // \\v 2 But his delight is in the law of Yahweh,
// // // \\q and on his law he meditates day and night.
// // // \\s5
// // // \\q
// // // \\v 3 He will be like a tree planted by the streams of water
// // // \\q that produces its fruit in its season,
// // // \\q whose leaves do not wither;
// // // \\q whatever he does will prosper.
// // // \\s5
// // // \\q
// // // \\v 4 The wicked are not so,
// // // \\q but are instead like the chaff that the wind drives away.
// // // \\q
// // // \\v 5 So the wicked will not stand in the judgment,
// // // \\q nor sinners in the assembly of the righteous.
// // // \\s5
// // // \\q
// // // \\v 6 For Yahweh approves of the way of the righteous,
// // // \\q but the way of the wicked will perish.
// // // \\s5
// // // \\c 2
// // // \\m
// // // \\q
// // // \\v 1 Why are the nations in turmoil,
// // // \\q and why do the peoples make plots that will fail?
// // // \\q
// // // \\v 2 The kings of the earth take their stand together
// // // \\q and the rulers conspire together
// // // \\q against Yahweh and against his Messiah, saying,
// // // \\q
// // // \\v 3 "Let us tear off the shackles they put on us
// // // \\q and throw off their chains."
// // // \\s5
// // // \\q
// // // \\v 4 He who sits in the heavens will sneer at them;
// // // \\q the Lord mocks them.
// // // \\q
// // // \\v 5 Then he will speak to them in his anger
// // // \\q and terrify them in his rage, saying,`;

// // //   useEffect(() => {
// // //     setContent(sampleUSFM);
// // //     setHistory([sampleUSFM]);
// // //     setHistoryIndex(0);
// // //     lastContentRef.current = sampleUSFM;
// // //     parseAndStoreHiddenTags(sampleUSFM);
// // //   }, []);

// // //   const parseAndStoreHiddenTags = (usfmText) => {
// // //     const lines = usfmText.split('\n');
// // //     const hidden = {
// // //       metadata: [],
// // //       sections: {},
// // //       poetry: {}
// // //     };

// // //     let currentChapter = null;
// // //     let currentVerse = null;
// // //     let lineIndex = 0;

// // //     lines.forEach(line => {
// // //       line = line.trim();
// // //       if (!line) return;

// // //       if (line.startsWith('\\id ') || line.startsWith('\\ide ') || 
// // //           line.startsWith('\\toc') || line.startsWith('\\mt ') || 
// // //           line.startsWith('\\cl ')) {
// // //         hidden.metadata.push(line);
// // //       } else if (line.startsWith('\\s5') || line.startsWith('\\ms ') || 
// // //                  line.startsWith('\\m') || line.startsWith('\\q')) {
// // //         if (currentChapter !== null) {
// // //           if (!hidden.sections[currentChapter]) {
// // //             hidden.sections[currentChapter] = [];
// // //           }
// // //           hidden.sections[currentChapter].push({
// // //             line: line,
// // //             position: currentVerse || 'before'
// // //           });
// // //         } else {
// // //           hidden.metadata.push(line);
// // //         }
// // //       } else if (line.startsWith('\\c ')) {
// // //         currentChapter = line.substring(3).trim();
// // //         currentVerse = null;
// // //       } else if (line.startsWith('\\v ')) {
// // //         const verseMatch = line.match(/\\v (\d+)\s*(.*)/);
// // //         if (verseMatch) {
// // //           currentVerse = verseMatch[1];
// // //         }
// // //       }
// // //     });

// // //     setHiddenTags(hidden);
// // //   };

// // //   const parseUSFM = (usfmText) => {
// // //     const lines = usfmText.split('\n');
// // //     const parsed = [];
// // //     let currentChapter = null;
// // //     let currentParagraph = null;
// // //     let headingFound = false;

// // //     lines.forEach(line => {
// // //       line = line.trim();
// // //       if (!line) return;

// // //       if (line.startsWith('\\h ')) {
// // //         if (!headingFound) {
// // //           parsed.push({
// // //             type: 'heading',
// // //             content: line.substring(3).trim()
// // //           });
// // //           headingFound = true;
// // //         }
// // //       } else if (line.startsWith('\\c ')) {
// // //         const chapterNum = line.substring(3).trim();
// // //         currentChapter = chapterNum;
// // //         parsed.push({
// // //           type: 'chapter',
// // //           number: chapterNum,
// // //           content: `Chapter ${chapterNum}`
// // //         });
// // //         currentParagraph = null;
// // //       } else if (line.startsWith('\\v ')) {
// // //         const verseMatch = line.match(/\\v (\d+)\s*(.*)/);
// // //         if (verseMatch) {
// // //           if (!currentParagraph) {
// // //             currentParagraph = {
// // //               type: 'paragraph',
// // //               verses: [],
// // //               chapter: currentChapter
// // //             };
// // //             parsed.push(currentParagraph);
// // //           }

// // //           currentParagraph.verses.push({
// // //             number: verseMatch[1],
// // //             text: verseMatch[2]
// // //           });
// // //         }
// // //       }
// // //     });

// // //     return parsed;
// // //   };

// // //   const reconstructUSFMFromEditor = () => {
// // //     if (!editorRef.current || showRawUSFM) return content;

// // //     let reconstructed = '';

// // //     // Add metadata
// // //     if (hiddenTags.metadata) {
// // //       reconstructed += hiddenTags.metadata.join('\n') + '\n';
// // //     }

// // //     const elements = editorRef.current.children;
// // //     let currentChapter = null;

// // //     for (let element of elements) {
// // //       if (element.tagName === 'H1') {
// // //         // Skip heading reconstruction as it's in metadata
// // //         continue;
// // //       } else if (element.tagName === 'H2') {
// // //         const chapterMatch = element.textContent.match(/Chapter (\d+)/);
// // //         if (chapterMatch) {
// // //           currentChapter = chapterMatch[1];

// // //           // Add section tags before chapter if they exist
// // //           if (hiddenTags.sections && hiddenTags.sections[currentChapter]) {
// // //             const beforeTags = hiddenTags.sections[currentChapter].filter(
// // //               tag => tag.position === 'before'
// // //             );
// // //             beforeTags.forEach(tag => {
// // //               reconstructed += tag.line + '\n';
// // //             });
// // //           }

// // //           reconstructed += `\\c ${currentChapter}\n`;
// // //         }
// // //       } else if (element.tagName === 'P' || element.tagName === 'DIV') {
// // //         if (isParaView) {
// // //           // Handle paragraph view
// // //           const spans = element.children;
// // //           for (let span of spans) {
// // //             if (span.classList && span.classList.contains('verse-container')) {
// // //               const verseNum = span.querySelector('.verse-number')?.textContent;
// // //               const verseText = span.querySelector('.editable-text')?.textContent || '';

// // //               if (verseNum && currentChapter) {
// // //                 // Add section tags for this verse if they exist
// // //                 if (hiddenTags.sections && hiddenTags.sections[currentChapter]) {
// // //                   const verseTags = hiddenTags.sections[currentChapter].filter(
// // //                     tag => tag.position === verseNum
// // //                   );
// // //                   verseTags.forEach(tag => {
// // //                     reconstructed += tag.line + '\n';
// // //                   });
// // //                 }

// // //                 reconstructed += `\\v ${verseNum} ${verseText}\n`;
// // //               }
// // //             }
// // //           }
// // //         } else {
// // //           // Handle line-by-line view
// // //           const lines = element.children;
// // //           for (let line of lines) {
// // //             if (line.classList && line.classList.contains('verse-line')) {
// // //               const verseNum = line.querySelector('.verse-number')?.textContent;
// // //               const verseText = line.querySelector('.editable-text')?.textContent || '';

// // //               if (verseNum && currentChapter) {
// // //                 // Add section tags for this verse if they exist
// // //                 if (hiddenTags.sections && hiddenTags.sections[currentChapter]) {
// // //                   const verseTags = hiddenTags.sections[currentChapter].filter(
// // //                     tag => tag.position === verseNum
// // //                   );
// // //                   verseTags.forEach(tag => {
// // //                     reconstructed += tag.line + '\n';
// // //                   });
// // //                 }

// // //                 reconstructed += `\\v ${verseNum} ${verseText}\n`;
// // //               }
// // //             }
// // //           }
// // //         }
// // //       }
// // //     }

// // //     return reconstructed.trim();
// // //   };

// // //   const handleContentChange = useCallback(() => {
// // //     if (isUndoRedoRef.current) {
// // //       isUndoRedoRef.current = false;
// // //       return;
// // //     }

// // //     const newContent = reconstructUSFMFromEditor();
// // //     if (newContent !== lastContentRef.current) {
// // //       setContent(newContent);
// // //       saveToHistory(newContent);
// // //       lastContentRef.current = newContent;
// // //     }
// // //   }, [hiddenTags]);

// // //   const saveToHistory = (newContent) => {
// // //     const newHistory = history.slice(0, historyIndex + 1);
// // //     newHistory.push(newContent);
// // //     setHistory(newHistory);
// // //     setHistoryIndex(newHistory.length - 1);
// // //   };

// // //   const handleUndo = () => {
// // //     if (historyIndex > 0) {
// // //       isUndoRedoRef.current = true;
// // //       const newIndex = historyIndex - 1;
// // //       setHistoryIndex(newIndex);
// // //       setContent(history[newIndex]);
// // //       lastContentRef.current = history[newIndex];
// // //       parseAndStoreHiddenTags(history[newIndex]);
// // //     }
// // //   };

// // //   const handleRedo = () => {
// // //     if (historyIndex < history.length - 1) {
// // //       isUndoRedoRef.current = true;
// // //       const newIndex = historyIndex + 1;
// // //       setHistoryIndex(newIndex);
// // //       setContent(history[newIndex]);
// // //       lastContentRef.current = history[newIndex];
// // //       parseAndStoreHiddenTags(history[newIndex]);
// // //     }
// // //   };

// // //   const handleExport = () => {
// // //     const exportContent = reconstructUSFMFromEditor();
// // //     const blob = new Blob([exportContent], { type: 'text/plain' });
// // //     const url = URL.createObjectURL(blob);
// // //     const a = document.createElement('a');
// // //     a.href = url;
// // //     a.download = 'exported.usfm';
// // //     document.body.appendChild(a);
// // //     a.click();
// // //     document.body.removeChild(a);
// // //     URL.revokeObjectURL(url);
// // //   };

// // //   const handleKeyDown = (e) => {
// // //     const selection = window.getSelection();
// // //     if (!selection.rangeCount) return;

// // //     const range = selection.getRangeAt(0);
// // //     const container = range.commonAncestorContainer;

// // //     // Check if we're trying to delete protected elements
// // //     const isInProtectedElement = (node) => {
// // //       let current = node.nodeType === Node.TEXT_NODE ? node.parentNode : node;
// // //       while (current && current !== editorRef.current) {
// // //         if (current.classList && (
// // //           current.classList.contains('verse-number') ||
// // //           current.classList.contains('chapter-number') ||
// // //           current.tagName === 'H1' ||
// // //           current.tagName === 'H2'
// // //         )) {
// // //           return true;
// // //         }
// // //         current = current.parentNode;
// // //       }
// // //       return false;
// // //     };

// // //     // Prevent deletion of protected elements
// // //     if ((e.key === 'Backspace' || e.key === 'Delete') &&
// // //       (isInProtectedElement(container) ||
// // //         (range.startContainer !== range.endContainer &&
// // //           (isInProtectedElement(range.startContainer) || isInProtectedElement(range.endContainer))))) {
// // //       e.preventDefault();
// // //       return false;
// // //     }
// // //   };

// // //   const handleMouseDown = (e) => {
// // //     // Prevent selection of protected elements
// // //     if (e.target.classList && (
// // //       e.target.classList.contains('verse-number') ||
// // //       e.target.classList.contains('chapter-number') ||
// // //       e.target.tagName === 'H1' ||
// // //       e.target.tagName === 'H2'
// // //     )) {
// // //       e.preventDefault();
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     if (editorRef.current) {
// // //       const editor = editorRef.current;
// // //       editor.addEventListener('input', handleContentChange);
// // //       editor.addEventListener('keydown', handleKeyDown);
// // //       editor.addEventListener('mousedown', handleMouseDown);

// // //       return () => {
// // //         editor.removeEventListener('input', handleContentChange);
// // //         editor.removeEventListener('keydown', handleKeyDown);
// // //         editor.removeEventListener('mousedown', handleMouseDown);
// // //       };
// // //     }
// // //   }, [handleContentChange, isParaView, showRawUSFM]);

// // //   const renderContent = () => {
// // //     if (showRawUSFM) {
// // //       return (
// // //         <div className="whitespace-pre-wrap font-mono text-sm">
// // //           {content}
// // //         </div>
// // //       );
// // //     }

// // //     const parsed = parseUSFM(content);

// // //     return parsed.map((item, index) => {
// // //       if (item.type === 'heading') {
// // //         return (
// // //           <h1 key={index} className="text-3xl font-bold mb-6 text-blue-800 text-center select-none cursor-default">
// // //             {item.content}
// // //           </h1>
// // //         );
// // //       } else if (item.type === 'chapter') {
// // //         return (
// // //           <h2
// // //             key={index}
// // //             className="text-2xl font-semibold mb-4 mt-8 text-green-700 chapter-number select-none cursor-default text-center"
// // //             style={{ userSelect: 'none', pointerEvents: 'none' }}
// // //           >
// // //             {item.content}
// // //           </h2>
// // //         );
// // //       } else if (item.type === 'paragraph') {
// // //         if (isParaView) {
// // //           return (
// // //             <div key={index} className="mb-6 leading-relaxed">
// // //               {item.verses.map((verse, vIndex) => (
// // //                 <p key={vIndex} className="verse-container mb-2">
// // //                   <span
// // //                     className="font-bold text-red-600 verse-number select-none cursor-default mr-2 text-lg"
// // //                     style={{ userSelect: 'none', pointerEvents: 'none' }}
// // //                   >
// // //                     {verse.number}
// // //                   </span>
// // //                   <span
// // //                     className="editable-text text-lg leading-relaxed"
// // //                     contentEditable={isEditable}
// // //                     suppressContentEditableWarning={true}
// // //                   >
// // //                     {verse.text}
// // //                   </span>
// // //                 </p>
// // //               ))}
// // //             </div>
// // //           );
// // //         } else {
// // //           return (
// // //             <div key={index} className="mb-6">
// // //               {item.verses.map((verse, vIndex) => (
// // //                 <div key={vIndex} className="mb-3 verse-line">
// // //                   <span
// // //                     className="font-bold text-red-600 verse-number select-none cursor-default mr-3 text-lg"
// // //                     style={{ userSelect: 'none', pointerEvents: 'none' }}
// // //                   >
// // //                     {verse.number}
// // //                   </span>
// // //                   <span
// // //                     className="editable-text text-lg leading-relaxed"
// // //                     contentEditable={isEditable}
// // //                     suppressContentEditableWarning={true}
// // //                   >
// // //                     {verse.text}
// // //                   </span>
// // //                 </div>
// // //               ))}
// // //             </div>
// // //           );
// // //         }
// // //       }
// // //       return null;
// // //     });
// // //   };

// // //   const handleFileUpload = (event) => {
// // //     const file = event.target.files[0];
// // //     if (file && file.name.endsWith('.usfm')) {
// // //       const reader = new FileReader();
// // //       reader.onload = (e) => {
// // //         const newContent = e.target.result;
// // //         setContent(newContent);
// // //         saveToHistory(newContent);
// // //         lastContentRef.current = newContent;
// // //         parseAndStoreHiddenTags(newContent);
// // //       };
// // //       reader.readAsText(file);
// // //     }
// // //   };

// // //   const handleContextMenu = (e) => {
// // //     e.preventDefault();

// // //     // Don't show context menu on protected elements
// // //     if (e.target.classList && (
// // //       e.target.classList.contains('verse-number') ||
// // //       e.target.classList.contains('chapter-number') ||
// // //       e.target.tagName === 'H1' ||
// // //       e.target.tagName === 'H2'
// // //     )) {
// // //       return;
// // //     }

// // //     // Create context menu
// // //     const menu = document.createElement('div');
// // //     menu.className = 'fixed bg-white border border-gray-300 rounded shadow-lg z-50 py-1';
// // //     menu.style.left = e.pageX + 'px';
// // //     menu.style.top = e.pageY + 'px';

// // //     const menuItems = [
// // //       { label: 'Cut', action: () => document.execCommand('cut') },
// // //       { label: 'Copy', action: () => document.execCommand('copy') },
// // //       { label: 'Paste', action: () => document.execCommand('paste') },
// // //       {
// // //         label: 'Paste as Plain Text', action: () => {
// // //           navigator.clipboard.readText().then(text => {
// // //             document.execCommand('insertText', false, text);
// // //           });
// // //         }
// // //       }
// // //     ];

// // //     menuItems.forEach(item => {
// // //       const menuItem = document.createElement('div');
// // //       menuItem.className = 'px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm';
// // //       menuItem.textContent = item.label;
// // //       menuItem.onclick = () => {
// // //         item.action();
// // //         document.body.removeChild(menu);
// // //       };
// // //       menu.appendChild(menuItem);
// // //     });

// // //     document.body.appendChild(menu);

// // //     // Remove menu on click outside
// // //     const removeMenu = () => {
// // //       if (document.body.contains(menu)) {
// // //         document.body.removeChild(menu);
// // //       }
// // //       document.removeEventListener('click', removeMenu);
// // //     };

// // //     setTimeout(() => {
// // //       document.addEventListener('click', removeMenu);
// // //     }, 0);
// // //   };

// // //   return (
// // //     <div className="w-full max-w-6xl mx-auto p-4">
// // //       {/* Toolbar */}
// // //       <div className="bg-gray-100 border rounded-t-lg p-3 flex items-center gap-2 flex-wrap">
// // //         <button
// // //           onClick={handleUndo}
// // //           disabled={historyIndex <= 0}
// // //           className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
// // //           title="Undo"
// // //         >
// // //           <Undo size={16} />
// // //         </button>

// // //         <button
// // //           onClick={handleRedo}
// // //           disabled={historyIndex >= history.length - 1}
// // //           className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
// // //           title="Redo"
// // //         >
// // //           <Redo size={16} />
// // //         </button>

// // //         <div className="w-px h-6 bg-gray-300 mx-1"></div>

// // //         <button
// // //           onClick={() => setIsEditable(!isEditable)}
// // //           className={`p-2 rounded hover:bg-gray-200 ${isEditable ? 'bg-blue-200' : ''}`}
// // //           title="Toggle Edit Mode"
// // //         >
// // //           {isEditable ? <Edit size={16} /> : <Eye size={16} />}
// // //         </button>

// // //         <div className="w-px h-6 bg-gray-300 mx-1"></div>

// // //         <button
// // //           onClick={() => setIsParaView(!isParaView)}
// // //           className={`p-2 rounded hover:bg-gray-200 ${isParaView ? 'bg-green-200' : ''}`}
// // //           title="Toggle Paragraph View"
// // //         >
// // //           {isParaView ? <AlignLeft size={16} /> : <List size={16} />}
// // //         </button>

// // //         <div className="w-px h-6 bg-gray-300 mx-1"></div>

// // //         <button
// // //           onClick={() => setIsPreviewMode(!isPreviewMode)}
// // //           className={`p-2 rounded hover:bg-gray-200 ${isPreviewMode ? 'bg-purple-200' : ''}`}
// // //           title="Toggle Preview Mode"
// // //         >
// // //           {isPreviewMode ? <Eye size={16} /> : <Code size={16} />}
// // //         </button>

// // //         <button
// // //           onClick={() => setShowRawUSFM(!showRawUSFM)}
// // //           className={`p-2 rounded hover:bg-gray-200 ${showRawUSFM ? 'bg-orange-200' : ''}`}
// // //           title="Show Raw USFM"
// // //         >
// // //           <FileText size={16} />
// // //         </button>

// // //         <div className="w-px h-6 bg-gray-300 mx-1"></div>

// // //         <button
// // //           onClick={() => fileInputRef.current?.click()}
// // //           className="p-2 rounded hover:bg-gray-200"
// // //           title="Upload USFM File"
// // //         >
// // //           <Upload size={16} />
// // //         </button>

// // //         <button
// // //           onClick={handleExport}
// // //           className="p-2 rounded hover:bg-gray-200 bg-yellow-200"
// // //           title="Export USFM File"
// // //         >
// // //           <Download size={16} />
// // //         </button>

// // //         <input
// // //           ref={fileInputRef}
// // //           type="file"
// // //           accept=".usfm"
// // //           onChange={handleFileUpload}
// // //           className="hidden"
// // //         />

// // //         <div className="ml-auto text-sm text-gray-600">
// // //           <span className="mr-4">
// // //             {isEditable ? 'Editable' : 'Read-only'}
// // //           </span>
// // //           <span className="mr-4">
// // //             {isParaView ? 'Paragraph' : 'Line-by-line'}
// // //           </span>
// // //           <span className="mr-4">
// // //             {isPreviewMode ? 'Preview' : 'Raw'}
// // //           </span>
// // //           {showRawUSFM && <span>Raw USFM</span>}
// // //         </div>
// // //       </div>

// // //       {/* Editor */}
// // //       <div
// // //         ref={editorRef}
// // //         className="border border-t-0 rounded-b-lg p-6 min-h-96 bg-white focus:outline-none"
// // //         contentEditable={isEditable && !showRawUSFM}
// // //         onContextMenu={handleContextMenu}
// // //         suppressContentEditableWarning={true}
// // //         style={{
// // //           minHeight: '500px',
// // //           maxHeight: '800px',
// // //           overflowY: 'auto'
// // //         }}
// // //       >
// // //         {renderContent()}
// // //       </div>

// // //       {/* Status Bar */}
// // //       <div className="bg-gray-50 border border-t-0 rounded-b-lg px-4 py-2 text-xs text-gray-500">
// // //         Right-click for context menu | Headings, chapter numbers and verse numbers are protected | History: {historyIndex + 1}/{history.length} | Export button saves all USFM data with hidden tags
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default USFMEditor;
// // // import React, { useState, useEffect, useRef, useCallback } from 'react';
// // // import {
// // //   Upload,
// // //   Undo,
// // //   Redo,
// // //   Edit,
// // //   Eye,
// // //   List,
// // //   AlignLeft,
// // //   FileText,
// // //   Code,
// // //   Download
// // // } from 'lucide-react';

// // // const USFMEditor = () => {
// // //   const [content, setContent] = useState('');
// // //   const [isEditable, setIsEditable] = useState(true);
// // //   const [isParaView, setIsParaView] = useState(true);
// // //   const [isPreviewMode, setIsPreviewMode] = useState(true);
// // //   const [showRawUSFM, setShowRawUSFM] = useState(false);
// // //   const [history, setHistory] = useState([]);
// // //   const [historyIndex, setHistoryIndex] = useState(-1);
// // //   const [hiddenTags, setHiddenTags] = useState({});
// // //   const editorRef = useRef(null);
// // //   const fileInputRef = useRef(null);
// // //   const lastContentRef = useRef('');
// // //   const isUndoRedoRef = useRef(false);

// // //   // Sample USFM content - Psalms
// // //   const sampleUSFM = `\\id PSA Unlocked Literal Bible
// // // \\ide UTF-8
// // // \\h Psalms
// // // \\toc1 The Book of Psalms
// // // \\toc2 Psalms
// // // \\toc3 Psa
// // // \\mt Psalms
// // // \\cl Psalm
// // // \\s5
// // // \\ms Book One
// // // \\c 1
// // // \\q
// // // \\v 1 Blessed is the man who does not walk in the advice of the wicked,
// // // \\q or stand in the pathway with sinners,
// // // \\q or sit in the assembly of mockers.
// // // \\q
// // // \\v 2 But his delight is in the law of Yahweh,
// // // \\q and on his law he meditates day and night.
// // // \\s5
// // // \\q
// // // \\v 3 He will be like a tree planted by the streams of water
// // // \\q that produces its fruit in its season,
// // // \\q whose leaves do not wither;
// // // \\q whatever he does will prosper.
// // // \\s5
// // // \\q
// // // \\v 4 The wicked are not so,
// // // \\q but are instead like the chaff that the wind drives away.
// // // \\q
// // // \\v 5 So the wicked will not stand in the judgment,
// // // \\q nor sinners in the assembly of the righteous.
// // // \\s5
// // // \\q
// // // \\v 6 For Yahweh approves of the way of the righteous,
// // // \\q but the way of the wicked will perish.
// // // \\s5
// // // \\c 2
// // // \\m
// // // \\q
// // // \\v 1 Why are the nations in turmoil,
// // // \\q and why do the peoples make plots that will fail?
// // // \\q
// // // \\v 2 The kings of the earth take their stand together
// // // \\q and the rulers conspire together
// // // \\q against Yahweh and against his Messiah, saying,
// // // \\q
// // // \\v 3 "Let us tear off the shackles they put on us
// // // \\q and throw off their chains."
// // // \\s5
// // // \\q
// // // \\v 4 He who sits in the heavens will sneer at them;
// // // \\q the Lord mocks them.
// // // \\q
// // // \\v 5 Then he will speak to them in his anger
// // // \\q and terrify them in his rage, saying,`;

// // //   useEffect(() => {
// // //     setContent(sampleUSFM);
// // //     setHistory([sampleUSFM]);
// // //     setHistoryIndex(0);
// // //     lastContentRef.current = sampleUSFM;
// // //     parseAndStoreHiddenTags(sampleUSFM);
// // //   }, []);

// // //   const parseAndStoreHiddenTags = (usfmText) => {
// // //     const lines = usfmText.split('\n');
// // //     const hidden = {
// // //       metadata: [],
// // //       sections: {},
// // //       poetry: {}
// // //     };

// // //     let currentChapter = null;
// // //     let currentVerse = null;
// // //     let lineIndex = 0;

// // //     lines.forEach(line => {
// // //       line = line.trim();
// // //       if (!line) return;

// // //       if (line.startsWith('\\id ') || line.startsWith('\\ide ') ||
// // //         line.startsWith('\\toc') || line.startsWith('\\mt ') ||
// // //         line.startsWith('\\cl ')) {
// // //         hidden.metadata.push(line);
// // //       } else if (line.startsWith('\\s5') || line.startsWith('\\ms ') ||
// // //         line.startsWith('\\m') || line.startsWith('\\q')) {
// // //         if (currentChapter !== null) {
// // //           if (!hidden.sections[currentChapter]) {
// // //             hidden.sections[currentChapter] = [];
// // //           }
// // //           hidden.sections[currentChapter].push({
// // //             line: line,
// // //             position: currentVerse || 'before'
// // //           });
// // //         } else {
// // //           hidden.metadata.push(line);
// // //         }
// // //       } else if (line.startsWith('\\c ')) {
// // //         currentChapter = line.substring(3).trim();
// // //         currentVerse = null;
// // //       } else if (line.startsWith('\\v ')) {
// // //         const verseMatch = line.match(/\\v (\d+)\s*(.*)/);
// // //         if (verseMatch) {
// // //           currentVerse = verseMatch[1];
// // //         }
// // //       }
// // //     });

// // //     setHiddenTags(hidden);
// // //   };

// // //   const parseUSFM = (usfmText) => {
// // //     const lines = usfmText.split('\n');
// // //     const parsed = [];
// // //     let currentChapter = null;
// // //     let currentParagraph = null;
// // //     let headingFound = false;

// // //     lines.forEach(line => {
// // //       line = line.trim();
// // //       if (!line) return;

// // //       if (line.startsWith('\\h ')) {
// // //         if (!headingFound) {
// // //           parsed.push({
// // //             type: 'heading',
// // //             content: line.substring(3).trim()
// // //           });
// // //           headingFound = true;
// // //         }
// // //       } else if (line.startsWith('\\c ')) {
// // //         const chapterNum = line.substring(3).trim();
// // //         currentChapter = chapterNum;
// // //         parsed.push({
// // //           type: 'chapter',
// // //           number: chapterNum,
// // //           content: `Chapter ${chapterNum}`
// // //         });
// // //         currentParagraph = null;
// // //       } else if (line.startsWith('\\v ')) {
// // //         const verseMatch = line.match(/\\v (\d+)\s*(.*)/);
// // //         if (verseMatch) {
// // //           if (!currentParagraph) {
// // //             currentParagraph = {
// // //               type: 'paragraph',
// // //               verses: [],
// // //               chapter: currentChapter
// // //             };
// // //             parsed.push(currentParagraph);
// // //           }

// // //           currentParagraph.verses.push({
// // //             number: verseMatch[1],
// // //             text: verseMatch[2]
// // //           });
// // //         }
// // //       }
// // //     });

// // //     return parsed;
// // //   };

// // //   const reconstructUSFMFromEditor = () => {
// // //     if (!editorRef.current || showRawUSFM) return content;

// // //     let reconstructed = '';

// // //     // Add metadata
// // //     if (hiddenTags.metadata) {
// // //       reconstructed += hiddenTags.metadata.join('\n') + '\n';
// // //     }

// // //     const elements = editorRef.current.children;
// // //     let currentChapter = null;

// // //     for (let element of elements) {
// // //       if (element.tagName === 'H1') {
// // //         // Skip heading reconstruction as it's in metadata
// // //         continue;
// // //       } else if (element.tagName === 'H2') {
// // //         const chapterMatch = element.textContent.match(/Chapter (\d+)/);
// // //         if (chapterMatch) {
// // //           currentChapter = chapterMatch[1];

// // //           // Add section tags before chapter if they exist
// // //           if (hiddenTags.sections && hiddenTags.sections[currentChapter]) {
// // //             const beforeTags = hiddenTags.sections[currentChapter].filter(
// // //               tag => tag.position === 'before'
// // //             );
// // //             beforeTags.forEach(tag => {
// // //               reconstructed += tag.line + '\n';
// // //             });
// // //           }

// // //           reconstructed += `\\c ${currentChapter}\n`;
// // //         }
// // //       } else if (element.tagName === 'P' || element.tagName === 'DIV') {
// // //         if (isParaView) {
// // //           // Handle paragraph view
// // //           const spans = element.children;
// // //           for (let span of spans) {
// // //             if (span.classList && span.classList.contains('verse-container')) {
// // //               const verseNum = span.querySelector('.verse-number')?.textContent;
// // //               const verseText = span.querySelector('.editable-text')?.textContent || '';

// // //               if (verseNum && currentChapter) {
// // //                 // Add section tags for this verse if they exist
// // //                 if (hiddenTags.sections && hiddenTags.sections[currentChapter]) {
// // //                   const verseTags = hiddenTags.sections[currentChapter].filter(
// // //                     tag => tag.position === verseNum
// // //                   );
// // //                   verseTags.forEach(tag => {
// // //                     reconstructed += tag.line + '\n';
// // //                   });
// // //                 }

// // //                 reconstructed += `\\v ${verseNum} ${verseText}\n`;
// // //               }
// // //             }
// // //           }
// // //         } else {
// // //           // Handle line-by-line view
// // //           const lines = element.children;
// // //           for (let line of lines) {
// // //             if (line.classList && line.classList.contains('verse-line')) {
// // //               const verseNum = line.querySelector('.verse-number')?.textContent;
// // //               const verseText = line.querySelector('.editable-text')?.textContent || '';

// // //               if (verseNum && currentChapter) {
// // //                 // Add section tags for this verse if they exist
// // //                 if (hiddenTags.sections && hiddenTags.sections[currentChapter]) {
// // //                   const verseTags = hiddenTags.sections[currentChapter].filter(
// // //                     tag => tag.position === verseNum
// // //                   );
// // //                   verseTags.forEach(tag => {
// // //                     reconstructed += tag.line + '\n';
// // //                   });
// // //                 }

// // //                 reconstructed += `\\v ${verseNum} ${verseText}\n`;
// // //               }
// // //             }
// // //           }
// // //         }
// // //       }
// // //     }

// // //     return reconstructed.trim();
// // //   };

// // //   const handleContentChange = useCallback(() => {
// // //     if (isUndoRedoRef.current) {
// // //       isUndoRedoRef.current = false;
// // //       return;
// // //     }

// // //     const newContent = reconstructUSFMFromEditor();
// // //     if (newContent !== lastContentRef.current) {
// // //       setContent(newContent);
// // //       saveToHistory(newContent);
// // //       lastContentRef.current = newContent;
// // //     }
// // //   }, [hiddenTags]);

// // //   const saveToHistory = (newContent) => {
// // //     const newHistory = history.slice(0, historyIndex + 1);
// // //     newHistory.push(newContent);
// // //     setHistory(newHistory);
// // //     setHistoryIndex(newHistory.length - 1);
// // //   };

// // //   const handleUndo = () => {
// // //     if (historyIndex > 0) {
// // //       isUndoRedoRef.current = true;
// // //       const newIndex = historyIndex - 1;
// // //       setHistoryIndex(newIndex);
// // //       setContent(history[newIndex]);
// // //       lastContentRef.current = history[newIndex];
// // //       parseAndStoreHiddenTags(history[newIndex]);
// // //     }
// // //   };

// // //   const handleRedo = () => {
// // //     if (historyIndex < history.length - 1) {
// // //       isUndoRedoRef.current = true;
// // //       const newIndex = historyIndex + 1;
// // //       setHistoryIndex(newIndex);
// // //       setContent(history[newIndex]);
// // //       lastContentRef.current = history[newIndex];
// // //       parseAndStoreHiddenTags(history[newIndex]);
// // //     }
// // //   };

// // //   const handleExport = () => {
// // //     const exportContent = reconstructUSFMFromEditor();
// // //     const blob = new Blob([exportContent], { type: 'text/plain' });
// // //     const url = URL.createObjectURL(blob);
// // //     const a = document.createElement('a');
// // //     a.href = url;
// // //     a.download = 'exported.usfm';
// // //     document.body.appendChild(a);
// // //     a.click();
// // //     document.body.removeChild(a);
// // //     URL.revokeObjectURL(url);
// // //   };

// // //   const handleKeyDown = (e) => {
// // //     const selection = window.getSelection();
// // //     if (!selection.rangeCount) return;

// // //     const range = selection.getRangeAt(0);
// // //     const container = range.commonAncestorContainer;

// // //     // Check if we're in a protected element
// // //     const isInProtectedElement = (node) => {
// // //       let current = node.nodeType === Node.TEXT_NODE ? node.parentNode : node;
// // //       while (current && current !== editorRef.current) {
// // //         if (current.classList && (
// // //           current.classList.contains('verse-number') ||
// // //           current.classList.contains('chapter-number') ||
// // //           current.tagName === 'H1' ||
// // //           current.tagName === 'H2'
// // //         )) {
// // //           return true;
// // //         }
// // //         current = current.parentNode;
// // //       }
// // //       return false;
// // //     };

// // //     // Check if we're trying to delete into a protected element
// // //     const isAtBoundaryOfProtectedElement = () => {
// // //       const editableText = range.startContainer.parentNode;
// // //       if (!editableText || !editableText.classList.contains('editable-text')) {
// // //         return false;
// // //       }

// // //       // Check if backspace at start of editable text
// // //       if (e.key === 'Backspace' && range.startOffset === 0 && range.collapsed) {
// // //         return true;
// // //       }

// // //       // Check if delete at end of editable text
// // //       if (e.key === 'Delete' && range.startOffset === range.startContainer.textContent.length && range.collapsed) {
// // //         return true;
// // //       }

// // //       return false;
// // //     };

// // //     // Prevent deletion of protected elements or deletion into them
// // //     if ((e.key === 'Backspace' || e.key === 'Delete') &&
// // //       (isInProtectedElement(container) || isAtBoundaryOfProtectedElement() ||
// // //         (range.startContainer !== range.endContainer &&
// // //           (isInProtectedElement(range.startContainer) || isInProtectedElement(range.endContainer))))) {
// // //       e.preventDefault();
// // //       return false;
// // //     }
// // //   };

// // //   const handleMouseDown = (e) => {
// // //     // Prevent selection of protected elements
// // //     if (e.target.classList && (
// // //       e.target.classList.contains('verse-number') ||
// // //       e.target.classList.contains('chapter-number') ||
// // //       e.target.tagName === 'H1' ||
// // //       e.target.tagName === 'H2'
// // //     )) {
// // //       e.preventDefault();
// // //     }
// // //   };

// // //   const handleInput = (e) => {
// // //     // Prevent cursor from jumping to beginning
// // //     const selection = window.getSelection();
// // //     if (selection.rangeCount > 0) {
// // //       const range = selection.getRangeAt(0);

// // //       // Check if we're in an editable text span
// // //       let editableSpan = range.commonAncestorContainer;
// // //       if (editableSpan.nodeType === Node.TEXT_NODE) {
// // //         editableSpan = editableSpan.parentNode;
// // //       }

// // //       // If we're in an editable span, preserve cursor position
// // //       if (editableSpan.classList && editableSpan.classList.contains('editable-text')) {
// // //         const cursorOffset = range.startOffset;
// // //         const textNode = range.startContainer;

// // //         // Call the content change handler
// // //         handleContentChange();

// // //         // Restore cursor position after content change
// // //         setTimeout(() => {
// // //           try {
// // //             const newRange = document.createRange();
// // //             if (textNode.parentNode && textNode.textContent) {
// // //               newRange.setStart(textNode, Math.min(cursorOffset, textNode.textContent.length));
// // //               newRange.collapse(true);
// // //               selection.removeAllRanges();
// // //               selection.addRange(newRange);
// // //             }
// // //           } catch (error) {
// // //             // Fallback: place cursor at end of editable span
// // //             const newRange = document.createRange();
// // //             newRange.selectNodeContents(editableSpan);
// // //             newRange.collapse(false);
// // //             selection.removeAllRanges();
// // //             selection.addRange(newRange);
// // //           }
// // //         }, 0);
// // //       } else {
// // //         handleContentChange();
// // //       }
// // //     } else {
// // //       handleContentChange();
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     if (editorRef.current) {
// // //       const editor = editorRef.current;
// // //       editor.addEventListener('input', handleInput);
// // //       editor.addEventListener('keydown', handleKeyDown);
// // //       editor.addEventListener('mousedown', handleMouseDown);

// // //       return () => {
// // //         editor.removeEventListener('input', handleInput);
// // //         editor.removeEventListener('keydown', handleKeyDown);
// // //         editor.removeEventListener('mousedown', handleMouseDown);
// // //       };
// // //     }
// // //   }, [handleContentChange, isParaView, showRawUSFM]);

// // //   const renderContent = () => {
// // //     if (showRawUSFM) {
// // //       return (
// // //         <div className="whitespace-pre-wrap font-mono text-sm">
// // //           {content}
// // //         </div>
// // //       );
// // //     }

// // //     const parsed = parseUSFM(content);

// // //     return parsed.map((item, index) => {
// // //       if (item.type === 'heading') {
// // //         return (
// // //           <h1 key={index} className="text-3xl font-bold mb-6 text-blue-800 text-center select-none cursor-default">
// // //             {item.content}
// // //           </h1>
// // //         );
// // //       } else if (item.type === 'chapter') {
// // //         return (
// // //           <h2
// // //             key={index}
// // //             className="text-2xl font-semibold mb-4 mt-8 text-green-700 chapter-number select-none cursor-default text-center"
// // //             style={{ userSelect: 'none', pointerEvents: 'none' }}
// // //           >
// // //             {item.content}
// // //           </h2>
// // //         );
// // //       } else if (item.type === 'paragraph') {
// // //         if (isParaView) {
// // //           return (
// // //             <div key={index} className="mb-6 leading-relaxed">
// // //               {item.verses.map((verse, vIndex) => (
// // //                 <p key={vIndex} className="verse-container mb-2">
// // //                   <span
// // //                     className="font-bold text-red-600 verse-number select-none cursor-default mr-2 text-lg"
// // //                     style={{ userSelect: 'none', pointerEvents: 'none' }}
// // //                     contentEditable={false}
// // //                   >
// // //                     {verse.number}
// // //                   </span>
// // //                   <span
// // //                     className="editable-text text-lg leading-relaxed"
// // //                     contentEditable={isEditable}
// // //                     suppressContentEditableWarning={true}
// // //                   >
// // //                     {verse.text}
// // //                   </span>
// // //                 </p>
// // //               ))}
// // //             </div>
// // //           );
// // //         } else {
// // //           return (
// // //             <div key={index} className="mb-6">
// // //               {item.verses.map((verse, vIndex) => (
// // //                 <div key={vIndex} className="mb-3 verse-line">
// // //                   <span
// // //                     className="font-bold text-red-600 verse-number select-none cursor-default mr-3 text-lg"
// // //                     style={{ userSelect: 'none', pointerEvents: 'none' }}
// // //                     contentEditable={false}
// // //                   >
// // //                     {verse.number}
// // //                   </span>
// // //                   <span
// // //                     className="editable-text text-lg leading-relaxed"
// // //                     contentEditable={isEditable}
// // //                     suppressContentEditableWarning={true}
// // //                   >
// // //                     {verse.text}
// // //                   </span>
// // //                 </div>
// // //               ))}
// // //             </div>
// // //           );
// // //         }
// // //       }
// // //       return null;
// // //     });
// // //   };

// // //   const handleFileUpload = (event) => {
// // //     const file = event.target.files[0];
// // //     if (file && file.name.endsWith('.usfm')) {
// // //       const reader = new FileReader();
// // //       reader.onload = (e) => {
// // //         const newContent = e.target.result;
// // //         setContent(newContent);
// // //         saveToHistory(newContent);
// // //         lastContentRef.current = newContent;
// // //         parseAndStoreHiddenTags(newContent);
// // //       };
// // //       reader.readAsText(file);
// // //     }
// // //   };

// // //   const handleContextMenu = (e) => {
// // //     e.preventDefault();

// // //     // Don't show context menu on protected elements
// // //     if (e.target.classList && (
// // //       e.target.classList.contains('verse-number') ||
// // //       e.target.classList.contains('chapter-number') ||
// // //       e.target.tagName === 'H1' ||
// // //       e.target.tagName === 'H2'
// // //     )) {
// // //       return;
// // //     }

// // //     // Create context menu
// // //     const menu = document.createElement('div');
// // //     menu.className = 'fixed bg-white border border-gray-300 rounded shadow-lg z-50 py-1';
// // //     menu.style.left = e.pageX + 'px';
// // //     menu.style.top = e.pageY + 'px';

// // //     const menuItems = [
// // //       { label: 'Cut', action: () => document.execCommand('cut') },
// // //       { label: 'Copy', action: () => document.execCommand('copy') },
// // //       { label: 'Paste', action: () => document.execCommand('paste') },
// // //       {
// // //         label: 'Paste as Plain Text', action: () => {
// // //           navigator.clipboard.readText().then(text => {
// // //             document.execCommand('insertText', false, text);
// // //           });
// // //         }
// // //       }
// // //     ];

// // //     menuItems.forEach(item => {
// // //       const menuItem = document.createElement('div');
// // //       menuItem.className = 'px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm';
// // //       menuItem.textContent = item.label;
// // //       menuItem.onclick = () => {
// // //         item.action();
// // //         document.body.removeChild(menu);
// // //       };
// // //       menu.appendChild(menuItem);
// // //     });

// // //     document.body.appendChild(menu);

// // //     // Remove menu on click outside
// // //     const removeMenu = () => {
// // //       if (document.body.contains(menu)) {
// // //         document.body.removeChild(menu);
// // //       }
// // //       document.removeEventListener('click', removeMenu);
// // //     };

// // //     setTimeout(() => {
// // //       document.addEventListener('click', removeMenu);
// // //     }, 0);
// // //   };

// // //   return (
// // //     <div className="w-full max-w-6xl mx-auto p-4">
// // //       {/* Toolbar */}
// // //       <div className="bg-gray-100 border rounded-t-lg p-3 flex items-center gap-2 flex-wrap">
// // //         <button
// // //           onClick={handleUndo}
// // //           disabled={historyIndex <= 0}
// // //           className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
// // //           title="Undo"
// // //         >
// // //           <Undo size={16} />
// // //         </button>

// // //         <button
// // //           onClick={handleRedo}
// // //           disabled={historyIndex >= history.length - 1}
// // //           className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
// // //           title="Redo"
// // //         >
// // //           <Redo size={16} />
// // //         </button>

// // //         <div className="w-px h-6 bg-gray-300 mx-1"></div>

// // //         <button
// // //           onClick={() => setIsEditable(!isEditable)}
// // //           className={`p-2 rounded hover:bg-gray-200 ${isEditable ? 'bg-blue-200' : ''}`}
// // //           title="Toggle Edit Mode"
// // //         >
// // //           {isEditable ? <Edit size={16} /> : <Eye size={16} />}
// // //         </button>

// // //         <div className="w-px h-6 bg-gray-300 mx-1"></div>

// // //         {/* <button
// // //           onClick={() => setIsParaView(!isParaView)}
// // //           className={`p-2 rounded hover:bg-gray-200 ${isParaView ? 'bg-green-200' : ''}`}
// // //           title="Toggle Paragraph View"
// // //         >
// // //           {isParaView ? <AlignLeft size={16} /> : <List size={16} />}
// // //         </button> */}

// // //         {/* <div className="w-px h-6 bg-gray-300 mx-1"></div> */}

// // //         {/* <button
// // //           onClick={() => setIsPreviewMode(!isPreviewMode)}
// // //           className={`p-2 rounded hover:bg-gray-200 ${isPreviewMode ? 'bg-purple-200' : ''}`}
// // //           title="Toggle Preview Mode"
// // //         >
// // //           {isPreviewMode ? <Eye size={16} /> : <Code size={16} />}
// // //         </button> */}

// // //         <button
// // //           onClick={() => setShowRawUSFM(!showRawUSFM)}
// // //           className={`p-2 rounded hover:bg-gray-200 ${showRawUSFM ? 'bg-orange-200' : ''}`}
// // //           title="Show Raw USFM"
// // //         >
// // //           <FileText size={16} />
// // //         </button>

// // //         <div className="w-px h-6 bg-gray-300 mx-1"></div>

// // //         <button
// // //           onClick={() => fileInputRef.current?.click()}
// // //           className="p-2 rounded hover:bg-gray-200"
// // //           title="Upload USFM File"
// // //         >
// // //           <Upload size={16} />
// // //         </button>

// // //         <button
// // //           onClick={handleExport}
// // //           className="p-2 rounded hover:bg-gray-200 bg-yellow-200"
// // //           title="Export USFM File"
// // //         >
// // //           <Download size={16} />
// // //         </button>

// // //         <input
// // //           ref={fileInputRef}
// // //           type="file"
// // //           accept=".usfm"
// // //           onChange={handleFileUpload}
// // //           className="hidden"
// // //         />

// // //         <div className="ml-auto text-sm text-gray-600">
// // //           <span className="mr-4">
// // //             {isEditable ? 'Editable' : 'Read-only'}
// // //           </span>
// // //           <span className="mr-4">
// // //             {isParaView ? 'Paragraph' : 'Line-by-line'}
// // //           </span>
// // //           <span className="mr-4">
// // //             {isPreviewMode ? 'Preview' : 'Raw'}
// // //           </span>
// // //           {showRawUSFM && <span>Raw USFM</span>}
// // //         </div>
// // //       </div>

// // //       {/* Editor */}
// // //       <div
// // //         ref={editorRef}
// // //         className="border border-t-0 rounded-b-lg p-6 min-h-96 bg-white focus:outline-none"
// // //         contentEditable={isEditable && !showRawUSFM}
// // //         onContextMenu={handleContextMenu}
// // //         suppressContentEditableWarning={true}
// // //         style={{
// // //           minHeight: '500px',
// // //           maxHeight: '800px',
// // //           overflowY: 'auto'
// // //         }}
// // //       >
// // //         {renderContent()}
// // //       </div>

// // //       {/* Status Bar */}
// // //       <div className="bg-gray-50 border border-t-0 rounded-b-lg px-4 py-2 text-xs text-gray-500">
// // //         Right-click for context menu | Headings, chapter numbers and verse numbers are protected | History: {historyIndex + 1}/{history.length} | Export button saves all USFM data with hidden tags
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default USFMEditor;



// // // import React, { useState, useRef, useEffect } from 'react';

// // // const VISIBLE_TAGS = ['\\h', '\\c', '\\v', '\\s', '\\s1', '\\s2', '\\q', '\\q1', '\\q2', '\\qs'];

// // // const parseUSFM = (usfm) => {
// // //   const lines = usfm.split(/\r?\n/);
// // //   const parsed = [];

// // //   lines.forEach((line, index) => {
// // //     const match = line.match(/^\\(\w+)\s*(.*)$/);
// // //     if (match) {
// // //       const [, tag, content] = match;
// // //       const fullTag = `\\${tag}`;

// // //       if (fullTag === '\\v') {
// // //         const [verseNumber, ...rest] = content.trim().split(' ');
// // //         parsed.push({
// // //           id: index,
// // //           tag: fullTag,
// // //           content: rest.join(' '),
// // //           verseNumber,
// // //           original: line,
// // //         });
// // //       } else if (fullTag === '\\qs') {
// // //         // Handle \qs content by removing closing \qs* tag
// // //         const cleanContent = content.replace(/\\qs\*\s*$/, '');
// // //         parsed.push({
// // //           id: index,
// // //           tag: fullTag,
// // //           content: cleanContent,
// // //           original: line
// // //         });
// // //       } else {
// // //         parsed.push({ id: index, tag: fullTag, content, original: line });
// // //       }
// // //     }
// // //   });

// // //   return parsed;
// // // };

// // // const USFMEditor = () => {
// // //   const [parsed, setParsed] = useState([]);
// // //   const [filename, setFilename] = useState(null);
// // //   const [contentSet, setContentSet] = useState(false);

// // //   const contentRefs = useRef({});

// // //   // Get array of editable elements in order
// // //   const getEditableElements = () => {
// // //     return parsed
// // //       .filter(({ tag }) => VISIBLE_TAGS.includes(tag) && tag !== '\\c')
// // //       .map(({ id }) => id);
// // //   };

// // //   // Helper function to get cursor position in a contentEditable element
// // //   const getCursorPosition = (element) => {
// // //     const selection = window.getSelection();
// // //     if (selection.rangeCount === 0) return 0;

// // //     const range = selection.getRangeAt(0);
// // //     const preCaretRange = range.cloneRange();
// // //     preCaretRange.selectNodeContents(element);
// // //     preCaretRange.setEnd(range.endContainer, range.endOffset);
// // //     return preCaretRange.toString().length;
// // //   };

// // //   // Helper function to set cursor position in a contentEditable element
// // //   const setCursorPosition = (element, position) => {
// // //     const textContent = element.innerText || '';
// // //     const targetPosition = Math.min(position, textContent.length);

// // //     const range = document.createRange();
// // //     const selection = window.getSelection();

// // //     // Find the text node and position within it
// // //     let currentPos = 0;
// // //     let targetNode = null;
// // //     let targetOffset = 0;

// // //     const walker = document.createTreeWalker(
// // //       element,
// // //       NodeFilter.SHOW_TEXT,
// // //       null,
// // //       false
// // //     );

// // //     let node = walker.nextNode();
// // //     while (node) {
// // //       const nodeLength = node.textContent.length;
// // //       if (currentPos + nodeLength >= targetPosition) {
// // //         targetNode = node;
// // //         targetOffset = targetPosition - currentPos;
// // //         break;
// // //       }
// // //       currentPos += nodeLength;
// // //       node = walker.nextNode();
// // //     }

// // //     if (targetNode) {
// // //       range.setStart(targetNode, targetOffset);
// // //       range.setEnd(targetNode, targetOffset);
// // //     } else {
// // //       // If no text node found, place at the end
// // //       range.selectNodeContents(element);
// // //       range.collapse(false);
// // //     }

// // //     selection.removeAllRanges();
// // //     selection.addRange(range);
// // //   };

// // //   const handleFileUpload = (e) => {
// // //     const file = e.target.files[0];
// // //     if (file && file.name.endsWith('.usfm')) {
// // //       setFilename(file.name);
// // //       const reader = new FileReader();
// // //       reader.onload = (event) => {
// // //         const text = event.target.result;
// // //         const parsedUSFM = parseUSFM(text);
// // //         setParsed(parsedUSFM);
// // //         setContentSet(false);
// // //       };
// // //       reader.readAsText(file);
// // //     } else {
// // //       alert('Please upload a valid .usfm file');
// // //     }
// // //   };

// // //   const handleBlur = (id) => {
// // //     const newText = contentRefs.current[id]?.innerText || '';
// // //     setParsed((prev) =>
// // //       prev.map((line) => {
// // //         if (line.id === id) {
// // //           let newOriginal;
// // //           if (line.tag === '\\qs') {
// // //             // Reconstruct \qs with closing tag
// // //             newOriginal = `\\qs ${newText}\\qs*`;
// // //           } else {
// // //             newOriginal = line.tag ? `${line.tag} ${newText}` : newText;
// // //           }
// // //           return {
// // //             ...line,
// // //             content: newText,
// // //             original: newOriginal,
// // //           };
// // //         }
// // //         return line;
// // //       })
// // //     );
// // //   };

// // //   const handleKeyDown = (e, id) => {
// // //     if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
// // //       const editableIds = getEditableElements();
// // //       const currentIndex = editableIds.indexOf(id);

// // //       if (currentIndex === -1) return;

// // //       // Get current cursor position before moving
// // //       const currentElement = contentRefs.current[id];
// // //       const currentCursorPos = getCursorPosition(currentElement);

// // //       let nextIndex;
// // //       if (e.key === 'ArrowUp') {
// // //         nextIndex = currentIndex > 0 ? currentIndex - 1 : editableIds.length - 1;
// // //       } else {
// // //         nextIndex = currentIndex < editableIds.length - 1 ? currentIndex + 1 : 0;
// // //       }

// // //       const nextId = editableIds[nextIndex];
// // //       const nextElement = contentRefs.current[nextId];

// // //       if (nextElement) {
// // //         e.preventDefault();
// // //         nextElement.focus();

// // //         // Set cursor position based on the previous position
// // //         setTimeout(() => {
// // //           setCursorPosition(nextElement, currentCursorPos);
// // //         }, 0);
// // //       }
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     if (!contentSet) {
// // //       parsed.forEach(({ id, content }) => {
// // //         if (contentRefs.current[id]) {
// // //           contentRefs.current[id].innerText = content;
// // //         }
// // //       });
// // //       setContentSet(true);
// // //     }
// // //   }, [parsed, contentSet]);

// // //   const handleExport = () => {
// // //     const usfmString = parsed.map((line) => line.original).join('\n');
// // //     const blob = new Blob([usfmString], { type: 'text/plain' });
// // //     const downloadLink = document.createElement('a');
// // //     downloadLink.href = URL.createObjectURL(blob);
// // //     downloadLink.download = filename || 'edited.usfm';
// // //     downloadLink.click();
// // //   };

// // //   return (
// // //     <div style={{ padding: '20px', fontFamily: 'sans-serif', }}>
// // //       <h2>USFM Editor</h2>
// // //       {/* <p style={{ color: '#666', fontSize: '0.9em', marginBottom: '10px' }}>
// // //         Use ↑ and ↓ arrow keys to navigate between editable fields. Cursor position is preserved when moving between fields.
// // //       </p> */}

// // //       <input type="file" accept=".usfm" onChange={handleFileUpload} />
// // //       {filename && <p><strong>Editing:</strong> {filename}</p>}

// // //       {parsed.length > 0 && (
// // //         <button
// // //           onClick={handleExport}
// // //           style={{
// // //             marginTop: 20,
// // //             padding: '10px 20px',
// // //             background: '#007bff',
// // //             color: '#fff',
// // //             border: 'none',
// // //             borderRadius: 4,
// // //             cursor: 'pointer',
// // //           }}
// // //         >
// // //           Export USFM
// // //         </button>
// // //       )}

// // //       <div style={{ marginTop: '20px' }}>
// // //         {parsed.map(({ id, tag, content, verseNumber }) => {
// // //           if (!VISIBLE_TAGS.includes(tag)) return null;

// // //           // Chapter (non-editable)
// // //           if (tag === '\\c') {
// // //             return (
// // //               <div key={id} style={{ textAlign: 'center', margin: '20px 0', fontSize: 18, fontWeight: 'bold', color: '#EE5A24' }}>
// // //                 Chapter {content}
// // //               </div>
// // //             );
// // //           }

// // //           // Heading (editable)
// // //           if (tag === '\\h') {
// // //             return (
// // //               <div
// // //                 key={id}
// // //                 style={{ textAlign: 'center', margin: '20px 0', fontSize: 20, fontWeight: 'bold' }}
// // //               >
// // //                 <div
// // //                   ref={(el) => (contentRefs.current[id] = el)}
// // //                   contentEditable
// // //                   suppressContentEditableWarning
// // //                   onBlur={() => handleBlur(id)}
// // //                   onKeyDown={(e) => handleKeyDown(e, id)}
// // //                   style={{
// // //                     display: 'inline-block',
// // //                     borderBottom: '1px dashed #ccc',
// // //                     padding: 4,
// // //                     minHeight: 20,
// // //                     maxWidth: '80%',
// // //                     outline: 'none',
// // //                   }}
// // //                 />
// // //               </div>
// // //             );
// // //           }

// // //           // Verse (superscript number, editable text)
// // //           if (tag === '\\v') {
// // //             return (
// // //               <div
// // //                 key={id}
// // //                 style={{ display: 'flex', alignItems: 'baseline', marginBottom: 8 }}
// // //               >
// // //                 <sup style={{ fontWeight: 'bold', fontSize: '0.8em', color: '#EE5A24' }}>{verseNumber}</sup>
// // //                 <div
// // //                   ref={(el) => (contentRefs.current[id] = el)}
// // //                   contentEditable
// // //                   suppressContentEditableWarning
// // //                   onBlur={() => {
// // //                     const updatedText = contentRefs.current[id]?.innerText || '';
// // //                     const newOriginal = `\\v ${verseNumber} ${updatedText}`;
// // //                     setParsed((prev) =>
// // //                       prev.map((line) =>
// // //                         line.id === id
// // //                           ? {
// // //                             ...line,
// // //                             content: updatedText,
// // //                             original: newOriginal,
// // //                           }
// // //                           : line
// // //                       )
// // //                     );
// // //                   }}
// // //                   onKeyDown={(e) => handleKeyDown(e, id)}
// // //                   style={{
// // //                     marginLeft: 8,
// // //                     flex: 1,
// // //                     borderBottom: '1px dashed #ccc',
// // //                     padding: 4,
// // //                     minHeight: 20,
// // //                     outline: 'none',
// // //                   }}
// // //                 >
// // //                   {content}
// // //                 </div>
// // //               </div>
// // //             );
// // //           }

// // //           // \s, \s1, \s2 — Section Headings
// // //           if (['\\s', '\\s1', '\\s2'].includes(tag)) {
// // //             return (
// // //               <div
// // //                 key={id}
// // //                 style={{
// // //                   fontWeight: 'bold',
// // //                   fontSize: tag === '\\s2' ? '1.1em' : '1.2em',
// // //                   textDecoration: tag === '\\s' ? 'underline' : 'none',
// // //                   margin: '10px 0',
// // //                   textAlign: 'center'
// // //                 }}
// // //               >
// // //                 <div
// // //                   ref={(el) => (contentRefs.current[id] = el)}
// // //                   contentEditable
// // //                   suppressContentEditableWarning
// // //                   onBlur={() => handleBlur(id)}
// // //                   onKeyDown={(e) => handleKeyDown(e, id)}
// // //                   style={{
// // //                     borderBottom: '1px dashed #ccc',
// // //                     display: 'inline-block',
// // //                     padding: 4,
// // //                     minHeight: 20,
// // //                     outline: 'none',
// // //                   }}
// // //                 >
// // //                   {content}
// // //                 </div>
// // //               </div>
// // //             );
// // //           }

// // //           // \q, \q1, \q2 — Poetry/Indented lines
// // //           if (['\\q', '\\q1', '\\q2'].includes(tag)) {
// // //             const indent = tag === '\\q2' ? 40 : tag === '\\q1' ? 20 : 10;
// // //             return (
// // //               <div
// // //                 key={id}
// // //                 style={{
// // //                   marginLeft: indent,
// // //                   fontStyle: 'italic',
// // //                   marginBottom: 6,
// // //                 }}
// // //               >
// // //                 <div
// // //                   ref={(el) => (contentRefs.current[id] = el)}
// // //                   contentEditable
// // //                   suppressContentEditableWarning
// // //                   onBlur={() => handleBlur(id)}
// // //                   onKeyDown={(e) => handleKeyDown(e, id)}
// // //                   style={{
// // //                     borderBottom: '1px dashed #ccc',
// // //                     display: 'inline-block',
// // //                     padding: 4,
// // //                     minHeight: 20,
// // //                     outline: 'none',
// // //                   }}
// // //                 >
// // //                   {content}
// // //                 </div>
// // //               </div>
// // //             );
// // //           }

// // //           // \qs — Selah and musical notations
// // //           if (tag === '\\qs') {
// // //             return (
// // //               <div
// // //                 key={id}
// // //                 style={{
// // //                   textAlign: 'center',
// // //                   margin: '8px 0',
// // //                   fontStyle: 'italic',
// // //                   fontSize: '0.9em',
// // //                   color: '#666',
// // //                 }}
// // //               >
// // //                 <div
// // //                   ref={(el) => (contentRefs.current[id] = el)}
// // //                   contentEditable
// // //                   suppressContentEditableWarning
// // //                   onBlur={() => handleBlur(id)}
// // //                   onKeyDown={(e) => handleKeyDown(e, id)}
// // //                   style={{
// // //                     borderBottom: '1px dashed #ccc',
// // //                     display: 'inline-block',
// // //                     padding: '4px 8px',
// // //                     minHeight: 20,
// // //                     outline: 'none',
// // //                     backgroundColor: '#f8f9fa',
// // //                     borderRadius: '3px',
// // //                   }}
// // //                 >
// // //                   {content}
// // //                 </div>
// // //               </div>
// // //             );
// // //           }

// // //           return (
// // //             <div
// // //               key={id}
// // //               style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}
// // //             >
// // //               <span
// // //                 style={{
// // //                   userSelect: 'none',
// // //                   color: '#555',
// // //                   fontWeight: 'bold',
// // //                   minWidth: 50,
// // //                 }}
// // //               >
// // //                 {tag}
// // //               </span>
// // //               <div
// // //                 ref={(el) => (contentRefs.current[id] = el)}
// // //                 contentEditable
// // //                 suppressContentEditableWarning
// // //                 onBlur={() => handleBlur(id)}
// // //                 onKeyDown={(e) => handleKeyDown(e, id)}
// // //                 style={{
// // //                   marginLeft: 8,
// // //                   flex: 1,
// // //                   borderBottom: '1px dashed #ccc',
// // //                   padding: 4,
// // //                   minHeight: 20,
// // //                   outline: 'none',
// // //                 }}
// // //               />
// // //             </div>
// // //           );
// // //         })}
// // //       </div>


// // //     </div>
// // //   );
// // // };

// // // export default USFMEditor;
// // import React, { useState, useRef, useEffect } from 'react';

// // const VISIBLE_TAGS = ['\\h', '\\c', '\\v', '\\s', '\\s1', '\\s2', '\\q', '\\q1', '\\q2', '\\qs'];

// // const parseUSFM = (usfm) => {
// //   const lines = usfm.split(/\r?\n/);
// //   const parsed = [];

// //   lines.forEach((line, index) => {
// //     const match = line.match(/^\\(\w+)\s*(.*)$/);
// //     if (match) {
// //       const [, tag, content] = match;
// //       const fullTag = `\\${tag}`;

// //       if (fullTag === '\\v') {
// //         const [verseNumber, ...rest] = content.trim().split(' ');
// //         parsed.push({
// //           id: index,
// //           tag: fullTag,
// //           content: rest.join(' '),
// //           verseNumber,
// //           original: line,
// //         });
// //       } else if (fullTag === '\\qs') {
// //         // Handle \qs content by removing closing \qs* tag
// //         const cleanContent = content.replace(/\\qs\*\s*$/, '');
// //         parsed.push({
// //           id: index,
// //           tag: fullTag,
// //           content: cleanContent,
// //           original: line
// //         });
// //       } else {
// //         parsed.push({ id: index, tag: fullTag, content, original: line });
// //       }
// //     }
// //   });

// //   return parsed;
// // };

// // const USFMEditor = () => {
// //   const [parsed, setParsed] = useState([]);
// //   const [filename, setFilename] = useState(null);
// //   const [contentSet, setContentSet] = useState(false);

// //   const contentRefs = useRef({});

// //   // Get array of editable elements in order
// //   const getEditableElements = () => {
// //     return parsed
// //       .filter(({ tag }) => VISIBLE_TAGS.includes(tag) && tag !== '\\c')
// //       .map(({ id }) => id);
// //   };

// //   // Helper function to get cursor position in a contentEditable element
// //   const getCursorPosition = (element) => {
// //     const selection = window.getSelection();
// //     if (selection.rangeCount === 0) return 0;

// //     const range = selection.getRangeAt(0);
// //     const preCaretRange = range.cloneRange();
// //     preCaretRange.selectNodeContents(element);
// //     preCaretRange.setEnd(range.endContainer, range.endOffset);
// //     return preCaretRange.toString().length;
// //   };

// //   // Helper function to set cursor position in a contentEditable element
// //   const setCursorPosition = (element, position) => {
// //     const textContent = element.innerText || '';
// //     const targetPosition = Math.min(position, textContent.length);

// //     const range = document.createRange();
// //     const selection = window.getSelection();

// //     // Find the text node and position within it
// //     let currentPos = 0;
// //     let targetNode = null;
// //     let targetOffset = 0;

// //     const walker = document.createTreeWalker(
// //       element,
// //       NodeFilter.SHOW_TEXT,
// //       null,
// //       false
// //     );

// //     let node = walker.nextNode();
// //     while (node) {
// //       const nodeLength = node.textContent.length;
// //       if (currentPos + nodeLength >= targetPosition) {
// //         targetNode = node;
// //         targetOffset = targetPosition - currentPos;
// //         break;
// //       }
// //       currentPos += nodeLength;
// //       node = walker.nextNode();
// //     }

// //     if (targetNode) {
// //       range.setStart(targetNode, targetOffset);
// //       range.setEnd(targetNode, targetOffset);
// //     } else {
// //       // If no text node found, place at the end
// //       range.selectNodeContents(element);
// //       range.collapse(false);
// //     }

// //     selection.removeAllRanges();
// //     selection.addRange(range);
// //   };

// //   const handleFileUpload = (e) => {
// //     const file = e.target.files[0];
// //     if (file && file.name.endsWith('.usfm')) {
// //       setFilename(file.name);
// //       const reader = new FileReader();
// //       reader.onload = (event) => {
// //         const text = event.target.result;
// //         const parsedUSFM = parseUSFM(text);
// //         setParsed(parsedUSFM);
// //         setContentSet(false);
// //       };
// //       reader.readAsText(file);
// //     } else {
// //       alert('Please upload a valid .usfm file');
// //     }
// //   };

// //   const handleBlur = (id) => {
// //     const newText = contentRefs.current[id]?.innerText || '';
// //     setParsed((prev) =>
// //       prev.map((line) => {
// //         if (line.id === id) {
// //           let newOriginal;
// //           if (line.tag === '\\qs') {
// //             // Reconstruct \qs with closing tag
// //             newOriginal = `\\qs ${newText}\\qs*`;
// //           } else {
// //             newOriginal = line.tag ? `${line.tag} ${newText}` : newText;
// //           }
// //           return {
// //             ...line,
// //             content: newText,
// //             original: newOriginal,
// //           };
// //         }
// //         return line;
// //       })
// //     );
// //   };

// //   const handleKeyDown = (e, id) => {
// //     if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
// //       const editableIds = getEditableElements();
// //       const currentIndex = editableIds.indexOf(id);

// //       if (currentIndex === -1) return;

// //       let nextIndex;
// //       if (e.key === 'ArrowUp') {
// //         // Stop at top - don't wrap around
// //         if (currentIndex === 0) return;
// //         nextIndex = currentIndex - 1;
// //       } else {
// //         // Stop at bottom - don't wrap around
// //         if (currentIndex === editableIds.length - 1) return;
// //         nextIndex = currentIndex + 1;
// //       }

// //       // Get current cursor position before moving
// //       const currentElement = contentRefs.current[id];
// //       const currentCursorPos = getCursorPosition(currentElement);

// //       const nextId = editableIds[nextIndex];
// //       const nextElement = contentRefs.current[nextId];

// //       if (nextElement) {
// //         e.preventDefault();
// //         nextElement.focus();

// //         // Set cursor position based on the previous position
// //         setTimeout(() => {
// //           setCursorPosition(nextElement, currentCursorPos);
// //         }, 0);
// //       }
// //     }
// //   };

// //   useEffect(() => {
// //     if (!contentSet) {
// //       parsed.forEach(({ id, content }) => {
// //         if (contentRefs.current[id]) {
// //           contentRefs.current[id].innerText = content;
// //         }
// //       });
// //       setContentSet(true);
// //     }
// //   }, [parsed, contentSet]);

// //   const handleExport = () => {
// //     const usfmString = parsed.map((line) => line.original).join('\n');
// //     const blob = new Blob([usfmString], { type: 'text/plain' });
// //     const downloadLink = document.createElement('a');
// //     downloadLink.href = URL.createObjectURL(blob);
// //     downloadLink.download = filename || 'edited.usfm';
// //     downloadLink.click();
// //   };

// //   return (
// //     <div style={{ padding: '20px', fontFamily: 'sans-serif', height: '100vh', display: 'flex', flexDirection: 'column' }}>
// //       <h2>USFM Editor</h2>

// //       <div style={{ marginBottom: '20px' }}>
// //         <input type="file" accept=".usfm" onChange={handleFileUpload} />
// //         {filename && <p><strong>Editing:</strong> {filename}</p>}

// //         {parsed.length > 0 && (
// //           <button
// //             onClick={handleExport}
// //             style={{
// //               marginTop: 10,
// //               padding: '10px 20px',
// //               background: '#007bff',
// //               color: '#fff',
// //               border: 'none',
// //               borderRadius: 4,
// //               cursor: 'pointer',
// //             }}
// //           >
// //             Export USFM
// //           </button>
// //         )}
// //       </div>

// //       {parsed.length > 0 && (
// //         <div
// //           style={{
// //             flex: 1,
// //             border: '2px solid #ddd',
// //             borderRadius: '8px',
// //             padding: '20px',
// //             overflowY: 'auto',
// //             backgroundColor: '#fafafa',
// //             boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
// //           }}
// //         >
// //           {parsed.map(({ id, tag, content, verseNumber }) => {
// //             if (!VISIBLE_TAGS.includes(tag)) return null;

// //             // Chapter (non-editable)
// //             if (tag === '\\c') {
// //               return (
// //                 <div key={id} style={{ textAlign: 'center', margin: '20px 0', fontSize: 18, fontWeight: 'bold', color: '#EE5A24' }}>
// //                   Chapter {content}
// //                 </div>
// //               );
// //             }

// //             // Heading (editable)
// //             if (tag === '\\h') {
// //               return (
// //                 <div
// //                   key={id}
// //                   style={{ textAlign: 'center', margin: '20px 0', fontSize: 20, fontWeight: 'bold' }}
// //                 >
// //                   <div
// //                     ref={(el) => (contentRefs.current[id] = el)}
// //                     contentEditable
// //                     suppressContentEditableWarning
// //                     onBlur={() => handleBlur(id)}
// //                     onKeyDown={(e) => handleKeyDown(e, id)}
// //                     style={{
// //                       display: 'inline-block',
// //                       borderBottom: '1px dashed #ccc',
// //                       padding: 4,
// //                       minHeight: 20,
// //                       maxWidth: '80%',
// //                       outline: 'none',
// //                     }}
// //                   />
// //                 </div>
// //               );
// //             }

// //             // Verse (superscript number, editable text)
// //             if (tag === '\\v') {
// //               return (
// //                 <div
// //                   key={id}
// //                   style={{ display: 'flex', alignItems: 'baseline', marginBottom: 8 }}
// //                 >
// //                   <sup style={{ fontWeight: 'bold', fontSize: '0.8em', color: '#EE5A24' }}>{verseNumber}</sup>
// //                   <div
// //                     ref={(el) => (contentRefs.current[id] = el)}
// //                     contentEditable
// //                     suppressContentEditableWarning
// //                     onBlur={() => {
// //                       const updatedText = contentRefs.current[id]?.innerText || '';
// //                       const newOriginal = `\\v ${verseNumber} ${updatedText}`;
// //                       setParsed((prev) =>
// //                         prev.map((line) =>
// //                           line.id === id
// //                             ? {
// //                               ...line,
// //                               content: updatedText,
// //                               original: newOriginal,
// //                             }
// //                             : line
// //                         )
// //                       );
// //                     }}
// //                     onKeyDown={(e) => handleKeyDown(e, id)}
// //                     style={{
// //                       marginLeft: 8,
// //                       flex: 1,
// //                       borderBottom: '1px dashed #ccc',
// //                       padding: 4,
// //                       minHeight: 20,
// //                       outline: 'none',
// //                     }}
// //                   >
// //                     {content}
// //                   </div>
// //                 </div>
// //               );
// //             }

// //             // \s, \s1, \s2 — Section Headings
// //             if (['\\s', '\\s1', '\\s2'].includes(tag)) {
// //               return (
// //                 <div
// //                   key={id}
// //                   style={{
// //                     fontWeight: 'bold',
// //                     fontSize: tag === '\\s2' ? '1.1em' : '1.2em',
// //                     textDecoration: tag === '\\s' ? 'underline' : 'none',
// //                     margin: '10px 0',
// //                     textAlign: 'center'
// //                   }}
// //                 >
// //                   <div
// //                     ref={(el) => (contentRefs.current[id] = el)}
// //                     contentEditable
// //                     suppressContentEditableWarning
// //                     onBlur={() => handleBlur(id)}
// //                     onKeyDown={(e) => handleKeyDown(e, id)}
// //                     style={{
// //                       borderBottom: '1px dashed #ccc',
// //                       display: 'inline-block',
// //                       padding: 4,
// //                       minHeight: 20,
// //                       outline: 'none',
// //                     }}
// //                   >
// //                     {content}
// //                   </div>
// //                 </div>
// //               );
// //             }

// //             // \q, \q1, \q2 — Poetry/Indented lines
// //             if (['\\q', '\\q1', '\\q2'].includes(tag)) {
// //               const indent = tag === '\\q2' ? 40 : tag === '\\q1' ? 20 : 10;
// //               return (
// //                 <div
// //                   key={id}
// //                   style={{
// //                     marginLeft: indent,
// //                     fontStyle: 'italic',
// //                     marginBottom: 6,
// //                   }}
// //                 >
// //                   <div
// //                     ref={(el) => (contentRefs.current[id] = el)}
// //                     contentEditable
// //                     suppressContentEditableWarning
// //                     onBlur={() => handleBlur(id)}
// //                     onKeyDown={(e) => handleKeyDown(e, id)}
// //                     style={{
// //                       borderBottom: '1px dashed #ccc',
// //                       display: 'inline-block',
// //                       padding: 4,
// //                       minHeight: 20,
// //                       outline: 'none',
// //                     }}
// //                   >
// //                     {content}
// //                   </div>
// //                 </div>
// //               );
// //             }

// //             // \qs — Selah and musical notations
// //             if (tag === '\\qs') {
// //               return (
// //                 <div
// //                   key={id}
// //                   style={{
// //                     textAlign: 'center',
// //                     margin: '8px 0',
// //                     fontStyle: 'italic',
// //                     fontSize: '0.9em',
// //                     color: '#666',
// //                   }}
// //                 >
// //                   <div
// //                     ref={(el) => (contentRefs.current[id] = el)}
// //                     contentEditable
// //                     suppressContentEditableWarning
// //                     onBlur={() => handleBlur(id)}
// //                     onKeyDown={(e) => handleKeyDown(e, id)}
// //                     style={{
// //                       borderBottom: '1px dashed #ccc',
// //                       display: 'inline-block',
// //                       padding: '4px 8px',
// //                       minHeight: 20,
// //                       outline: 'none',
// //                       backgroundColor: '#f8f9fa',
// //                       borderRadius: '3px',
// //                     }}
// //                   >
// //                     {content}
// //                   </div>
// //                 </div>
// //               );
// //             }

// //             return (
// //               <div
// //                 key={id}
// //                 style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}
// //               >
// //                 <span
// //                   style={{
// //                     userSelect: 'none',
// //                     color: '#555',
// //                     fontWeight: 'bold',
// //                     minWidth: 50,
// //                   }}
// //                 >
// //                   {tag}
// //                 </span>
// //                 <div
// //                   ref={(el) => (contentRefs.current[id] = el)}
// //                   contentEditable
// //                   suppressContentEditableWarning
// //                   onBlur={() => handleBlur(id)}
// //                   onKeyDown={(e) => handleKeyDown(e, id)}
// //                   style={{
// //                     marginLeft: 8,
// //                     flex: 1,
// //                     borderBottom: '1px dashed #ccc',
// //                     padding: 4,
// //                     minHeight: 20,
// //                     outline: 'none',
// //                   }}
// //                 />
// //               </div>
// //             );
// //           })}
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default USFMEditor;
// import React, { useState, useRef, useEffect } from 'react';

// const VISIBLE_TAGS = ['\\h', '\\c', '\\v', '\\s', '\\s1', '\\s2', '\\q', '\\q1', '\\q2', '\\qs'];

// const parseUSFM = (usfm) => {
//   const lines = usfm.split(/\r?\n/);
//   const parsed = [];

//   lines.forEach((line, index) => {
//     const match = line.match(/^\\(\w+)\s*(.*)$/);
//     if (match) {
//       const [, tag, content] = match;
//       const fullTag = `\\${tag}`;

//       if (fullTag === '\\v') {
//         const [verseNumber, ...rest] = content.trim().split(' ');
//         parsed.push({
//           id: index,
//           tag: fullTag,
//           content: rest.join(' '),
//           verseNumber,
//           original: line,
//         });
//       } else if (fullTag === '\\qs') {
//         // Handle \qs content by removing closing \qs* tag
//         const cleanContent = content.replace(/\\qs\*\s*$/, '');
//         parsed.push({
//           id: index,
//           tag: fullTag,
//           content: cleanContent,
//           original: line
//         });
//       } else {
//         parsed.push({ id: index, tag: fullTag, content, original: line });
//       }
//     }
//   });

//   return parsed;
// };

// const USFMEditor = () => {
//   const [parsed, setParsed] = useState([]);
//   const [filename, setFilename] = useState(null);
//   const [contentSet, setContentSet] = useState(false);

//   const contentRefs = useRef({});

//   // Get array of editable elements in order
//   const getEditableElements = () => {
//     return parsed
//       .filter(({ tag }) => VISIBLE_TAGS.includes(tag) && tag !== '\\c')
//       .map(({ id }) => id);
//   };

//   // Helper function to get cursor position in a contentEditable element
//   const getCursorPosition = (element) => {
//     const selection = window.getSelection();
//     if (selection.rangeCount === 0) return 0;

//     const range = selection.getRangeAt(0);
//     const preCaretRange = range.cloneRange();
//     preCaretRange.selectNodeContents(element);
//     preCaretRange.setEnd(range.endContainer, range.endOffset);
//     return preCaretRange.toString().length;
//   };

//   // Helper function to set cursor position in a contentEditable element
//   const setCursorPosition = (element, position) => {
//     const textContent = element.innerText || '';
//     const targetPosition = Math.min(position, textContent.length);

//     const range = document.createRange();
//     const selection = window.getSelection();

//     // Find the text node and position within it
//     let currentPos = 0;
//     let targetNode = null;
//     let targetOffset = 0;

//     const walker = document.createTreeWalker(
//       element,
//       NodeFilter.SHOW_TEXT,
//       null,
//       false
//     );

//     let node = walker.nextNode();
//     while (node) {
//       const nodeLength = node.textContent.length;
//       if (currentPos + nodeLength >= targetPosition) {
//         targetNode = node;
//         targetOffset = targetPosition - currentPos;
//         break;
//       }
//       currentPos += nodeLength;
//       node = walker.nextNode();
//     }

//     if (targetNode) {
//       range.setStart(targetNode, targetOffset);
//       range.setEnd(targetNode, targetOffset);
//     } else {
//       // If no text node found, place at the end
//       range.selectNodeContents(element);
//       range.collapse(false);
//     }

//     selection.removeAllRanges();
//     selection.addRange(range);
//   };

//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (file && file.name.endsWith('.usfm')) {
//       setFilename(file.name);
//       const reader = new FileReader();
//       reader.onload = (event) => {
//         const text = event.target.result;
//         const parsedUSFM = parseUSFM(text);
//         setParsed(parsedUSFM);
//         setContentSet(false);
//       };
//       reader.readAsText(file);
//     } else {
//       alert('Please upload a valid .usfm file');
//     }
//   };

//   const handleBlur = (id) => {
//     const newText = contentRefs.current[id]?.innerText || '';
//     setParsed((prev) =>
//       prev.map((line) => {
//         if (line.id === id) {
//           let newOriginal;
//           if (line.tag === '\\qs') {
//             // Reconstruct \qs with closing tag
//             newOriginal = `\\qs ${newText}\\qs*`;
//           } else {
//             newOriginal = line.tag ? `${line.tag} ${newText}` : newText;
//           }
//           return {
//             ...line,
//             content: newText,
//             original: newOriginal,
//           };
//         }
//         return line;
//       })
//     );
//   };

//   // const handleKeyDown = (e, id) => {
//   //   if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
//   //     const editableIds = getEditableElements();
//   //     const currentIndex = editableIds.indexOf(id);

//   //     if (currentIndex === -1) return;

//   //     // Get current cursor position before moving
//   //     const currentElement = contentRefs.current[id];
//   //     const currentCursorPos = getCursorPosition(currentElement);

//   //     let nextIndex;
//   //     if (e.key === 'ArrowUp') {
//   //       nextIndex = currentIndex > 0 ? currentIndex - 1 : editableIds.length - 1;
//   //     } else {
//   //       nextIndex = currentIndex < editableIds.length - 1 ? currentIndex + 1 : 0;
//   //     }

//   //     const nextId = editableIds[nextIndex];
//   //     const nextElement = contentRefs.current[nextId];

//   //     if (nextElement) {
//   //       e.preventDefault();
//   //       nextElement.focus();

//   //       // Set cursor position based on the previous position
//   //       setTimeout(() => {
//   //         setCursorPosition(nextElement, currentCursorPos);
//   //       }, 0);
//   //     }
//   //   }
//   // };
//   //   const handleKeyDown = (e, id) => {
//   //   if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
//   //     const editableIds = getEditableElements();
//   //     const currentIndex = editableIds.indexOf(id);
//   //     if (currentIndex === -1) return;

//   //     const currentElement = contentRefs.current[id];
//   //     const currentCursorPos = getCursorPosition(currentElement);

//   //     let nextIndex;
//   //     if (e.key === 'ArrowUp') {
//   //       nextIndex = currentIndex > 0 ? currentIndex - 1 : editableIds.length - 1;
//   //     } else {
//   //       nextIndex = currentIndex < editableIds.length - 1 ? currentIndex + 1 : 0;
//   //     }

//   //     const nextId = editableIds[nextIndex];
//   //     const nextElement = contentRefs.current[nextId];

//   //     if (nextElement) {
//   //       e.preventDefault();

//   //       // Use requestAnimationFrame for better timing than setTimeout
//   //       requestAnimationFrame(() => {
//   //         nextElement.focus();

//   //         // Wait for browser to render/focus before setting cursor
//   //         requestAnimationFrame(() => {
//   //           setCursorPosition(nextElement, currentCursorPos);
//   //         });
//   //       });
//   //     }
//   //   }
//   // };
//   const handleKeyDown = (e, id) => {
//     const editableIds = getEditableElements();
//     const currentIndex = editableIds.indexOf(id);
//     if (currentIndex === -1) return;

//     const currentElement = contentRefs.current[id];
//     const cursorPos = getCursorPosition(currentElement);
//     const textLength = currentElement.innerText.length;

//     const moveToElement = (targetIndex, targetCursorPos) => {
//       const nextId = editableIds[targetIndex];
//       const nextElement = contentRefs.current[nextId];
//       if (nextElement) {
//         e.preventDefault();
//         requestAnimationFrame(() => {
//           nextElement.focus();
//           requestAnimationFrame(() => {
//             setCursorPosition(nextElement, targetCursorPos);
//           });
//         });
//       }
//     };

//     // UP: Stop if at first
//     if (e.key === 'ArrowUp') {
//       if (currentIndex > 0) {
//         e.preventDefault();
//         const prevIndex = currentIndex - 1;
//         moveToElement(prevIndex, cursorPos);
//       }
//     }


//     // DOWN: Stop if already at last
//     else if (e.key === 'ArrowDown') {
//       if (currentIndex < editableIds.length - 1) {
//         e.preventDefault();
//         const nextIndex = currentIndex + 1;
//         moveToElement(nextIndex, cursorPos);
//       }
//     }

//     // LEFT: Go to previous editable if at start
//     // else if (e.key === 'ArrowLeft') {
//     //   if (cursorPos === 0 && currentIndex > 0) {
//     //     e.preventDefault();
//     //     const prevIndex = currentIndex - 1;
//     //     const prevElement = contentRefs.current[editableIds[prevIndex]];
//     //     const prevLength = prevElement?.innerText.length || 0;
//     //     moveToElement(prevIndex, prevLength);
//     //   }
//     // }
//     else if (e.key === 'ArrowLeft') {
//       if (cursorPos === 0 && currentIndex > 0) {
//         e.preventDefault(); // Stop default left-arrow movement
//         const prevIndex = currentIndex - 1;
//         const prevElement = contentRefs.current[editableIds[prevIndex]];
//         if (prevElement) {
//           // Use selection API before browser paints the focus
//           requestAnimationFrame(() => {
//             prevElement.focus();
//             // Place cursor at the end synchronously after focus
//             const range = document.createRange();
//             const sel = window.getSelection();
//             range.selectNodeContents(prevElement);
//             range.collapse(false); // false = end of node
//             sel.removeAllRanges();
//             sel.addRange(range);
//           });
//         }
//       }
//     }

//     // RIGHT: Go to next editable if at end
//     else if (e.key === 'ArrowRight') {
//       if (cursorPos === textLength && currentIndex < editableIds.length - 1) {
//         e.preventDefault();
//         const nextIndex = currentIndex + 1;
//         moveToElement(nextIndex, 0);
//       }
//     }
//   };



//   useEffect(() => {
//     if (!contentSet) {
//       parsed.forEach(({ id, content }) => {
//         if (contentRefs.current[id]) {
//           contentRefs.current[id].innerText = content;
//         }
//       });
//       setContentSet(true);
//     }
//   }, [parsed, contentSet]);

//   const handleExport = () => {
//     const usfmString = parsed.map((line) => line.original).join('\n');
//     const blob = new Blob([usfmString], { type: 'text/plain' });
//     const downloadLink = document.createElement('a');
//     downloadLink.href = URL.createObjectURL(blob);
//     downloadLink.download = filename || 'edited.usfm';
//     downloadLink.click();
//   };

//   return (
//     <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
//       <h2>USFM Editor</h2>
//       {/* <p style={{ color: '#666', fontSize: '0.9em', marginBottom: '10px' }}>
//         Use ↑ and ↓ arrow keys to navigate between editable fields. Cursor position is preserved when moving between fields.
//       </p> */}

//       <input type="file" accept=".usfm" onChange={handleFileUpload} />
//       {filename && <p><strong>Editing:</strong> {filename}</p>}

//       {parsed.length > 0 && (
//         <button
//           onClick={handleExport}
//           style={{
//             marginTop: 20,
//             padding: '10px 20px',
//             background: '#007bff',
//             color: '#fff',
//             border: 'none',
//             borderRadius: 4,
//             cursor: 'pointer',
//           }}
//         >
//           Export USFM
//         </button>
//       )}

//       <div style={{ marginTop: '20px' }}>
//         {parsed.map(({ id, tag, content, verseNumber }) => {
//           if (!VISIBLE_TAGS.includes(tag)) return null;

//           // Chapter (non-editable)
//           if (tag === '\\c') {
//             return (
//               <div key={id} style={{ textAlign: 'center', margin: '20px 0', fontSize: 18, fontWeight: 'bold', color: '#EE5A24' }}>
//                 Chapter {content}
//               </div>
//             );
//           }

//           // Heading (editable)
//           if (tag === '\\h') {
//             return (
//               <div
//                 key={id}
//                 style={{ textAlign: 'center', margin: '20px 0', fontSize: 20, fontWeight: 'bold' }}
//               >
//                 <div
//                   ref={(el) => (contentRefs.current[id] = el)}
//                   contentEditable
//                   suppressContentEditableWarning
//                   onBlur={() => handleBlur(id)}
//                   onKeyDown={(e) => handleKeyDown(e, id)}
//                   style={{
//                     display: 'inline-block',
//                     borderBottom: '1px dashed #ccc',
//                     padding: 4,
//                     minHeight: 20,
//                     maxWidth: '80%',
//                     outline: 'none',
//                   }}
//                 />
//               </div>
//             );
//           }

//           // Verse (superscript number, editable text)
//           if (tag === '\\v') {
//             return (
//               <div
//                 key={id}
//                 style={{ display: 'flex', alignItems: 'baseline', marginBottom: 8 }}
//               >
//                 <sup style={{ fontWeight: 'bold', fontSize: '0.8em', color: '#EE5A24' }}>{verseNumber}</sup>
//                 <div
//                   ref={(el) => (contentRefs.current[id] = el)}
//                   contentEditable
//                   suppressContentEditableWarning
//                   onBlur={() => {
//                     const updatedText = contentRefs.current[id]?.innerText || '';
//                     const newOriginal = `\\v ${verseNumber} ${updatedText}`;
//                     setParsed((prev) =>
//                       prev.map((line) =>
//                         line.id === id
//                           ? {
//                             ...line,
//                             content: updatedText,
//                             original: newOriginal,
//                           }
//                           : line
//                       )
//                     );
//                   }}
//                   onKeyDown={(e) => handleKeyDown(e, id)}
//                   style={{
//                     marginLeft: 8,
//                     flex: 1,
//                     borderBottom: '1px dashed #ccc',
//                     padding: 4,
//                     minHeight: 20,
//                     outline: 'none',
//                   }}
//                 >
//                   {content}
//                 </div>
//               </div>
//             );
//           }

//           // \s, \s1, \s2 — Section Headings
//           if (['\\s', '\\s1', '\\s2'].includes(tag)) {
//             return (
//               <div
//                 key={id}
//                 style={{
//                   fontWeight: 'bold',
//                   fontSize: tag === '\\s2' ? '1.1em' : '1.2em',
//                   textDecoration: tag === '\\s' ? 'underline' : 'none',
//                   margin: '10px 0',
//                   textAlign: 'center'
//                 }}
//               >
//                 <div
//                   ref={(el) => (contentRefs.current[id] = el)}
//                   contentEditable
//                   suppressContentEditableWarning
//                   onBlur={() => handleBlur(id)}
//                   onKeyDown={(e) => handleKeyDown(e, id)}
//                   style={{
//                     borderBottom: '1px dashed #ccc',
//                     display: 'inline-block',
//                     padding: 4,
//                     minHeight: 20,
//                     outline: 'none',
//                   }}
//                 >
//                   {content}
//                 </div>
//               </div>
//             );
//           }

//           // \q, \q1, \q2 — Poetry/Indented lines
//           if (['\\q', '\\q1', '\\q2'].includes(tag)) {
//             const indent = tag === '\\q2' ? 40 : tag === '\\q1' ? 20 : 10;
//             return (
//               <div
//                 key={id}
//                 style={{
//                   marginLeft: indent,
//                   fontStyle: 'italic',
//                   marginBottom: 6,
//                 }}
//               >
//                 <div
//                   ref={(el) => (contentRefs.current[id] = el)}
//                   contentEditable
//                   suppressContentEditableWarning
//                   onBlur={() => handleBlur(id)}
//                   onKeyDown={(e) => handleKeyDown(e, id)}
//                   style={{
//                     borderBottom: '1px dashed #ccc',
//                     display: 'inline-block',
//                     padding: 4,
//                     minHeight: 20,
//                     outline: 'none',
//                   }}
//                 >
//                   {content}
//                 </div>
//               </div>
//             );
//           }

//           // \qs — Selah and musical notations
//           if (tag === '\\qs') {
//             return (
//               <div
//                 key={id}
//                 style={{
//                   textAlign: 'center',
//                   margin: '8px 0',
//                   fontStyle: 'italic',
//                   fontSize: '0.9em',
//                   color: '#666',
//                 }}
//               >
//                 <div
//                   ref={(el) => (contentRefs.current[id] = el)}
//                   contentEditable
//                   suppressContentEditableWarning
//                   onBlur={() => handleBlur(id)}
//                   onKeyDown={(e) => handleKeyDown(e, id)}
//                   style={{
//                     borderBottom: '1px dashed #ccc',
//                     display: 'inline-block',
//                     padding: '4px 8px',
//                     minHeight: 20,
//                     outline: 'none',
//                     backgroundColor: '#f8f9fa',
//                     borderRadius: '3px',
//                   }}
//                 >
//                   {content}
//                 </div>
//               </div>
//             );
//           }

//           return (
//             <div
//               key={id}
//               style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}
//             >
//               <span
//                 style={{
//                   userSelect: 'none',
//                   color: '#555',
//                   fontWeight: 'bold',
//                   minWidth: 50,
//                 }}
//               >
//                 {tag}
//               </span>
//               <div
//                 ref={(el) => (contentRefs.current[id] = el)}
//                 contentEditable
//                 suppressContentEditableWarning
//                 onBlur={() => handleBlur(id)}
//                 onKeyDown={(e) => handleKeyDown(e, id)}
//                 style={{
//                   marginLeft: 8,
//                   flex: 1,
//                   borderBottom: '1px dashed #ccc',
//                   padding: 4,
//                   minHeight: 20,
//                   outline: 'none',
//                 }}
//               />
//             </div>
//           );
//         })}
//       </div>


//     </div>
//   );
// };

// export default USFMEditor;
import React, { useState, useRef, useEffect } from 'react';

const VISIBLE_TAGS = ['\\h', '\\c', '\\v', '\\s', '\\s1', '\\s2', '\\q', '\\q1', '\\q2', '\\qs'];

// const parseUSFM = (usfm) => {
//   const lines = usfm.split(/\r?\n/);
//   const parsed = [];

//   lines.forEach((line, index) => {
//     const match = line.match(/^\\(\w+)\s*(.*)$/);
//     if (match) {
//       const [, tag, content] = match;
//       const fullTag = `\\${tag}`;

//       if (fullTag === '\\v') {
//         const [verseNumber, ...rest] = content.trim().split(' ');
//         parsed.push({
//           id: index,
//           tag: fullTag,
//           content: rest.join(' '),
//           verseNumber,
//           original: line,
//         });
//       } else if (fullTag === '\\qs') {
//         // Handle \qs content by removing closing \qs* tag
//         const cleanContent = content.replace(/\\qs\*\s*$/, '');
//         parsed.push({
//           id: index,
//           tag: fullTag,
//           content: cleanContent,
//           original: line
//         });
//       } else {
//         parsed.push({ id: index, tag: fullTag, content, original: line });
//       }
//     }
//   });

//   return parsed;
// };
//before sr
const parseUSFM = (usfm) => {
  const lines = usfm.split(/\r?\n/);
  const parsed = [];
  let idCounter = 0;

  lines.forEach((line) => {
    const match = line.match(/^\\(\w+)\s*(.*)$/);
    if (match) {
      const [, tag, content] = match;
      const fullTag = `\\${tag}`;

      if (fullTag === '\\p') {
        // Check if content has multiple \v tags
        const verseMatches = content.matchAll(/\\v\s+(\d+)\s+([^\\]*)/g);
        let lastIndex = 0;
        for (const match of verseMatches) {
          const [full, verseNumber, verseText] = match;
          parsed.push({
            id: idCounter++,
            tag: '\\v',
            verseNumber,
            content: verseText.trim(),
            original: `\\v ${verseNumber} ${verseText.trim()}`,
          });
          lastIndex = match.index + full.length;
        }

        // Capture any trailing non-verse text
        const remainingText = content.slice(lastIndex).trim();
        if (remainingText) {
          parsed.push({
            id: idCounter++,
            tag: '\\p',
            content: remainingText,
            original: `\\p ${remainingText}`,
          });
        }
      } else if (fullTag === '\\v') {
        const [verseNumber, ...rest] = content.trim().split(' ');
        parsed.push({
          id: idCounter++,
          tag: fullTag,
          content: rest.join(' '),
          verseNumber,
          original: line,
        });
      } else if (fullTag === '\\qs') {
        const cleanContent = content.replace(/\\qs\*\s*$/, '');
        parsed.push({
          id: idCounter++,
          tag: fullTag,
          content: cleanContent,
          original: line,
        });
      } else {
        parsed.push({
          id: idCounter++,
          tag: fullTag,
          content,
          original: line,
        });
      }
    }
  });

  return parsed;
};


// const USFMEditor = () => {
//   const [parsed, setParsed] = useState([]);
//   const [filename, setFilename] = useState(null);
//   const [contentSet, setContentSet] = useState(false);

//   const contentRefs = useRef({});

const USFMEditor = ({ selectedFont,
  fontSize,
  textDirection,
  usfmString,
  setNavRef,
  scrRef,
  setScrRef,
  bookId }) => {
  const [parsed, setParsed] = useState([]);
  const [filename, setFilename] = useState(null);
  const [contentSet, setContentSet] = useState(false);
  const contentRefs = useRef({});
  const chapter = scrRef?.chapterNum?.toString();
  const verse = scrRef?.verseNum?.toString();
  const verseAnchorRef = useRef(null);




  // const [currentChapter, setCurrentChapter] = useState(1);
  // const [currentVerse, setCurrentVerse] = useState(1);
  console.log(

    selectedFont,
    'fontsize', fontSize,
    'srcRef',
    scrRef,
    // setScrRef,
    'bookId', bookId)

  useEffect(() => {
    if (usfmString) {
      const parsedUSFM = parseUSFM(usfmString);
      setParsed(parsedUSFM);
      setContentSet(false);
      setFilename('FromProps.usfm');
    }
  }, [usfmString]);




  // Get array of editable elements in order
  const getEditableElements = () => {
    return parsed
      .filter(({ tag }) => VISIBLE_TAGS.includes(tag) && tag !== '\\c')
      .map(({ id }) => id);
  };

  // Helper function to get cursor position in a contentEditable element
  const getCursorPosition = (element) => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return 0;

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    return preCaretRange.toString().length;
  };

  // Helper function to set cursor position in a contentEditable element
  const setCursorPosition = (element, position) => {
    const textContent = element.innerText || '';
    const targetPosition = Math.min(position, textContent.length);

    const range = document.createRange();
    const selection = window.getSelection();

    // Find the text node and position within it
    let currentPos = 0;
    let targetNode = null;
    let targetOffset = 0;

    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node = walker.nextNode();
    while (node) {
      const nodeLength = node.textContent.length;
      if (currentPos + nodeLength >= targetPosition) {
        targetNode = node;
        targetOffset = targetPosition - currentPos;
        break;
      }
      currentPos += nodeLength;
      node = walker.nextNode();
    }

    if (targetNode) {
      range.setStart(targetNode, targetOffset);
      range.setEnd(targetNode, targetOffset);
    } else {
      // If no text node found, place at the end
      range.selectNodeContents(element);
      range.collapse(false);
    }

    selection.removeAllRanges();
    selection.addRange(range);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.usfm')) {
      setFilename(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const parsedUSFM = parseUSFM(text);
        setParsed(parsedUSFM);
        setContentSet(false);
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a valid .usfm file');
    }
  };

  const handleBlur = (id) => {
    const newText = contentRefs.current[id]?.innerText || '';
    setParsed((prev) =>
      prev.map((line) => {
        if (line.id === id) {
          let newOriginal;
          if (line.tag === '\\qs') {
            // Reconstruct \qs with closing tag
            newOriginal = `\\qs ${newText}\\qs*`;
          } else {
            newOriginal = line.tag ? `${line.tag} ${newText}` : newText;
          }
          return {
            ...line,
            content: newText,
            original: newOriginal,
          };
        }
        return line;
      })
    );
  };

  const handleKeyDown = (e, id) => {
    const editableIds = getEditableElements();
    const currentIndex = editableIds.indexOf(id);
    if (currentIndex === -1) return;

    const currentElement = contentRefs.current[id];
    const cursorPos = getCursorPosition(currentElement);
    const textLength = currentElement.innerText.length;

    const moveToElement = (targetIndex, targetCursorPos) => {
      const nextId = editableIds[targetIndex];
      const nextElement = contentRefs.current[nextId];
      if (nextElement) {
        e.preventDefault();
        requestAnimationFrame(() => {
          nextElement.focus();
          requestAnimationFrame(() => {
            setCursorPosition(nextElement, targetCursorPos);
          });
        });
      }
    };

    // UP: Stop if at first
    if (e.key === 'ArrowUp') {
      if (currentIndex > 0) {
        e.preventDefault();
        const prevIndex = currentIndex - 1;
        moveToElement(prevIndex, cursorPos);
      }
    }


    // DOWN: Stop if already at last
    else if (e.key === 'ArrowDown') {
      if (currentIndex < editableIds.length - 1) {
        e.preventDefault();
        const nextIndex = currentIndex + 1;
        moveToElement(nextIndex, cursorPos);
      }
    }


    else if (e.key === 'ArrowLeft') {
      if (cursorPos === 0 && currentIndex > 0) {
        e.preventDefault(); // Stop default left-arrow movement
        const prevIndex = currentIndex - 1;
        const prevElement = contentRefs.current[editableIds[prevIndex]];
        if (prevElement) {
          // Use selection API before browser paints the focus
          requestAnimationFrame(() => {
            prevElement.focus();
            // Place cursor at the end synchronously after focus
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(prevElement);
            range.collapse(false); // false = end of node
            sel.removeAllRanges();
            sel.addRange(range);
          });
        }
      }
    }

    // RIGHT: Go to next editable if at end
    else if (e.key === 'ArrowRight') {
      if (cursorPos === textLength && currentIndex < editableIds.length - 1) {
        e.preventDefault();
        const nextIndex = currentIndex + 1;
        moveToElement(nextIndex, 0);
      }
    }
  };



  useEffect(() => {
    if (!contentSet) {
      parsed.forEach(({ id, content }) => {
        if (contentRefs.current[id]) {
          contentRefs.current[id].innerText = content;
        }
      });
      setContentSet(true);
    }
  }, [parsed, contentSet]);

  const handleExport = () => {
    const usfmString = parsed.map((line) => line.original).join('\n');
    const blob = new Blob([usfmString], { type: 'text/plain' });
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = filename || 'edited.usfm';
    downloadLink.click();
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      {/* <h2>USFM Editor</h2> */}
      {/* <p style={{ color: '#666', fontSize: '0.9em', marginBottom: '10px' }}>
        Use ↑ and ↓ arrow keys to navigate between editable fields. Cursor position is preserved when moving between fields.
      </p> */}

      {/* <input type="file" accept=".usfm" onChange={handleFileUpload} /> */}
      {/* {filename && <p><strong>Editing:</strong> {filename}</p>} */}

      {/* {parsed.length > 0 && (
        <button
          onClick={handleExport}
          style={{
            marginTop: 20,
            padding: '10px 20px',
            background: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Export USFM
        </button>
      )} */}

      <div style={{ marginTop: '20px' }}>
        {parsed.map(({ id, tag, content, verseNumber }) => {
          if (!VISIBLE_TAGS.includes(tag)) return null;

          // Chapter (non-editable)
          if (tag === '\\c') {
            return (
              <div key={id} style={{ textAlign: 'center', margin: '20px 0', fontSize: 18 + fontSize, fontWeight: 'bold', color: '#EE5A24' }}>
                Chapter {content}
              </div>
            );
          }

          // Heading (editable)
          if (tag === '\\h') {
            return (
              <div
                key={id}
                style={{ textAlign: 'center', margin: '20px 0', fontSize: 20 + fontSize, fontWeight: 'bold' }}
              >
                {/* <div
                  ref={(el) => (contentRefs.current[id] = el)}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={() => handleBlur(id)}
                  onKeyDown={(e) => handleKeyDown(e, id)}
                  style={{
                    display: 'inline-block',
                    // borderBottom: '1px dashed #ccc',
                    padding: 4,
                    minHeight: 20,
                    maxWidth: '80%',
                    outline: 'none',
                  }}
                /> */}
                <div
                  ref={(el) => (contentRefs.current[id] = el)}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={() => handleBlur(id)}
                  onKeyDown={(e) => handleKeyDown(e, id)}
                  style={{
                    display: 'inline-block',
                    // borderBottom: '1px dashed #ccc',
                    padding: 4,
                    minHeight: 20,
                    maxWidth: '80%',
                    outline: 'none',
                  }}
                >
                  {content}
                </div>

              </div>
            );
          }

          // Verse (superscript number, editable text)
          if (tag === '\\v') {
            return (
              <div
                key={id}
                style={{ display: 'flex', alignItems: 'baseline', marginBottom: 8 }}
              >
                <sup style={{ fontWeight: 'bold', fontSize: '0.8em' + fontSize, color: '#EE5A24' }}>{verseNumber}</sup>
                <div
                  ref={(el) => (contentRefs.current[id] = el)}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={() => {
                    const updatedText = contentRefs.current[id]?.innerText || '';
                    const newOriginal = `\\v ${verseNumber} ${updatedText}`;
                    setParsed((prev) =>
                      prev.map((line) =>
                        line.id === id
                          ? {
                            ...line,
                            content: updatedText,
                            original: newOriginal,
                          }
                          : line
                      )
                    );
                  }}
                  onKeyDown={(e) => handleKeyDown(e, id)}
                  style={{
                    marginLeft: 8,
                    flex: 1,
                    borderBottom: '1px dashed #ccc',
                    padding: 4,
                    minHeight: 20,
                    outline: 'none',
                    fontSize: 16 + fontSize
                  }}
                >
                  {content}
                </div>
              </div>
            );
          }

          // \s, \s1, \s2 — Section Headings
          if (['\\s', '\\s1', '\\s2'].includes(tag)) {
            return (
              <div
                key={id}
                style={{
                  fontWeight: 'bold',
                  fontSize: tag === '\\s2' ? '1.1em' + fontSize : '1.2em' + fontSize,
                  textDecoration: tag === '\\s' ? 'underline' : 'none',
                  margin: '10px 0',
                  textAlign: 'center'
                }}
              >
                <div
                  ref={(el) => (contentRefs.current[id] = el)}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={() => handleBlur(id)}
                  onKeyDown={(e) => handleKeyDown(e, id)}
                  style={{
                    borderBottom: '1px dashed #ccc',
                    display: 'inline-block',
                    padding: 4,
                    minHeight: 20,
                    outline: 'none',
                  }}
                >
                  {content}
                </div>
              </div>
            );
          }

          // \q, \q1, \q2 — Poetry/Indented lines
          if (['\\q', '\\q1', '\\q2'].includes(tag)) {
            const indent = tag === '\\q2' ? 40 : tag === '\\q1' ? 20 : 10;
            return (
              <div
                key={id}
                style={{
                  marginLeft: indent,
                  fontStyle: 'italic',
                  marginBottom: 6,
                }}
              >
                <div
                  ref={(el) => (contentRefs.current[id] = el)}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={() => handleBlur(id)}
                  onKeyDown={(e) => handleKeyDown(e, id)}
                  style={{
                    borderBottom: '1px dashed #ccc',
                    display: 'inline-block',
                    padding: 4,
                    minHeight: 20,
                    outline: 'none',
                  }}
                >
                  {content}
                </div>
              </div>
            );
          }

          // \qs — Selah and musical notations
          if (tag === '\\qs') {
            return (
              <div
                key={id}
                style={{
                  textAlign: 'center',
                  margin: '8px 0',
                  fontStyle: 'italic',
                  fontSize: '0.9em' + fontSize,
                  color: '#666',
                }}
              >
                <div
                  ref={(el) => (contentRefs.current[id] = el)}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={() => handleBlur(id)}
                  onKeyDown={(e) => handleKeyDown(e, id)}
                  style={{
                    borderBottom: '1px dashed #ccc',
                    display: 'inline-block',
                    padding: '4px 8px',
                    minHeight: 20,
                    outline: 'none',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '3px',
                  }}
                >
                  {content}
                </div>
              </div>
            );
          }

          return (
            <div
              key={id}
              style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}
            >
              <span
                style={{
                  userSelect: 'none',
                  color: '#555',
                  fontWeight: 'bold',
                  minWidth: 50,
                }}
              >
                {tag}
              </span>
              <div
                ref={(el) => (contentRefs.current[id] = el)}
                contentEditable
                suppressContentEditableWarning
                onBlur={() => handleBlur(id)}
                onKeyDown={(e) => handleKeyDown(e, id)}
                style={{
                  marginLeft: 8,
                  flex: 1,
                  borderBottom: '1px dashed #ccc',
                  padding: 4,
                  minHeight: 20,
                  outline: 'none',
                }}
              />
            </div>
          );
        })}
      </div>


    </div>
  );
};

export default USFMEditor;