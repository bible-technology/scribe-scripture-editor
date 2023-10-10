import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import { ProjectContext } from '@/components/context/ProjectContext';

export default function Bookmarks() {
  const {
    state: {
      bookmarksVerses,
      bookList,
      chapter,
      bookName,
    },
    actions: {
      onChangeBook,
      onChangeChapter,
      onChangeVerse,
      setIsLoading,
    },
  } = useContext(ReferenceContext);

  const {
    actions: {
      setOpenSideBar,
    },
  } = useContext(ProjectContext);

  // const [tempChapter, setTempChapter] = useState(chapter);

  // eslint-disable-next-line no-promise-executor-return
  const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const { t } = useTranslation();
  const gotoChapter = (
    bookname,
    chapterNum,
  ) => {
    setOpenSideBar(false);
    setIsLoading(true);
    timeout(2000).then(async () => {
      bookList.forEach(async (book) => {
          if (bookname === book.name) {
            if (bookName !== book.key) {
                onChangeBook(book.key);
            }
            if (chapter !== chapterNum) {
              onChangeChapter(chapterNum);
            }
            onChangeVerse('1');
          }
      });
    }).finally(() => setIsLoading(false));
  };

  return (
    <>
      <div className="bg-gray-800 uppercase text-white text-xs p-2 tracking-wider">
        {t('label-bookmarks')}
      </div>
      <div className="overflow-y-auto h-full no-scrollbars">
        {bookmarksVerses.map((bookmark) => (
          <div
            role="button"
            tabIndex="0"
            onClick={() => { gotoChapter(bookmark.bookname, bookmark.chapter); }}
            aria-label={`${bookmark.bookname}-${bookmark.chapter}`}
            key={bookmark.bookname + bookmark.chapter}
            className="flex justify-between items-center hover:bg-gray-400 bg-gray-200 p-2 pr-5 text-sm font-semibold tracking-wider border-b border-gray-300 shadow-sm"
          >
            {bookmark.bookname}
            {' '}
            {bookmark.chapter}
          </div>
        ))}
      </div>
    </>
  );
}
