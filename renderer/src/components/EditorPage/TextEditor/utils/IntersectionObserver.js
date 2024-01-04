export const scrollReference = (chapterNumber) => {
  const refEditors = document.getElementsByClassName('ref-editor');
  refEditors.length > 0 && Array.prototype.filter.call(refEditors, (refEditor) => {
    const editorInView = refEditor.querySelector(`#ch-${chapterNumber}`);
    if (editorInView) {
      editorInView.scrollIntoView();
      editorInView.classList.add('scroll-mt-10');
    }
  });
};

export const onIntersection = ({
 scroll, entries, setChapterNumber, scrollLock, setVerseNumber,
}) => {
  if (scroll) {
    // eslint-disable-next-line no-restricted-syntax
    for (const entry of entries) {
      if (entry.isIntersecting) {
        setChapterNumber(entry.target.dataset.attsNumber);
        setVerseNumber(1);
        scrollLock === false ? scrollReference(entry.target.dataset.attsNumber) : {};
      }
    }
  }
};
