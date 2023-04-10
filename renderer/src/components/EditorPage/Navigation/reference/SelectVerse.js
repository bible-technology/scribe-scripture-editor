import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Disclosure, Transition } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import { convertToRange } from '@/util/convertToRange';
import styles from './SelectReference.module.css';

export default function SelectVerse({
  children,
  bookName,
  chapter,
  verse,
  chapterList,
  verseList,
  onChangeChapter,
  onChangeVerse,
  closeBooks,
  closeVerses,
  multiSelectVerse,
  selectedVerses,
  setSelectedVerses,
  verselectActive,
  setVerseSelectActive,
  setChapterNumber,
  setVerseNumber,
}) {
  const [controlVerseSelect, setControlVerseSelect] = useState([]);
  const [openChapter, setOpenChapter] = useState(true);
  const [openVerse, setOpenVerse] = useState(false);
  const { t } = useTranslation();

  const onChapterSelect = (e, chapterNum) => {
    e.preventDefault();
    onChangeChapter(chapterNum, chapter);
    setOpenChapter(false);
    setOpenVerse(true);
    window.location.href = `#ch-${chapterNum}`;
    if (chapterNum && setChapterNumber) {
      setChapterNumber(chapterNum);
      document.getElementById('editor').querySelector(`#ch-${chapterNum}`)?.scrollIntoView();
    }
  };

  const onVerseSelect = (e, verseNum) => {
    e.preventDefault();
    onChangeVerse(verseNum, verse);
    closeBooks();
    if (multiSelectVerse === false) { closeVerses(); }
    if (verseNum && setVerseNumber) {
      document.getElementById('editor').querySelector(`#ch${chapter}v${verseNum}`)?.scrollIntoView();
      setVerseNumber(verseNum);
    }
     // window.location.href = `#ch${chapter}v${verseNum}`;
    // document.getElementById(`ch${chapter}v${verseNum}`).scrollIntoView();
  };

  const onMultiSelectVerse = async (e, verses) => {
    e.preventDefault();
    if (controlVerseSelect.includes(parseInt(verses, 10)) === false && verses) {
      const temp = [...controlVerseSelect];
      temp.push(parseInt(verses, 10));
      selectedVerses.push(parseInt(verses, 10));
      setControlVerseSelect(temp);
    }
  };

  useEffect(() => {
    const converMultiverseRange = async () => {
      if (multiSelectVerse && verselectActive) {
        const result = await convertToRange(selectedVerses);
        setSelectedVerses(result);
        setVerseSelectActive(false);
      }
    };
    converMultiverseRange();
  }, [verselectActive, multiSelectVerse, selectedVerses, setVerseSelectActive, setSelectedVerses]);

  return (
    <>
      <div className="flex flex-row justify-between text-center font-semibold text-xs tracking-wider uppercase">
        <div className="grid grid-cols-3 gap-0 w-full bg-gray-700">
          <div className={`px-2 pt-2 ${openVerse ? 'bg-black border-black' : 'bg-primary border-primary'} hover:bg-primary hover:border-primary border-b-4 cursor-pointer`}>
            {bookName}
          </div>
          <div className={`px-2 pt-2 ${openVerse ? 'hover:bg-gray-600 border-gray-600' : 'bg-primary border-primary'} border-b-4 cursor-pointer`}>
            {t('label-chapter')}
            : &nbsp;
            {chapter}
          </div>
          <div className={`px-2 pt-2 ${openVerse ? 'bg-primary border-primary' : 'hover:bg-gray-600 border-gray-600'} border-b-4 cursor-pointer`}>
            {t('label-verse')}
            : &nbsp;
            {multiSelectVerse
              ? controlVerseSelect.join()
              : verse}
          </div>
        </div>
        <div className="flex justify-end">
          {children}
        </div>
      </div>

      <Disclosure>
        {openChapter && (
          <Transition
            show={openChapter}
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Disclosure.Panel className="grid py-5 grid-cols-10 gap-1 text-center bg-black text-white text-xs font-medium tracking-wide uppercase" static>
              {chapterList.map((chapter) => (
                <div
                  key={chapter.key}
                  role="presentation"
                  onClick={(e) => { onChapterSelect(e, chapter.key); }}
                  className={styles.select}
                >
                  {chapter.name}
                </div>
              ))}
            </Disclosure.Panel>
          </Transition>

        )}
      </Disclosure>

      <Disclosure>
        {openVerse && (
          <Transition
            show={openVerse}
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Disclosure.Panel className="grid py-5 grid-cols-10 gap-1 text-center bg-black text-white text-xs font-medium tracking-wide uppercase">
              {verseList.map((verse) => (
                <div
                  key={verse.key}
                  role="presentation"
                  style={{ color: controlVerseSelect.includes(parseInt(verse.key, 10)) ? 'seagreen' : '' }}
                  onClick={(e) => (
                    multiSelectVerse
                      ? onMultiSelectVerse(e, verse.key)
                      : onVerseSelect(e, verse.key)
                  )}
                  className={styles.select}
                >
                  {verse.name}
                </div>
              ))}
            </Disclosure.Panel>
          </Transition>
        )}
      </Disclosure>
    </>

  );
}

SelectVerse.propTypes = {
  children: PropTypes.any,
  bookName: PropTypes.string,
  chapter: PropTypes.string,
  verse: PropTypes.string,
  chapterList: PropTypes.array,
  verseList: PropTypes.array,
  onChangeChapter: PropTypes.func,
  onChangeVerse: PropTypes.func,
  closeBooks: PropTypes.func,
  closeVerses: PropTypes.func,
  multiSelectVerse: PropTypes.bool,
  selectedVerses: PropTypes.array,
  setSelectedVerses: PropTypes.func,
  verselectActive: PropTypes.bool,
  setVerseSelectActive: PropTypes.func,
};
