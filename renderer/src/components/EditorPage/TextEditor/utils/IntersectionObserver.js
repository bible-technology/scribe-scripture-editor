export const scrollReference = (() => {
  let prevCV;
  return (c, v) => {
    const refEditors = document.getElementsByClassName('ref-editor');
    refEditors.length > 0 && Array.prototype.filter.call(refEditors, (refEditor) => {
      if (!prevCV || prevCV.c !== c) {
        const chapterInView = refEditor.querySelector(`#ch-${c}`);
        if (chapterInView) {
          chapterInView.scrollIntoView();
          chapterInView.classList.add('scroll-mt-10');
        }
      } else if (prevCV && (prevCV.c === c && prevCV.v !== v)) {
        const verseInView = refEditor.querySelector(`#ch${c}v${v}`);
        if (verseInView) {
          verseInView.scrollIntoView();
          verseInView.classList.add('scroll-mt-30');
        }
      }
    });
    prevCV = { c, v };
  };
})();

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
