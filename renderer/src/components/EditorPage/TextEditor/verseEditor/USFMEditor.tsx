

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
import { saveToFile } from '../hooks/saveToFile'; // Adjust import path as needed

const VISIBLE_TAGS = ['\\h', '\\c', '\\v', '\\s', '\\s1', '\\s2', '\\q', '\\q1', '\\q2', '\\qs'];

const parseUSFM = (usfm) => {
  const lines = usfm.split(/\r?\n/);
  const parsed = [];
  let idCounter = 0;
  let currentChapter = '1';

  lines.forEach((line) => {
    if (line.trim() === '') {
      parsed.push({
        id: idCounter++,
        tag: null,
        content: '',
        original: '',
        visible: false,
        chapter: currentChapter,
      });
      return;
    }

    const match = line.match(/^\\(\w+)\s*(.*)$/);
    if (match) {
      const [, tag, content] = match;
      const fullTag = `\\${tag}`;

      if (fullTag === '\\c') {
        currentChapter = content.trim();
      }

      if (fullTag === '\\p') {
        if (content.trim()) {
          const verseMatches = [...content.matchAll(/\\v\s+(\d+)\s+([^\\]*(?:\\(?!v\s+\d)[^\\]*)*)/g)];
          if (verseMatches.length > 0) {
            parsed.push({
              id: idCounter++,
              tag: '\\p',
              content: '',
              original: '\\p',
              visible: false,
              chapter: currentChapter,
            });

            let lastIndex = 0;

            for (const match of verseMatches) {
              const [full, verseNumber, verseText] = match;

              const beforeText = content.slice(lastIndex, match.index).trim();
              if (beforeText) {
                parsed.push({
                  id: idCounter++,
                  tag: '\\p',
                  content: beforeText,
                  original: `\\p ${beforeText}`,
                  visible: true,
                  chapter: currentChapter,
                });
              }

              const cleanVerseText = verseText.trim();

              parsed.push({
                id: idCounter++,
                tag: '\\v',
                verseNumber,
                content: cleanVerseText,
                original: `\\v ${verseNumber} ${cleanVerseText}`,
                visible: true,
                chapter: currentChapter,
              });

              lastIndex = match.index + full.length;
            }

            const remainingText = content.slice(lastIndex).trim();
            if (remainingText) {
              parsed.push({
                id: idCounter++,
                tag: '\\p',
                content: remainingText,
                original: `\\p ${remainingText}`,
                visible: true,
                chapter: currentChapter,
              });
            }
          } else {
            parsed.push({
              id: idCounter++,
              tag: '\\p',
              content: content,
              original: line,
              visible: true,
              chapter: currentChapter,
            });
          }
        } else {
          parsed.push({
            id: idCounter++,
            tag: '\\p',
            content: '',
            original: '\\p',
            visible: false,
            chapter: currentChapter,
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
          visible: true,
          chapter: currentChapter,
        });
      } else if (fullTag === '\\qs') {
        const cleanContent = content.replace(/\\qs\*\s*$/, '');
        parsed.push({
          id: idCounter++,
          tag: fullTag,
          content: cleanContent,
          original: line,
          visible: true,
          chapter: currentChapter,
        });
      } else {
        const isVisible = VISIBLE_TAGS.includes(fullTag);
        parsed.push({
          id: idCounter++,
          tag: fullTag,
          content,
          original: line,
          visible: isVisible,
          chapter: currentChapter,
        });
      }
    } else if (line.trim()) {
      parsed.push({
        id: idCounter++,
        tag: null,
        content: line,
        original: line,
        visible: false,
        chapter: currentChapter,
      });
    }
  });

  return parsed;
};

// Dirty State Indicator Component
const DirtyStateIndicator = ({ isDirty, isSaving }) => {
  if (isSaving) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: 12,
        color: '#666',
        padding: '4px 8px',
        backgroundColor: '#f0f0f0',
        borderRadius: '12px',
        border: '1px solid #ddd'
      }}>
        <div style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: '#ff9800',
          animation: 'pulse 1.5s infinite'
        }}></div>
        Saving...
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: 12,
      color: isDirty ? '#f57c00' : '#4caf50',
      padding: '4px 8px',
      backgroundColor: isDirty ? '#fff8e1' : '#f1f8e9',
      borderRadius: '12px',
      border: `1px solid ${isDirty ? '#ffcc02' : '#c8e6c9'}`
    }}>
      <div style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: isDirty ? '#ffcc02' : '#4caf50'
      }}></div>
      {isDirty ? 'Unsaved changes' : 'Saved'}
    </div>
  );
};

// const CombinedUSFMEditor = ({
//   selectedFont = 'sans-serif',
//   fontSize = 0,
//   usfmString = '',
//   textDirection,
//   setNavRef,
//   scrRef,
//   setScrRef,
//   bookId,
//   filePath,
//   onUsfmChange // Add this prop for the debounced save function
// }) => {
//   const [parsed, setParsed] = useState([]);
//   const [filename, setFilename] = useState('');
//   const [currentFocusId, setCurrentFocusId] = useState(null);
//   const [selectedVerseId, setSelectedVerseId] = useState(null);
//   const [isScrolling, setIsScrolling] = useState(false);
//   // Add dirty state management
//   const [isDirty, setIsDirty] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);

//   const contentRefs = useRef({});
//   const containerRef = useRef(null);
//   const chapterRefs = useRef({});
//   const verseRefs = useRef({});
//   const scrollTimeoutRef = useRef(null);
//   const lastScrRefUpdate = useRef(null);
//   const saveTimeoutRef = useRef(null);

