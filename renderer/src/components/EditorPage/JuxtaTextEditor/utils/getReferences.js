export const getCurrentVerse = (currentNode) => {
  let currentVerse;
  let prev = currentNode.previousElementSibling;
  while (prev) {
    if (prev.dataset.type === 'mark' && prev.dataset.subtype === 'verses') {
      currentVerse = prev.dataset.attsNumber;
      break;
    }
    // Get the previous sibling
    prev = prev.previousElementSibling;
  }
  return currentVerse;
};

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
