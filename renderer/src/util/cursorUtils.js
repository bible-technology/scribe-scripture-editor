function createRange(node, chars, range) {
  if (!range) {
    range = document.createRange(); // eslint-disable-line no-param-reassign
    range.selectNode(node);
    range.setStart(node, 0);
  }

  if (chars.count === 0) {
    range.setEnd(node, chars.count);
  } else if (node && chars.count > 0) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent.length < chars.count) {
        chars.count -= node.textContent.length;
      } else {
        range.setEnd(node, chars.count);
        chars.count = 0;
      }
    } else {
      for (let lp = 0; lp < node.childNodes.length; lp++) {
        range = createRange(node.childNodes[lp], chars, range); // eslint-disable-line no-param-reassign

        if (chars.count === 0) {
          break;
        }
      }
    }
  }

  return range;
}
export function setCurrentCursorPosition(chars) {
  if (chars >= 0) {
    const selection = window.getSelection();

    const range = createRange(document.getElementById('editor').parentNode, { count: chars });

    if (range) {
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
}

function isChildOf(node, parentId) {
  while (node !== null) {
    if (node.id === parentId) {
      return true;
    }
    node = node.parentNode; // eslint-disable-line no-param-reassign
  }

  return false;
}
export function getCurrentCursorPosition(parentId) {
  const selection = window.getSelection();
    let charCount = -1;
    let node;

  if (selection.focusNode) {
    if (isChildOf(selection.focusNode, parentId)) {
      node = selection.focusNode;
      charCount = selection.focusOffset;

      while (node) {
        if (node.id === parentId) {
          break;
        }

        if (node.previousSibling) {
          node = node.previousSibling;
          charCount += node.textContent.length;
        } else {
          node = node.parentNode;
          if (node === null) {
            break;
          }
        }
      }
    }
  }
  return charCount;
}

export function pasteHtmlAtCaret(html, selectPastedContent, cursorPosition) {
  setCurrentCursorPosition(cursorPosition);
  const sel = window.getSelection(); let
range;
  if (sel.getRangeAt && sel.rangeCount) {
    range = sel.getRangeAt(0);
    range.deleteContents();

    // Range.createContextualFragment() would be useful here but is
    // only relatively recently standardized and is not supported in
    // some browsers (IE9, for one)
    const el = document.createElement('div');
    el.innerHTML = html;
    const frag = document.createDocumentFragment();
    let node; let lastNode;
    while ((node = el.firstChild)) { // eslint-disable-line no-cond-assign
      lastNode = frag.appendChild(node);
    }
    const firstNode = frag.firstChild;
    range.insertNode(frag);

    // Preserve the selection
    if (lastNode) {
      range = range.cloneRange();
      range.setStartAfter(lastNode);
      if (selectPastedContent) {
        range.setStartBefore(firstNode);
      } else {
        range.collapse(true);
      }
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }
}

export function insertVerseNumber(caretPosition, verseNumber) {
  if (verseNumber && caretPosition) {
    const verseTag = `<span class="mark verse verse-${verseNumber}" 
      id="ch1v${verseNumber}" data-type="mark" data-subtype="verses" data-atts-number="${verseNumber}" 
      contenteditable="false">${verseNumber}</span>`;
    pasteHtmlAtCaret(verseTag, false, caretPosition);
  }
}
export function insertChapterNumber(caretPosition, chapterNumber) {
  if (chapterNumber && caretPosition) {
    const chapterTag = `<span class="mark chapter chapter-${chapterNumber}"
      id="ch-${chapterNumber}" data-type="mark" data-subtype="chapter"
      data-atts-number="${chapterNumber}">"${chapterNumber}"</span>`;
    pasteHtmlAtCaret(chapterTag, false, caretPosition);
  }
}

export function insertFootnote(caretPosition, footNote) {
  if (footNote && caretPosition) {
  const footnoteTag = `<span class="graft footnote" data-type="graft" data-subtype="footnote" data-new="true"><span class="paragraph usfm f" data-type="paragraph" data-subtype-ns="usfm" data-subtype="f"><span class="graft note_caller" data-type="graft" data-subtype="note_caller" data-new="true" data-previewtext="+"><span class="paragraph usfm f" data-type="paragraph" data-subtype-ns="usfm" data-subtype="f">+</span></span><span class="wrapper usfm span" data-type="wrapper" data-subtype-ns="usfm" data-subtype="ft">${footNote}</span></span></span>`;
    pasteHtmlAtCaret(footnoteTag, false, caretPosition);
  }
}

export function insertXRef(caretPosition, references) {
  if (insertXRef && caretPosition) {
  // const xRefTag = '<span class="graft xref" data-type="graft" data-subtype="xref" data-new="true"><span class="paragraph usfm x" data-type="paragraph" data-subtype-ns="usfm" data-subtype="x"><span class="graft note_caller" data-type="graft" data-subtype="note_caller" data-new="true" data-previewtext="+"><span class="paragraph usfm x" data-type="paragraph" data-subtype-ns="usfm" data-subtype="x">+</span></span><span class="wrapper usfm span" data-type="wrapper" data-subtype-ns="usfm" data-subtype="xt">Mrk 1.24; Luk 2.39; Jhn 1.45.</span></span></span>';
    const xRefTag = `<span class="graft xref" data-type="graft" data-subtype="xref" data-new="true"><span class="paragraph usfm x" data-type="paragraph" data-subtype-ns="usfm" data-subtype="x"><span class="graft note_caller" data-type="graft" data-subtype="note_caller" data-new="true" data-previewtext="+"><span class="paragraph usfm x" data-type="paragraph" data-subtype-ns="usfm" data-subtype="x">+</span></span><span class="wrapper usfm span" data-type="wrapper" data-subtype-ns="usfm" data-subtype="xq"></span><span class="wrapper usfm span" data-type="wrapper" data-subtype-ns="usfm" data-subtype="xt">${references}</span></span></span>`;
    pasteHtmlAtCaret(xRefTag, false, caretPosition);
  }
}

// Helper function to get selected text within the editor
export function getSelectedText() {
  let selectedText = '';
  if (window.getSelection) {
    const selection = window.getSelection();
    selectedText = selection.toString();
  } else if (document.selection && document.selection.type !== 'Control') {
    selectedText = document.selection.createRange().text;
  }
  return selectedText;
}
// Copy text to clipboard
// export function copyText() {
//   const editor = document.getElementById('editor');
//   const selectedText = getSelectedText(editor);

//   if (selectedText !== '') {
//     navigator.clipboard.writeText(selectedText)
//       .then(() => {
//         console.log(`Text copied to clipboard:${ selectedText}`);
//       })
//       .catch((error) => {
//         console.error(`Unable to copy text: ${ error}`);
//       });
//   }
// }

// Paste text from clipboard
// export function pasteText() {
//   const editor = document.getElementById('editor');

//   navigator.clipboard.readText()
//     .then((text) => {
//       editor.focus();
//       document.execCommand('insertText', false, text);
//     })
//     .catch((error) => {
//       console.error(`Unable to paste text: ${ error}`);
//     });
// }