//   // Memoize editable elements to avoid recalculation
//   const editableElements = useMemo(() => {
//     return parsed
//       .filter(({ tag, visible }) => visible && tag !== '\\c')
//       .map(({ id }) => id);
//   }, [parsed]);

//   useEffect(() => {
//     const content = usfmString;
//     if (content) {
//       const parsedUSFM = parseUSFM(content);
//       setParsed(parsedUSFM);
//       setFilename(usfmString ? 'FromProps.usfm' : 'ProvidedData.usfm');
//     }
//   }, [usfmString]);

//   useEffect(() => {
//     if (scrRef && parsed.length > 0) {
//       setTimeout(() => {
//         scrollToReference(scrRef);
//       }, 100);
//     }
//   }, [scrRef, parsed]);

//   useEffect(() => {
//     return () => {
//       if (scrollTimeoutRef.current) {
//         clearTimeout(scrollTimeoutRef.current);
//       }
//       if (saveTimeoutRef.current) {
//         clearTimeout(saveTimeoutRef.current);
//       }
//     };
//   }, []);

//   // Function to trigger save with debounce
//   const triggerSave = useCallback(() => {
//     if (!onUsfmChange) return;

//     // Clear existing timeout
//     if (saveTimeoutRef.current) {
//       clearTimeout(saveTimeoutRef.current);
//     }

//     // Set saving state immediately when save is triggered
//     setIsSaving(true);

//     // Use a small delay to allow state to update, then get fresh data
//     saveTimeoutRef.current = setTimeout(() => {
//       // Get the most current parsed state
//       setParsed(currentParsed => {
//         // Generate USFM string from current parsed state
//         const usfmString = currentParsed.map((line) => line.original).join('\n');

//         // Call the debounced save function and handle the promise
//         const saveResult = onUsfmChange(usfmString);

//         // If onUsfmChange returns a promise, wait for it
//         if (saveResult && typeof saveResult.then === 'function') {
//           saveResult
//             .then(() => {
//               setIsDirty(false);
//               setIsSaving(false);
//             })
//             .catch((error) => {
//               console.error('Save failed:', error);
//               setIsSaving(false);
//               // Keep isDirty as true since save failed
//             });
//         } else {
//           // If not a promise, assume it's handled by debounce
//           // We'll set a longer timeout to account for the 3000ms debounce
//           setTimeout(() => {
//             setIsDirty(false);
//             setIsSaving(false);
//           }, 3500); // Slightly longer than the 3000ms debounce
//         }

//         return currentParsed; // Return unchanged state
//       });
//     }, 100); // Small delay to batch rapid changes
//   }, [onUsfmChange]);

//   // Optimized function to find preceding verse (no state updates)
//   const findPrecedingVerse = useCallback((currentId) => {
//     const editableIds = parsed.filter(({ tag, visible }) => visible && tag !== '\\c');
//     const currentIndex = editableIds.findIndex(el => el.id === currentId);

//     if (currentIndex === -1) return null;

//     for (let i = currentIndex; i >= 0; i--) {
//       const element = editableIds[i];
//       if (element.tag === '\\v') {
//         return {
//           chapter: element.chapter,
//           verseNumber: element.verseNumber,
//           id: element.id
//         };
//       }
//     }
//     return null;
//   }, [parsed]);

//   // Debounced scrRef update to reduce parent re-renders
//   const updateScrRefDebounced = useCallback((elementId) => {
//     const currentElement = parsed.find(el => el.id === elementId);
//     if (!currentElement) return;

//     let targetVerse = null;

//     if (currentElement.tag === '\\v') {
//       targetVerse = {
//         chapter: currentElement.chapter,
//         verseNumber: currentElement.verseNumber,
//         id: currentElement.id
//       };
//       setSelectedVerseId(elementId);
//     } else {
//       targetVerse = findPrecedingVerse(elementId);
//       setSelectedVerseId(targetVerse ? targetVerse.id : null);
//     }

//     if (targetVerse && setScrRef) {
//       const newScrRef = {
//         bookCode: bookId || 'MAT',
//         chapterNum: targetVerse.chapter,
//         verseNum: parseInt(targetVerse.verseNumber, 10),
//       };

//       // Only update if different from last update
//       const refKey = `${newScrRef.bookCode}-${newScrRef.chapterNum}-${newScrRef.verseNum}`;
//       if (lastScrRefUpdate.current !== refKey) {
//         lastScrRefUpdate.current = refKey;
//         setScrRef(newScrRef);
//         setNavRef && setNavRef(newScrRef);
//       }
//     }
//   }, [parsed, findPrecedingVerse, setScrRef, setNavRef, bookId]);

//   const scrollToReference = useCallback((ref) => {
//     if (!ref || !ref.chapterNum || !ref.verseNum) return;

//     if (scrollTimeoutRef.current) {
//       clearTimeout(scrollTimeoutRef.current);
//     }

//     setIsScrolling(true);

//     const chapterNum = ref.chapterNum.toString();
//     const verseNum = ref.verseNum.toString();

//     const foundVerse = parsed.find(item =>
//       item.tag === '\\v' &&
//       item.chapter === chapterNum &&
//       item.verseNumber === verseNum
//     );

//     if (!foundVerse) {
//       setIsScrolling(false);
//       return;
//     }

//     const verseKey = `${chapterNum}-${verseNum}`;
//     const verseElement = verseRefs.current[verseKey];

//     if (verseElement) {
//       setSelectedVerseId(foundVerse.id);

//       verseElement.scrollIntoView({
//         behavior: 'smooth',
//         block: 'center',
//         inline: 'nearest'
//       });

