import PropTypes from 'prop-types';
import { Disclosure, Transition } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import styles from './SelectReference.module.css';

export default function SelectChapter({
  children,
  bookName,
  chapter,
  verse,

  chapterList,
  verseList,
  onChangeChapter,
  onChangeVerse,

  closeBooks,
  // closeVerses,

  closeChapters,
  // setSelectedVerses,

  setChapterNumber,
  setVerseNumber,

  loading,
}) {
  // const [controlVerseSelect, setControlVerseSelect] = useState([]);

  const [openChapter, setOpenChapter] = useState(true);
  const [openVerse, setOpenVerse] = useState(false);
  const { t } = useTranslation();

  const onChapterSelect = (e, chapterNum) => {
    e.preventDefault();
    onChangeChapter(chapterNum, chapter);
    // closeBooks();
    // closeChapters();
    setOpenChapter(false);
    setOpenVerse(true);

    if (chapterNum && setChapterNumber) {
      setChapterNumber(chapterNum);
    }
  };

  const onVerseSelect = (e, verseNum) => {
    e.preventDefault();
    onChangeVerse(verseNum, verse);
    closeBooks();
    closeChapters();
    // if (multiSelectVerse === false) { closeChapters(); }
    if (verseNum && setVerseNumber) {
      // document.getElementById('editor').querySelector(`#ch${chapter}v${verseNum}`)?.scrollIntoView();
      setVerseNumber(verseNum);
    }
  };
  return (
    <>
      <div className="flex flex-row justify-between text-center font-semibold text-xs tracking-wider uppercase">
        <div className="grid grid-cols-2 gap-0 w-full bg-gray-700">
          <div className="px-2 pt-2 bg-primary border-primary border-b-4 cursor-pointer">
            {bookName}
          </div>
          <div className="px-2 pt-2 bg-primary border-primary border-b-4 cursor-pointer">
            {t('label-chapter')}
            :
            {chapter}
          </div>
        </div>
        <div className={`px-2 pt-2 ${openVerse ? 'bg-primary border-primary' : 'hover:bg-gray-600 border-gray-600'} border-b-4 cursor-pointer`}>
          {t('label-verse')}
          : &nbsp;

          {verse}
        </div>
        <div className="flex justify-end">
          {children}
        </div>
      </div>

      <Disclosure>
        {openChapter && (
          <Transition
            show
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Disclosure.Panel className="grid py-5 grid-cols-10 gap-1 text-center bg-black text-white text-xs font-medium tracking-wide uppercase" static>
              {
                !loading
                && chapterList.map((chapter) => (
                  <div
                    key={chapter.key}
                    role="presentation"
                    id={`chapter-${chapter.name}`}
                    onClick={(e) => onChapterSelect(e, chapter.key)}
                    className={styles.select}
                  >
                    {chapter.name}
                  </div>
                ))
              }
            </Disclosure.Panel>
          </Transition>
        )}
      </Disclosure>

      <Disclosure>
        {
          openVerse
          && (
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
                { verseList?.map((verse) => (
                  <div
                    key={verse.key}
                    role="presentation"
                    id={`verse-${verse.name}`}
                    // style={{ color: controlVerseSelect.includes(parseInt(verse.key, 10)) ? 'seagreen' : '' }}
                    onClick={(e) => (
                      onVerseSelect(e, verse.key)
                    )}
                    className={styles.select}
                  >
                    {verse.name}
                  </div>
                ))}
              </Disclosure.Panel>
            </Transition>
          )
        }
      </Disclosure>
    </>
  );
}

SelectChapter.propTypes = {
  children: PropTypes.any,
  bookName: PropTypes.string,
  chapter: PropTypes.string,
  chapterList: PropTypes.array,
  verseList: PropTypes.array,
  onChangeChapter: PropTypes.func,
  closeBooks: PropTypes.func,
  closeChapters: PropTypes.func,
  setChapterNumber: PropTypes.func,
  setVerseNumber: PropTypes.func,
  loading: PropTypes.bool,
};
