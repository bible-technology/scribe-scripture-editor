// import { Cog8ToothIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

function TranslationMergNavBar({
  conflictedBooks, selectedBook, setSelectedBook, resolvedBooks, disableSelection, conflictedChapters, selectedChapter, setSelectedChapter,
}) {
  const { t } = useTranslation();
  return (
    <div className="bg-white border-2 rounded-md border-black h-[78vh] overflow-hidden ">
      <div className="flex items-center justify-between bg-black py-1.5 px-2.5">

        <span className="px-2.5 py-0.5 bg-primary text-white font-medium tracking-wider text-xs uppercase rounded-xl">
          Books :
          {' '}
          {`${conflictedBooks?.length} `}
        </span>
        {/* <Cog8ToothIcon className="w-5 h-5 text-white" /> */}
      </div>

      <div className="h-full overflow-auto ">
        <ul className="text-black text-xs py-2.5">
          {conflictedBooks?.map((book) => {
            const bookId = book.split('/');
            return (
              <li
                key={book}
                // className="w-full"
                className={`w-full py-2 mb-4 ${resolvedBooks.includes(book)
                  ? 'pointer-events-none'
                  : `${selectedBook === book ? 'bg-primary/70' : 'hover:bg-primary cursor-pointer'}`} `}

              // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
              >
                <button
                  type="button"
                  onClick={() => { setSelectedBook(book); setSelectedChapter(); }}
                  aria-disabled={disableSelection}
                  className="w-full text-center"

                >
                  <span className={`${resolvedBooks.includes(book) && 'line-through decoration-2'}`}>{bookId[1]}</span>

                </button>
                {/* chapter selection */}
                {selectedBook === book && !resolvedBooks.includes(book) && (

                  <div className="bg-white w-[95%] mx-auto my-2 grid grid-cols-3 gap-2 border border-gray-400 rounded-md min-h-[50px] p-2">
                    {conflictedChapters?.map((chNo) => (
                      <button
                        key={chNo}
                        type="button"
                        className={`p-2 border rounded-md ${selectedChapter === chNo ? 'bg-primary/70' : 'hover:bg-primary cursor-pointer'}`}
                        onClick={() => setSelectedChapter(chNo)}
                      >
                        {chNo}
                      </button>
                    ))}
                  </div>
                )}

              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default TranslationMergNavBar;