//       scrollTimeoutRef.current = setTimeout(() => {
//         const activeElement = document.activeElement;
//         if (!activeElement ||
//           !('contentEditable' in activeElement) ||
//           activeElement.contentEditable === 'inherit') {

//           const editableElement = contentRefs.current[foundVerse.id];
//           if (editableElement) {
//             editableElement.focus();

//             const range = document.createRange();
//             const sel = window.getSelection();
//             range.selectNodeContents(editableElement);
//             range.collapse(false);
//             sel.removeAllRanges();
//             sel.addRange(range);

//             setCurrentFocusId(foundVerse.id);
//           }
//         }
//         setIsScrolling(false);
//       }, 200);
//     } else {
//       const chapterElement = chapterRefs.current[chapterNum];
//       if (chapterElement) {
//         chapterElement.scrollIntoView({
//           behavior: 'smooth',
//           block: 'center',
//           inline: 'nearest'
//         });
//       }
//       setIsScrolling(false);
//     }
//   }, [parsed]);

//   // Simplified cursor positioning
//   const setCursorToStart = (element) => {
//     const range = document.createRange();
//     const selection = window.getSelection();

//     range.selectNodeContents(element);
//     range.collapse(true); // Collapse to start
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
//         // Reset dirty state when loading new file
//         setIsDirty(false);
//         setIsSaving(false);
//       };
//       reader.readAsText(file);
//     } else {
//       alert('Please upload a valid .usfm file');
//     }
//   };

//   const handleBlur = useCallback((id) => {
//     const newText = contentRefs.current[id]?.innerText || '';

//     // Find current line to check for changes
//     const currentLine = parsed.find(line => line.id === id);
//     const hasChanged = currentLine && currentLine.content !== newText;

//     // Update the parsed state immediately
//     setParsed((prev) => {
//       const newParsed = prev.map((line) => {
//         if (line.id === id) {
//           let newOriginal;
//           if (line.tag === '\\qs') {
//             newOriginal = `\\qs ${newText}\\qs*`;
//           } else if (line.tag === '\\v') {
//             newOriginal = `\\v ${line.verseNumber} ${newText}`;
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
//       });

//       // If content changed, trigger save with the updated data
//       if (hasChanged) {
//         setIsDirty(true);
//         // Use setTimeout to ensure the state update is complete
//         setTimeout(() => {
//           if (onUsfmChange) {
//             setIsSaving(true);
//             const usfmString = newParsed.map((line) => line.original).join('\n');

//             const saveResult = onUsfmChange(usfmString);

//             // Handle the save result
//             if (saveResult && typeof saveResult.then === 'function') {
//               saveResult
//                 .then(() => {
//                   setIsDirty(false);
//                   setIsSaving(false);
//                 })
//                 .catch((error) => {
//                   console.error('Save failed:', error);
//                   setIsSaving(false);
//                 });
//             } else {
//               // Account for debounce delay
//               setTimeout(() => {
//                 setIsDirty(false);
//                 setIsSaving(false);
//               }, 3500);
//             }
//           }
//         }, 0);
//       }

//       return newParsed;
//     });

//     setCurrentFocusId(null);
//   }, [parsed, onUsfmChange]);

//   const handleFocus = useCallback((id) => {
//     if (scrollTimeoutRef.current && !isScrolling) {
//       clearTimeout(scrollTimeoutRef.current);
//       scrollTimeoutRef.current = null;
//     }

//     setCurrentFocusId(id);
//     // Debounce the scrRef update to reduce re-renders
//     setTimeout(() => updateScrRefDebounced(id), 0);
//   }, [isScrolling, updateScrRefDebounced]);

//   // Handle input changes for immediate dirty state feedback
//   const handleInput = useCallback((id) => {
//     if (!isDirty) {
//       setIsDirty(true);
//     }
//   }, [isDirty]);

//   // Simplified navigation - just move to next/previous element like Tab behavior
//   const moveToElement = useCallback((targetIndex) => {
//     if (targetIndex < 0 || targetIndex >= editableElements.length) return;

//     const nextId = editableElements[targetIndex];
//     const nextElement = contentRefs.current[nextId];

//     if (nextElement) {
//       nextElement.focus();
//       setCursorToStart(nextElement);
//       setCurrentFocusId(nextId);
//       setTimeout(() => updateScrRefDebounced(nextId), 0);
//     }
//   }, [editableElements, updateScrRefDebounced]);

//   const handleKeyDown = useCallback((e, id) => {
//     if (isScrolling) return;

//     const currentIndex = editableElements.indexOf(id);
//     if (currentIndex === -1) return;

//     // Protect verse numbers from deletion
//     const currentLine = parsed.find(line => line.id === id);
//     if (currentLine && currentLine.tag === '\\v') {
//       const currentElement = contentRefs.current[id];
//       const selection = window.getSelection();
//       const cursorPos = selection.focusOffset;

//       if ((e.key === 'Backspace' || e.key === 'Delete') && cursorPos === 0) {
//         e.preventDefault();
//         return;
//       }
//     }

//     // Simplified arrow key navigation - just move between elements
//     if (e.key === 'ArrowUp') {
//       e.preventDefault();
//       moveToElement(currentIndex - 1);
//     } else if (e.key === 'ArrowDown') {
//       e.preventDefault();
//       moveToElement(currentIndex + 1);
//     }

//   }, [isScrolling, editableElements, parsed, moveToElement]);

//   const handleExport = () => {
//     const usfmString = parsed.map((line) => line.original).join('\n');
//     const blob = new Blob([usfmString], { type: 'text/plain' });
//     const downloadLink = document.createElement('a');
//     downloadLink.href = URL.createObjectURL(blob);
//     downloadLink.download = filename || 'edited.usfm';
//     downloadLink.click();
//     URL.revokeObjectURL(downloadLink.href);
//   };

