

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { debounce } from 'lodash';

const VISIBLE_TAGS = [
  '\\h',
  '\\c',
  '\\v',
  '\\s',
  '\\s1',
  '\\s2',
  '\\q',
  '\\q1',
  '\\q2',
  '\\qs',
];

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
          const verseMatches = [
            ...content.matchAll(
              /\\v\s+(\d+)\s+([^\\]*(?:\\(?!v\s+\d)[^\\]*)*)/g,
            ),
          ];
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

              const beforeText = content
                .slice(lastIndex, match.index)
                .trim();
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
const DirtyStateIndicator = ({ isDirty }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: 12,
        color: isDirty ? '#f57c00' : '#4caf50',
        padding: '4px 8px',
        backgroundColor: isDirty ? '#fff8e1' : '#f1f8e9',
        borderRadius: '12px',
        border: `1px solid ${isDirty ? '#ffcc02' : '#c8e6c9'}`,
      }}>
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: isDirty ? '#ffcc02' : '#4caf50',
        }}></div>
      {isDirty ? 'Unsaved changes' : 'Saved'}
    </div>
  );
};

const USFMEditor = ({
  selectedFont = 'sans-serif',
  fontSize = 0,
  usfmString = '',
  textDirection = 'ltr',
  setNavRef,
  scrRef,
  setScrRef,
  bookId,
  filePath,
  onUsfmChange,
}) => {
  const [parsed, setParsed] = useState([]);
  const parsedRef = useRef([]);
  const cursorPosRef = useRef(null);


  const [currentFocusId, setCurrentFocusId] = useState(null);
  const [selectedVerseId, setSelectedVerseId] = useState(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const contentRefs = useRef({});
  const containerRef = useRef(null);
  const chapterRefs = useRef({});
  const verseRefs = useRef({});
  const scrollTimeoutRef = useRef(null);
  const lastScrRefUpdate = useRef(null);
  const isDirtyRef = useRef(false);

  // Parse USFM when usfmString changes
  // useEffect(() => {
  //   if (usfmString) {
  //     const parsedUSFM = parseUSFM(usfmString);
  //     setParsed(parsedUSFM);
  //     isDirtyRef.current = false;
  //     setIsDirty(false);
  //   }
  // }, [usfmString]);
  useEffect(() => {
    if (usfmString) {
      const parsedUSFM = parseUSFM(usfmString);
      parsedRef.current = parsedUSFM;
      setParsed(parsedUSFM); // Triggers controlled re-render
      isDirtyRef.current = false;
      setIsDirty(false);
    }
  }, [usfmString]);



  // Scroll to reference when scrRef changes
  useEffect(() => {
    if (scrRef && parsed.length > 0) {
      setTimeout(() => {
        scrollToReference(scrRef);
      }, 100);
    }
  }, [scrRef, parsed]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // const findPrecedingVerse = useCallback(
  //   (currentId) => {
  //     const editableIds = parsed.filter(
  //       ({ tag, visible }) => visible && tag !== '\\c',
  //     );
  //     const currentIndex = editableIds.findIndex(
  //       (el) => el.id === currentId,
  //     );
  //     if (currentIndex === -1) return null;
  //     for (let i = currentIndex; i >= 0; i--) {
  //       const element = editableIds[i];
  //       if (element.tag === '\\v') {
  //         return {
  //           chapter: element.chapter,
  //           verseNumber: element.verseNumber,
  //           id: element.id,
  //         };
  //       }
  //     }
  //     return null;
  //   },
  //   [parsed],
  // );

  const findPrecedingVerse = useCallback((currentId) => {
    const editableIds = parsedRef.current.filter(({ tag, visible }) => visible && tag !== '\\c');
    const currentIndex = editableIds.findIndex(el => el.id === currentId);
    if (currentIndex === -1) return null;

    for (let i = currentIndex; i >= 0; i--) {
      const element = editableIds[i];
      if (element.tag === '\\v') {
        return {
          chapter: element.chapter,
          verseNumber: element.verseNumber,
          id: element.id,
        };
      }
    }
    return null;
  }, []);


  const updateScrRefDebounced = useCallback(
    debounce((elementId) => {
      const currentElement = parsed.find((el) => el.id === elementId);
      if (!currentElement) return;
      let targetVerse = null;
      if (currentElement.tag === '\\v') {
        targetVerse = {
          chapter: currentElement.chapter,
          verseNumber: currentElement.verseNumber,
          id: currentElement.id,
        };
        setSelectedVerseId(elementId);
      } else {
        targetVerse = findPrecedingVerse(elementId);
        setSelectedVerseId(targetVerse ? targetVerse.id : null);
      }
      if (targetVerse && setScrRef) {
        const newScrRef = {
          bookCode: bookId || 'MAT',
          chapterNum: targetVerse.chapter.toString(),
          verseNum: targetVerse.verseNumber.toString(),
        };

        const refKey = `${newScrRef.bookCode}-${newScrRef.chapterNum}-${newScrRef.verseNum}`;
        if (lastScrRefUpdate.current !== refKey) {
          lastScrRefUpdate.current = refKey;
          setScrRef(newScrRef);
          setNavRef && setNavRef(newScrRef);
        }
      }
    }, 300),
    [parsed, findPrecedingVerse, setScrRef, setNavRef, bookId],
  );

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
        if (!activeElement || !activeElement.matches('[contenteditable="true"]')) {
          const editableElement = contentRefs.current[foundVerse.id];
          if (editableElement) {
            editableElement.focus();
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
          block: 'nearest',
        });
      }
      setIsScrolling(false);
    }
    // }, [parsed]);
  }, []);

  // Simplified debounced content change handler
  // const handleContentChange = useCallback(
  //   debounce((id, rawText) => {
  //     const element = contentRefs.current[id];
  //     if (!element) return;

  //     // Clean the text (remove line breaks, normalize spaces)
  //     const newText = rawText.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();

  //     const updatedParsed = parsed.map((line) =>
  //       line.id === id
  //         ? {
  //           ...line,
  //           content: newText,
  //           original:
  //             line.tag === '\\qs'
  //               ? `\\qs ${newText}\\qs*`
  //               : line.tag === '\\v'
  //                 ? `\\v ${line.verseNumber} ${newText}`
  //                 : line.tag
  //                   ? `${line.tag} ${newText}`
  //                   : newText,
  //         }
  //         : line
  //     );

  //     setParsed(updatedParsed);

  //     // Direct save to file via onUsfmChange
  //     if (onUsfmChange) {
  //       const usfmString = updatedParsed.map((line) => line.original).join('\n');
  //       onUsfmChange(usfmString);
  //       isDirtyRef.current = false;
  //       setIsDirty(false);
  //     }
  //   }, 4000),
  //   [parsed, onUsfmChange]
  // );

  // const handleContentChange = useCallback(
  //   debounce((id, rawText) => {
  //     const element = contentRefs.current[id];
  //     if (!element) return;

  //     const newText = rawText.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();

  //     // Find and update the parsed item directly (mutation)
  //     const itemIndex = parsed.findIndex((line) => line.id === id);
  //     if (itemIndex !== -1) {
  //       const line = parsed[itemIndex];
  //       line.content = newText;
  //       line.original =
  //         line.tag === '\\qs'
  //           ? `\\qs ${newText}\\qs*`
  //           : line.tag === '\\v'
  //             ? `\\v ${line.verseNumber} ${newText}`
  //             : line.tag
  //               ? `${line.tag} ${newText}`
  //               : newText;
  //     }

  //     // Regenerate USFM without calling setParsed
  //     if (onUsfmChange) {
  //       const usfmString = parsed.map((line) => line.original).join('\n');
  //       onUsfmChange(usfmString);
  //       isDirtyRef.current = false;
  //       setIsDirty(false);
  //     }
  //   }, 4000),
  //   [parsed, onUsfmChange]
  // );
  // const handleContentChange = useMemo(() =>
  //   debounce((id, rawText) => {
  //     const element = contentRefs.current[id];
  //     if (!element) return;

  //     const newText = rawText.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();

  //     const itemIndex = parsedRef.current.findIndex((line) => line.id === id);
  //     if (itemIndex !== -1) {
  //       const line = parsedRef.current[itemIndex];
  //       line.content = newText;
  //       line.original =
  //         line.tag === '\\qs'
  //           ? `\\qs ${newText}\\qs*`
  //           : line.tag === '\\v'
  //             ? `\\v ${line.verseNumber} ${newText}`
  //             : line.tag
  //               ? `${line.tag} ${newText}`
  //               : newText;
  //     }

  //     if (onUsfmChange) {
  //       const usfmOutput = parsedRef.current.map((line) => line.original).join('\n');
  //       onUsfmChange(usfmOutput);
  //       isDirtyRef.current = false;
  //       setIsDirty(false);
  //     }
  //   }, 4000), [onUsfmChange]
  // );


  const handleContentChange = useCallback(
    debounce((id, rawText) => {
      const element = contentRefs.current[id];
      if (!element) return;

      const newText = rawText.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();

      const updatedParsed = parsed.map((line) =>
        line.id === id
          ? {
            ...line,
            content: newText,
            original:
              line.tag === '\\qs'
                ? `\\qs ${newText}\\qs*`
                : line.tag === '\\v'
                  ? `\\v ${line.verseNumber} ${newText}`
                  : line.tag
                    ? `${line.tag} ${newText}`
                    : newText,
          }
          : line
      );

      setParsed(updatedParsed);

      // Cursor restore logic after save triggers rerender
      setTimeout(() => {
        if (cursorPosRef.current?.id === id) {
          const element = contentRefs.current[id];
          if (element && element.firstChild) {
            element.focus();
            const selection = window.getSelection();
            const range = document.createRange();
            const pos = cursorPosRef.current.start;

            const textNode = element.firstChild;
            const safePos = Math.min(pos, textNode.length); // Avoid overflow errors

            range.setStart(textNode, safePos);
            range.setEnd(textNode, safePos);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      }, 50); // Slight delay ensures DOM updated

      if (onUsfmChange) {
        const usfmString = updatedParsed.map((line) => line.original).join('\n');
        onUsfmChange(usfmString);
        isDirtyRef.current = false;
        setIsDirty(false);
      }
    }, 4000),
    [parsed, onUsfmChange]
  );


  const handleInput = useCallback((e, id) => {
    // Mark as dirty immediately
    if (!isDirtyRef.current) {
      setIsDirty(true);
      isDirtyRef.current = true;
    }

    // Get the current text content and call the debounced function
    const newText = e.target.textContent || e.target.innerText || '';
    // Save cursor position
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      cursorPosRef.current = {
        id,
        start: range.startOffset,
        end: range.endOffset,
      };
    }
    handleContentChange(id, newText);
  }, [handleContentChange]);

  const handleFocus = useCallback((id) => {
    if (!isScrolling) {
      updateScrRefDebounced(id);
    }
    setCurrentFocusId(id);
  }, [isScrolling, updateScrRefDebounced]);

  const handleKeyDown = useCallback((e, id) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Block line breaks
    }
  }, []);

  const handlePaste = useCallback((e, id) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    const sanitizedText = text.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ');

    const element = contentRefs.current[id];
    if (element) {
      document.execCommand('insertText', false, sanitizedText);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        fontFamily: selectedFont,
        minHeight: '95%',
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        whiteSpace: 'pre-wrap',
      }}
    >
      <div style={{ padding: '10px', backgroundColor: 'white' }}>
        <DirtyStateIndicator isDirty={isDirty} />
      </div>
      <div
        style={{ height: '93%', overflowY: 'auto', backgroundColor: 'white', padding: '10px' }}
      >
        {parsed.map(({ id, tag, content, verseNumber, visible, chapter }) => {
          if (!visible) return null;

          if (tag === '\\c') {
            return (
              <div
                key={id}
                ref={(el) => {
                  if (el) chapterRefs.current[content] = el;
                }}
                style={{
                  fontWeight: 'bold',
                  fontSize: 18 + fontSize,
                  color: '#EE5A24',
                  padding: '10px',
                  borderRadius: '8px',
                  margin: '10px 0',
                  textAlign: textDirection === 'rtl' ? 'right' : 'left',
                }}
              >
                CHAPTER: {chapter}
              </div>
            );
          }

          const commonProps = {
            contentEditable: true,
            suppressContentEditableWarning: true,
            onBlur: () => handleContentChange.flush(),
            onFocus: () => handleFocus(id),
            onInput: (e) => handleInput(e, id),
            onKeyDown: (e) => handleKeyDown(e, id),
            onPaste: (e) => handlePaste(e, id),
          };

          if (tag === '\\v') {
            const verseKey = `${chapter}-${verseNumber}`;
            const isSelected = selectedVerseId === id;
            return (
              <div
                key={id}
                ref={(el) => {
                  if (el) verseRefs.current[verseKey] = el;
                }}
                style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 10 }}
              >
                <div
                  style={{
                    fontWeight: 'bold',
                    minWidth: 30,
                    color: '#EE5A24',
                    marginTop: 12,
                  }}
                >
                  {verseNumber}
                </div>
                <div
                  ref={(el) => {
                    if (el) contentRefs.current[id] = el;
                  }}
                  {...commonProps}
                  className={`${currentFocusId === id ? 'bg-gray-100' : isSelected ? 'bg-gray-50' : 'bg-transparent'}`}
                  style={{
                    width: '95%',
                    // minHeight: 100,
                    padding: '8px 12px',
                    outline: 'none',
                    fontSize: 16 + fontSize,
                    lineHeight: '1.5',
                    borderRadius: '4px',
                    direction: textDirection as 'ltr' | 'rtl',

                    border: 'none',
                  }}
                >
                  {content}
                </div>
              </div>
            );
          }

          if (['\\s', '\\s1', '\\s2'].includes(tag)) {
            return (
              <div
                key={id}
                style={{
                  fontWeight: 'bold',
                  fontSize: tag === '\\s2' ? `${1.1 + fontSize / 16}em` : `${1.2 + fontSize / 16}em`,
                  textDecoration: tag === '\\s' ? 'underline' : 'none',
                  margin: '16px 0',
                  textAlign: 'center',
                }}
              >
                <div
                  ref={(el) => {
                    if (el) contentRefs.current[id] = el;
                  }}
                  {...commonProps}
                  style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    // minHeight: 50,
                    outline: 'none',
                    borderRadius: '4px',
                    direction: textDirection as 'ltr' | 'rtl',
                    backgroundColor: currentFocusId === id ? '#fff3e0' : 'transparent',
                    border: currentFocusId === id ? '2px solid #ff9800' : '2px solid transparent',
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}
                >
                  {content}
                </div>
              </div>
            );
          }

          if (['\\q', '\\q1', '\\q2'].includes(tag)) {
            const indent = tag === '\\q2' ? 40 : tag === '\\q1' ? 20 : 10;
            return (
              <div
                key={id}
                style={{
                  paddingInlineStart: indent,
                  fontStyle: 'italic',
                  marginBottom: 8,
                  direction: textDirection as 'ltr' | 'rtl',

                }}
              >
                <div
                  ref={(el) => {
                    if (el) contentRefs.current[id] = el;
                  }}
                  {...commonProps}
                  style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    // minHeight: 50,
                    outline: 'none',
                    borderRadius: '4px',
                    direction: textDirection as 'ltr' | 'rtl',
                    backgroundColor: currentFocusId === id ? '#f3e5f5' : 'transparent',
                    border: currentFocusId === id ? '2px solid #9c27b0' : '2px solid transparent',
                    transition: 'all 0.2s ease',
                    fontStyle: 'italic',
                  }}
                >
                  {content}
                </div>
              </div>
            );
          }

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
                  {...commonProps}
                  style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    minHeight: 50,
                    outline: 'none',
                    backgroundColor: currentFocusId === id ? '#e1f5fe' : '#f8f9fa',
                    borderRadius: '6px',
                    border: currentFocusId === id ? '2px solid #00bcd4' : '2px solid #e0e0e0',
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                    fontStyle: 'italic',
                  }}
                >
                  {content}
                </div>
              </div>
            );
          }

          return (
            <div key={id} style={{
              margin: '8px 0', direction: textDirection as 'ltr' | 'rtl',
            }}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default USFMEditor;