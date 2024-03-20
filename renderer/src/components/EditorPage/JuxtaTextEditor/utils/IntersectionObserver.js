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

export const onIntersection = ({ entries, setChapterNumber, scrollLock }) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const entry of entries) {
    if (entry.isIntersecting) {
      setChapterNumber(entry.target.dataset.attsNumber);
      scrollLock === false ? scrollReference(entry.target.dataset.attsNumber) : {};
    }
  }
};
