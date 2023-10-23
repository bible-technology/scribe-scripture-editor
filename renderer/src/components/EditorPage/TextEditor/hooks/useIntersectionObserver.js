import { useEffect } from 'react';

export const useIntersectionObserver = (scrollLock, setChapterNumber) => {
 useEffect(() => {
  console.log('scroll ');
    const options = {
      root: document.querySelector('editor'),
      threshold: 0,
      rootMargin: '0% 0% -60% 0%',
    };
    const scrollReference = (chapterNumber) => {
      const refEditors = document.getElementsByClassName('ref-editor');
      refEditors.length > 0 && Array.prototype.filter.call(refEditors, (refEditor) => {
        const editorInView = refEditor.querySelector(`#ch-${chapterNumber}`);
        if (editorInView) {
          editorInView.scrollIntoView();
          editorInView.classList.add('scroll-mt-10');
        }
      });
    };

    const observer = new IntersectionObserver((entries) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setChapterNumber(entry.target.dataset.attsNumber);
          if (!scrollLock) {
            scrollReference(entry.target.dataset.attsNumber);
          }
        }
      }
    }, options);

    const watchNodes = document.querySelectorAll('.editor .chapter');
    const watchArr = Array.from(watchNodes);
    const reverseArray = watchArr.length > 0 ? watchArr.slice().reverse() : [];
    reverseArray.forEach((chapter) => {
      observer.observe(chapter);
    });

    return () => {
      // Cleanup: Disconnect the observer when the component unmounts
      observer.disconnect();
    };
  }, []);
};
