export const getCurrentVerse = (currentNode) => {
  let verse;
  let previousElement = currentNode.previousElementSibling;
  const verseText = currentNode.nextSibling;
  while (previousElement) {
    if (previousElement.dataset.type === 'mark' && previousElement.dataset.subtype === 'verses') {
      verse = previousElement.dataset.attsNumber;
      break;
    }
    previousElement = previousElement.previousElementSibling;
  }
  return { verse, verseText };
};

export const removeHighlightFromRefVerse = ({ c, v }) => {
  const refEditors = document.getElementsByClassName('ref-editor');
  refEditors.length > 0 && Array.prototype.filter.call(refEditors, (refEditor) => {
    const prevHighlight = refEditor.querySelector(`#ch${c}v${v}`).nextElementSibling;
    const hightlightText = prevHighlight && prevHighlight.innerHTML;
    prevHighlight && prevHighlight.replaceWith(hightlightText);
  });
};

export const hightlightRefVerse = (() => {
  let prevCV;
  return (c, v) => {
    const refEditors = document.getElementsByClassName('ref-editor');
    refEditors.length > 0 && Array.prototype.filter.call(refEditors, (refEditor) => {
      if (!(prevCV && prevCV.c !== c)) {
        const verseInView = refEditor.querySelector(`#ch${c}v${v}`);
        const { verseText } = getCurrentVerse(verseInView);
        // highlight verse
        const range = document.createRange();
        range.setStart(verseText, 0);
        range.setEnd(verseText, verseText.textContent.length);
        const newSpan = document.createElement('span');
        newSpan.classList.add('bg-primary-50');
        range.surroundContents(newSpan);
        // remove highlight from previous verse
        prevCV && removeHighlightFromRefVerse({ ...prevCV });
      }
    });
    prevCV = { c, v };
  };
})();

export const getCurrentChapter = (currentNode) => {
  let currentChapter;
  const closestParaDiv = currentNode.parentNode.parentNode;
  if (closestParaDiv.firstElementChild?.firstElementChild?.classList.contains('chapter')) {
    currentChapter = closestParaDiv.firstElementChild.firstElementChild.dataset.attsNumber;
    return currentChapter;
  }

  let prevParaDiv = closestParaDiv.previousElementSibling;
  while (prevParaDiv) {
    if (prevParaDiv.firstElementChild?.firstElementChild?.classList.contains('chapter')) {
      currentChapter = prevParaDiv.firstElementChild.firstElementChild.dataset.attsNumber;
      break;
    }
    prevParaDiv = prevParaDiv.previousElementSibling;
  }
  return currentChapter;
};