//   return (
//     <div
//       ref={containerRef}
//       style={{
//         fontFamily: selectedFont || 'sans-serif',
//         minHeight: '95%',
//         // backgroundColor: '#f8f9fa',
//         overflow: 'hidden',
//         // border: '1px solid green'
//       }}
//     >

//       <div style={{
//         // padding: '5px',
//         // borderBottom: '1px solid #e0e0e0',
//         backgroundColor: 'white',

//         flexShrink: 0
//       }}>
//         <style>
//           {`
//           @keyframes pulse {
//             0%, 100% { opacity: 1; }
//             50% { opacity: 0.5; }
//           }
//         `}
//         </style>

//         {/* source: {filePath} */}
//         <div style={{ display: 'flex', gap: '10px', padding: '5px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end' }}>
//           {/* <input
//             type="file"
//             accept=".usfm"
//             onChange={handleFileUpload}
//             style={{
//               fontSize: 14,
//               padding: '6px',
//             }}
//           />
//           <button
//             onClick={handleExport}
//             style={{
//               backgroundColor: '#007bff',
//               color: 'white',
//               border: 'none',
//               padding: '8px 12px',
//               borderRadius: 4,
//               cursor: 'pointer',
//             }}
//           >
//             Export USFM
//           </button>

//           <span style={{ fontSize: 14, color: '#666', alignSelf: 'center' }}>
//             {filename} - {parsed.length} elements ({parsed.filter(p => p.visible).length} visible)
//           </span> */}

//           {/* Add the dirty state indicator */}
//           <DirtyStateIndicator isDirty={isDirty} isSaving={isSaving} />
//         </div>
//       </div>

//       <div
//         style={{
//           flex: 1,
//           overflow: 'auto',
//           height: 'calc(100% - 50px)', // Adjust based on header height
//           // border: '1px solid red'
//         }}
//       >
//         <div
//           style={{
//             backgroundColor: 'white',
//             padding: '7px',
//             minHeight: '100%',
//             // border: '1px solid pink',
//             overflowY: 'auto'
//           }}
//         >
//           {parsed.map(({ id, tag, content, verseNumber, visible, chapter }) => {
//             if (!visible) return null;

//             // Chapter (non-editable, protected)
//             if (tag === '\\c') {
//               return (
//                 <div
//                   key={id}
//                   ref={(el) => {
//                     if (el) {
//                       chapterRefs.current[content] = el;
//                     }
//                   }}
//                   style={{
//                     textAlign: 'center',
//                     // margin: '30px 0',
//                     fontSize: 18 + fontSize,
//                     fontWeight: 'bold',
//                     color: '#EE5A24',
//                     padding: '10px',
//                     borderRadius: '8px',
//                     userSelect: 'none'
//                   }}
//                 >
//                   Chapter {content}
//                 </div>
//               );
//             }

//             // Verse (superscript number - protected, editable text)
//             if (tag === '\\v') {
//               const verseKey = `${chapter}-${verseNumber}`;
//               const isSelected = selectedVerseId === id;

//               return (
//                 <div
//                   key={id}
//                   ref={(el) => {
//                     if (el) {
//                       verseRefs.current[verseKey] = el;
//                     }
//                   }}
//                   style={{
//                     display: 'flex',
//                     alignItems: 'center',
//                     marginBottom: 10,
//                     padding: '4px 0',
//                     flexDirection: textDirection === 'rtl' ? 'row-reverse' : 'row',
//                     transition: 'all 0.3s ease'
//                   }}
//                 >
//                   <div style={{
//                     fontWeight: 'bold',
//                     fontSize: '.9em',
//                     color: '#EE5A24',
//                     minWidth: '20px',
//                     userSelect: 'none',
//                     transition: 'all 0.3s ease',
//                   }}>
//                     {verseNumber}
//                   </div>
//                   <div
//                     ref={(el) => {
//                       if (el) contentRefs.current[id] = el;
//                     }}
//                     contentEditable
//                     suppressContentEditableWarning
//                     onBlur={() => handleBlur(id)}
//                     onFocus={() => handleFocus(id)}
//                     onInput={() => handleInput(id)}
//                     onKeyDown={(e) => handleKeyDown(e, id)}
//                     style={{
//                       flex: 1,
//                       padding: '8px 12px',
//                       minHeight: 20,
//                       outline: 'none',
//                       fontSize: 16 + fontSize,
//                       lineHeight: '1.5',
//                       borderRadius: '4px',
//                       direction: textDirection,
//                       backgroundColor: currentFocusId === id ? '#e8f5e8' : (isSelected ? 'rgba(238, 90, 36, 0.1)' : 'transparent'),
//                       transition: 'all 0.2s ease'
//                     }}
//                   >
//                     {content}
//                   </div>
//                 </div>
//               );
//             }

//             // Section Headings
//             if (['\\s', '\\s1', '\\s2'].includes(tag)) {
//               return (
//                 <div
//                   key={id}
//                   style={{
//                     fontWeight: 'bold',
//                     fontSize: tag === '\\s2' ? `${1.1 + fontSize / 16}em` : `${1.2 + fontSize / 16}em`,
//                     textDecoration: tag === '\\s' ? 'underline' : 'none',
//                     margin: '16px 0',
//                     textAlign: 'center'
//                   }}
//                 >
//                   <div
//                     ref={(el) => {
//                       if (el) contentRefs.current[id] = el;
//                     }}
//                     contentEditable
//                     suppressContentEditableWarning
//                     onBlur={() => handleBlur(id)}
//                     onFocus={() => handleFocus(id)}
//                     onInput={() => handleInput(id)}
//                     onKeyDown={(e) => handleKeyDown(e, id)}
//                     style={{
//                       display: 'inline-block',
//                       padding: '8px 16px',
//                       minHeight: 20,
//                       outline: 'none',
//                       borderRadius: '4px',
//                       direction: textDirection,
//                       backgroundColor: currentFocusId === id ? '#fff3e0' : 'transparent',
//                       border: currentFocusId === id ? '2px solid #ff9800' : '2px solid transparent',
//                       transition: 'all 0.2s ease'
//                     }}
//                   >
//                     {content}
//                   </div>
//                 </div>
//               );
//             }

//             // Poetry/Indented lines
//             if (['\\q', '\\q1', '\\q2'].includes(tag)) {
//               const indent = tag === '\\q2' ? 40 : tag === '\\q1' ? 20 : 10;
//               return (
//                 <div
//                   key={id}
//                   style={{
//                     marginLeft: indent,
//                     fontStyle: 'italic',
//                     marginBottom: 8,
//                   }}
//                 >
//                   <div
//                     ref={(el) => {
//                       if (el) contentRefs.current[id] = el;
//                     }}
//                     contentEditable
//                     suppressContentEditableWarning
//                     onBlur={() => handleBlur(id)}
//                     onFocus={() => handleFocus(id)}
//                     onInput={() => handleInput(id)}
//                     onKeyDown={(e) => handleKeyDown(e, id)}
//                     style={{
//                       display: 'inline-block',
//                       padding: '6px 12px',
//                       minHeight: 20,
//                       outline: 'none',
//                       borderRadius: '4px',
//                       direction: textDirection,
//                       backgroundColor: currentFocusId === id ? '#f3e5f5' : 'transparent',
//                       border: currentFocusId === id ? '2px solid #9c27b0' : '2px solid transparent',
//                       transition: 'all 0.2s ease'
//                     }}
//                   >
//                     {content}
//                   </div>
//                 </div>
//               );
//             }

//             // Selah and musical notations
//             if (tag === '\\qs') {
//               return (
//                 <div
//                   key={id}
//                   style={{
//                     textAlign: 'center',
//                     margin: '12px 0',
//                     fontStyle: 'italic',
//                     fontSize: `${0.9 + fontSize / 16}em`,
//                     color: '#666',
//                   }}
//                 >
//                   <div
//                     ref={(el) => {
//                       if (el) contentRefs.current[id] = el;
//                     }}
//                     contentEditable
//                     suppressContentEditableWarning
//                     onBlur={() => handleBlur(id)}
//                     onFocus={() => handleFocus(id)}
//                     onInput={() => handleInput(id)}
//                     onKeyDown={(e) => handleKeyDown(e, id)}
//                     style={{
//                       display: 'inline-block',
//                       padding: '8px 16px',
//                       minHeight: 20,
//                       outline: 'none',
//                       backgroundColor: currentFocusId === id ? '#e1f5fe' : '#f8f9fa',
//                       borderRadius: '6px',
//                       border: currentFocusId === id ? '2px solid #00bcd4' : '2px solid #e0e0e0',
//                       transition: 'all 0.2s ease'
//                     }}
//                   >
//                     {content}
//                   </div>
//                 </div>
//               );
//             }

//             return null;
//           })}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CombinedUSFMEditor;

const USFMEditor = ({
  selectedFont = 'sans-serif',
  fontSize = 0,
  usfmString = '',
  textDirection,
  setNavRef,
  scrRef,
  setScrRef,
  bookId,
  filePath,
  onUsfmChange // Add this prop for the debounced save function
}) => {
  const [parsed, setParsed] = useState([]);
  const [filename, setFilename] = useState('');
  const [currentFocusId, setCurrentFocusId] = useState(null);
  const [selectedVerseId, setSelectedVerseId] = useState(null);
  const [isScrolling, setIsScrolling] = useState(false);
  // Add dirty state management
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const contentRefs = useRef({});
  const containerRef = useRef(null);
  const chapterRefs = useRef({});
  const verseRefs = useRef({});
  const scrollTimeoutRef = useRef(null);
  const lastScrRefUpdate = useRef(null);
  const saveTimeoutRef = useRef(null);

  // Memoize editable elements to avoid recalculation
  const editableElements = useMemo(() => {
    return parsed
      .filter(({ tag, visible }) => visible && tag !== '\\c')
      .map(({ id }) => id);
  }, [parsed]);

  useEffect(() => {
    const content = usfmString;
    if (content) {
      const parsedUSFM = parseUSFM(content);
      setParsed(parsedUSFM);
      setFilename(usfmString ? 'FromProps.usfm' : 'ProvidedData.usfm');
    }
  }, [usfmString]);

  useEffect(() => {
    if (scrRef && parsed.length > 0) {
      setTimeout(() => {
        scrollToReference(scrRef);
      }, 100);
    }
  }, [scrRef, parsed]);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Function to trigger save with debounce
  const triggerSave = useCallback(() => {
    if (!onUsfmChange) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set saving state immediately when save is triggered
    setIsSaving(true);

    // Use a small delay to allow state to update, then get fresh data
    saveTimeoutRef.current = setTimeout(() => {
      // Get the most current parsed state
      setParsed(currentParsed => {
        // Generate USFM string from current parsed state
        const usfmString = currentParsed.map((line) => line.original).join('\n');

        // Call the debounced save function and handle the promise
        const saveResult = onUsfmChange(usfmString);

        // If onUsfmChange returns a promise, wait for it
        if (saveResult && typeof saveResult.then === 'function') {
          saveResult
            .then(() => {
              setIsDirty(false);
              setIsSaving(false);
            })
            .catch((error) => {
              console.error('Save failed:', error);
              setIsSaving(false);
              // Keep isDirty as true since save failed
            });
        } else {
          // If not a promise, assume it's handled by debounce
          // We'll set a longer timeout to account for the 3000ms debounce
          setTimeout(() => {
            setIsDirty(false);
            setIsSaving(false);
          }, 3500); // Slightly longer than the 3000ms debounce
        }

        return currentParsed; // Return unchanged state
      });
    }, 100); // Small delay to batch rapid changes
  }, [onUsfmChange]);

  // Optimized function to find preceding verse (no state updates)
  const findPrecedingVerse = useCallback((currentId) => {
    const editableIds = parsed.filter(({ tag, visible }) => visible && tag !== '\\c');
    const currentIndex = editableIds.findIndex(el => el.id === currentId);

    if (currentIndex === -1) return null;

    for (let i = currentIndex; i >= 0; i--) {
      const element = editableIds[i];
      if (element.tag === '\\v') {
        return {
          chapter: element.chapter,
          verseNumber: element.verseNumber,
          id: element.id
        };
      }
    }
    return null;
  }, [parsed]);

  // Debounced scrRef update to reduce parent re-renders
  const updateScrRefDebounced = useCallback((elementId) => {
    const currentElement = parsed.find(el => el.id === elementId);
    if (!currentElement) return;

    let targetVerse = null;

    if (currentElement.tag === '\\v') {
      targetVerse = {
        chapter: currentElement.chapter,
        verseNumber: currentElement.verseNumber,
        id: currentElement.id
      };
      setSelectedVerseId(elementId);
    } else {
      targetVerse = findPrecedingVerse(elementId);
      setSelectedVerseId(targetVerse ? targetVerse.id : null);
    }

    if (targetVerse && setScrRef) {
      const newScrRef = {
        bookCode: bookId || 'MAT',
        chapterNum: targetVerse.chapter,
        verseNum: parseInt(targetVerse.verseNumber, 10),
      };

      // Only update if different from last update
      const refKey = `${newScrRef.bookCode}-${newScrRef.chapterNum}-${newScrRef.verseNum}`;
      if (lastScrRefUpdate.current !== refKey) {
        lastScrRefUpdate.current = refKey;
        setScrRef(newScrRef);
        setNavRef && setNavRef(newScrRef);
      }
    }
  }, [parsed, findPrecedingVerse, setScrRef, setNavRef, bookId]);

  const scrollToReference = useCallback((ref) => {
    if (!ref || !ref.chapterNum || !ref.verseNum) return;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    setIsScrolling(true);

    const chapterNum = ref.chapterNum.toString();
    const verseNum = ref.verseNum.toString();

    const foundVerse = parsed.find(item =>
      item.tag === '\\v' &&
      item.chapter === chapterNum &&
      item.verseNumber === verseNum
    );

    if (!foundVerse) {
      setIsScrolling(false);
      return;
    }

    const verseKey = `${chapterNum}-${verseNum}`;
    const verseElement = verseRefs.current[verseKey];

    if (verseElement) {
      setSelectedVerseId(foundVerse.id);

      verseElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });

      scrollTimeoutRef.current = setTimeout(() => {
        const activeElement = document.activeElement;
        if (!activeElement ||
          !('contentEditable' in activeElement) ||
          activeElement.contentEditable === 'inherit') {

          const editableElement = contentRefs.current[foundVerse.id];
          if (editableElement) {
            editableElement.focus();

            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(editableElement);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);

            setCurrentFocusId(foundVerse.id);
          }
        }
        setIsScrolling(false);
      }, 200);
    } else {
      const chapterElement = chapterRefs.current[chapterNum];
      if (chapterElement) {
        chapterElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }
      setIsScrolling(false);
    }
  }, [parsed]);

  // Enhanced cursor positioning
  const setCursorToStart = (element) => {
    const range = document.createRange();
    const selection = window.getSelection();

    range.selectNodeContents(element);
    range.collapse(true); // Collapse to start
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const setCursorToEnd = (element) => {
    const range = document.createRange();
    const selection = window.getSelection();

    range.selectNodeContents(element);
    range.collapse(false); // Collapse to end
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
        // Reset dirty state when loading new file
        setIsDirty(false);
        setIsSaving(false);
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a valid .usfm file');
    }
  };

  const handleBlur = useCallback((id) => {
    const newText = contentRefs.current[id]?.innerText || '';

    // Find current line to check for changes
    const currentLine = parsed.find(line => line.id === id);
    const hasChanged = currentLine && currentLine.content !== newText;

    // Update the parsed state immediately
    setParsed((prev) => {
      const newParsed = prev.map((line) => {
        if (line.id === id) {
          let newOriginal;
          if (line.tag === '\\qs') {
            newOriginal = `\\qs ${newText}\\qs*`;
          } else if (line.tag === '\\v') {
            newOriginal = `\\v ${line.verseNumber} ${newText}`;
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
      });

      // If content changed, trigger save with the updated data
      if (hasChanged) {
        setIsDirty(true);
        // Use setTimeout to ensure the state update is complete
        setTimeout(() => {
          if (onUsfmChange) {
            setIsSaving(true);
            const usfmString = newParsed.map((line) => line.original).join('\n');

            const saveResult = onUsfmChange(usfmString);

            // Handle the save result
            if (saveResult && typeof saveResult.then === 'function') {
              saveResult
                .then(() => {
                  setIsDirty(false);
                  setIsSaving(false);
                })
                .catch((error) => {
                  console.error('Save failed:', error);
                  setIsSaving(false);
                });
            } else {
              // Account for debounce delay
              setTimeout(() => {
                setIsDirty(false);
                setIsSaving(false);
              }, 3500);
            }
          }
        }, 0);
      }

      return newParsed;
    });

    setCurrentFocusId(null);
  }, [parsed, onUsfmChange]);

  const handleFocus = useCallback((id) => {
    if (scrollTimeoutRef.current && !isScrolling) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }

    setCurrentFocusId(id);
    // Debounce the scrRef update to reduce re-renders
    setTimeout(() => updateScrRefDebounced(id), 0);
  }, [isScrolling, updateScrRefDebounced]);

  // Handle input changes for immediate dirty state feedback
  const handleInput = useCallback((id) => {
    if (!isDirty) {
      setIsDirty(true);
    }
  }, [isDirty]);

  // Helper function to check if cursor is at the beginning or end of the element
  const isCursorAtBoundary = useCallback((element, boundary) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return false;

    const range = selection.getRangeAt(0);
    const textContent = element.textContent || '';

    if (boundary === 'start') {
      return range.startOffset === 0 && range.endOffset === 0;
    } else if (boundary === 'end') {
      return range.startOffset === textContent.length && range.endOffset === textContent.length;
    }

    return false;
  }, []);

  // Navigation with proper cursor positioning
  const moveToElement = useCallback((targetIndex, cursorPosition = 'start') => {
    if (targetIndex < 0 || targetIndex >= editableElements.length) return;

    const nextId = editableElements[targetIndex];
    const nextElement = contentRefs.current[nextId];

    if (nextElement) {
      nextElement.focus();

      if (cursorPosition === 'end') {
        setCursorToEnd(nextElement);
      } else {
        setCursorToStart(nextElement);
      }

      setCurrentFocusId(nextId);
      // setTimeout(() => updateScrRefDebounced(nextId), 0);
      updateScrRefDebounced(nextId);
    }
  }, [editableElements, updateScrRefDebounced]);

  const handleKeyDown = useCallback((e, id) => {
    if (isScrolling) return;

    const currentIndex = editableElements.indexOf(id);
    if (currentIndex === -1) return;

    const currentElement = contentRefs.current[id];
    if (!currentElement) return;

    // Protect verse numbers from deletion
    const currentLine = parsed.find(line => line.id === id);
    if (currentLine && currentLine.tag === '\\v') {
      const selection = window.getSelection();
      const cursorPos = selection.focusOffset;

      if ((e.key === 'Backspace' || e.key === 'Delete') && cursorPos === 0) {
        e.preventDefault();
        return;
      }
    }

    // Handle arrow key navigation
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveToElement(currentIndex - 1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      // moveToElement(currentIndex + 1);
      moveToElement(currentIndex + 1, 'start');
    }

    else if (e.key === 'ArrowLeft') {
      if (textDirection === 'rtl') {
        // In RTL, visually left = logical forward, so check END
        if (isCursorAtBoundary(currentElement, 'end')) {
          e.preventDefault();
          moveToElement(currentIndex + 1, 'start');
        }
      } else {
        // LTR normal: left arrow at start moves to previous
        if (isCursorAtBoundary(currentElement, 'start')) {
          e.preventDefault();
          moveToElement(currentIndex - 1, 'end');
        }
      }
    } else if (e.key === 'ArrowRight') {
      if (textDirection === 'rtl') {
        // In RTL, visually right = logical backward, so check START
        if (isCursorAtBoundary(currentElement, 'start')) {
          e.preventDefault();
          moveToElement(currentIndex - 1, 'end');
        }
      } else {
        // LTR normal: right arrow at end moves to next
        if (isCursorAtBoundary(currentElement, 'end')) {
          e.preventDefault();
          moveToElement(currentIndex + 1, 'start');
        }
      }
    }


  }, [isScrolling, editableElements, parsed, moveToElement, textDirection, isCursorAtBoundary]);

  const handleExport = () => {
    const usfmString = parsed.map((line) => line.original).join('\n');
    const blob = new Blob([usfmString], { type: 'text/plain' });
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = filename || 'edited.usfm';
    downloadLink.click();
    URL.revokeObjectURL(downloadLink.href);
  };

  return (
    <div
      ref={containerRef}
      style={{
        fontFamily: selectedFont || 'sans-serif',
        minHeight: '95%',
        // backgroundColor: '#f8f9fa',
        overflow: 'hidden',
        // border: '1px solid green'
      }}
    >

      <div style={{
        // padding: '5px',
        // borderBottom: '1px solid #e0e0e0',
        backgroundColor: 'white',

        flexShrink: 0
      }}>
        <style>
          {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
        </style>

        {/* source: {filePath} */}
        <div style={{ display: 'flex', gap: '10px', padding: '5px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end' }}>
          {/* <input
            type="file"
            accept=".usfm"
            onChange={handleFileUpload}
            style={{
              fontSize: 14,
              padding: '6px',
            }}
          />
          <button
            onClick={handleExport}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Export USFM
          </button>

          <span style={{ fontSize: 14, color: '#666', alignSelf: 'center' }}>
            {filename} - {parsed.length} elements ({parsed.filter(p => p.visible).length} visible)
          </span> */}

          {/* Add the dirty state indicator */}
          <DirtyStateIndicator isDirty={isDirty} isSaving={isSaving} />
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflow: 'auto',
          height: 'calc(100% - 50px)', // Adjust based on header height
          // border: '1px solid red'
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            padding: '7px',
            minHeight: '100%',
            // border: '1px solid pink',
            overflowY: 'auto'
          }}
        >
          {parsed.map(({ id, tag, content, verseNumber, visible, chapter }) => {
            if (!visible) return null;

            // Chapter (non-editable, protected)
            if (tag === '\\c') {
              return (
                <div
                  key={id}
                  ref={(el) => {
                    if (el) {
                      chapterRefs.current[content] = el;
                    }
                  }}
                  style={{
                    textAlign: 'center',
                    // margin: '30px 0',
                    fontSize: 18 + fontSize,
                    fontWeight: 'bold',
                    color: '#EE5A24',
                    padding: '10px',
                    borderRadius: '8px',
                    userSelect: 'none'
                  }}
                >
                  Chapter {content}
                </div>
              );
            }

            // Verse (superscript number - protected, editable text)
            if (tag === '\\v') {
              const verseKey = `${chapter}-${verseNumber}`;
              const isSelected = selectedVerseId === id;

              return (
                <div
                  key={id}
                  ref={(el) => {
                    if (el) {
                      verseRefs.current[verseKey] = el;
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: 10,
                    padding: '4px 0',
                    flexDirection: textDirection === 'rtl' ? 'row-reverse' : 'row',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{
                    fontWeight: 'bold',
                    fontSize: '.9em',
                    color: '#EE5A24',
                    minWidth: '20px',
                    userSelect: 'none',
                    transition: 'all 0.3s ease',
                  }}>
                    {verseNumber}
                  </div>
                  <div
                    ref={(el) => {
                      if (el) contentRefs.current[id] = el;
                    }}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={() => handleBlur(id)}
                    onFocus={() => handleFocus(id)}
                    onInput={() => handleInput(id)}
                    onKeyDown={(e) => handleKeyDown(e, id)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      minHeight: 20,
                      outline: 'none',
                      fontSize: 16 + fontSize,
                      lineHeight: '1.5',
                      borderRadius: '4px',
                      direction: textDirection,
                      backgroundColor: currentFocusId === id ? '#e8f5e8' : (isSelected ? 'rgba(238, 90, 36, 0.1)' : 'transparent'),
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {content}
                  </div>
                </div>
              );
            }

            // Section Headings
            if (['\\s', '\\s1', '\\s2'].includes(tag)) {
              return (
                <div
                  key={id}
                  style={{
                    fontWeight: 'bold',
                    fontSize: tag === '\\s2' ? `${1.1 + fontSize / 16}em` : `${1.2 + fontSize / 16}em`,
                    textDecoration: tag === '\\s' ? 'underline' : 'none',
                    margin: '16px 0',
                    textAlign: 'center'
                  }}
                >
                  <div
                    ref={(el) => {
                      if (el) contentRefs.current[id] = el;
                    }}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={() => handleBlur(id)}
                    onFocus={() => handleFocus(id)}
                    onInput={() => handleInput(id)}
                    onKeyDown={(e) => handleKeyDown(e, id)}
                    style={{
                      display: 'inline-block',
                      padding: '8px 16px',
                      minHeight: 20,
                      outline: 'none',
                      borderRadius: '4px',
                      direction: textDirection,
                      backgroundColor: currentFocusId === id ? '#fff3e0' : 'transparent',
                      border: currentFocusId === id ? '2px solid #ff9800' : '2px solid transparent',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {content}
                  </div>
                </div>
              );
            }

            // Poetry/Indented lines
            if (['\\q', '\\q1', '\\q2'].includes(tag)) {
              const indent = tag === '\\q2' ? 40 : tag === '\\q1' ? 20 : 10;
              return (
                <div
                  key={id}
                  style={{
                    // marginLeft: indent,
                    // fontStyle: 'italic',
                    // marginBottom: 8,
                    paddingInlineStart: indent,  // respects textDirection automatically
                    fontStyle: 'italic',
                    marginBottom: 8,
                    direction: textDirection,    // ensure container follows textDirection

                  }}
                >
                  <div
                    ref={(el) => {
                      if (el) contentRefs.current[id] = el;
                    }}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={() => handleBlur(id)}
                    onFocus={() => handleFocus(id)}
                    onInput={() => handleInput(id)}
                    onKeyDown={(e) => handleKeyDown(e, id)}
                    style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      minHeight: 20,
                      outline: 'none',
                      borderRadius: '4px',
                      direction: textDirection,
                      backgroundColor: currentFocusId === id ? '#f3e5f5' : 'transparent',
                      border: currentFocusId === id ? '2px solid #9c27b0' : '2px solid transparent',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {content}
                  </div>
                </div>
              );
            }

            // Selah and musical notations
            if (tag === '\\qs') {
              return (
                <div
                  key={id}
                  style={{
                    textAlign: 'center',
                    margin: '12px 0',
                    fontStyle: 'italic',
                    fontSize: `${0.9 + fontSize / 16}em`,
                    color: '#666',
                  }}
                >
                  <div
                    ref={(el) => {
                      if (el) contentRefs.current[id] = el;
                    }}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={() => handleBlur(id)}
                    onFocus={() => handleFocus(id)}
                    onInput={() => handleInput(id)}
                    onKeyDown={(e) => handleKeyDown(e, id)}
                    style={{
                      display: 'inline-block',
                      padding: '8px 16px',
                      minHeight: 20,
                      outline: 'none',
                      backgroundColor: currentFocusId === id ? '#e1f5fe' : '#f8f9fa',
                      borderRadius: '6px',
                      border: currentFocusId === id ? '2px solid #00bcd4' : '2px solid #e0e0e0',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {content}
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>
    </div>
  );
};

export default USFMEditor;