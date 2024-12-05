import { useEffect, useState, useContext } from 'react';
import { Modal } from '@mui/material';
import { ProjectContext } from '@/components/context/ProjectContext';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import SelectBook from '@/components/EditorPage/Navigation/reference/SelectBook';
import { useBibleReference } from 'bible-reference-rcl';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import Layout from '../../../../../../public/icons/basil/Solid/Interface/Layout.svg';
import { TextOnlyTooltip, LoopSwitch } from '../fieldPicker/customMuiComponent';
import { BookList } from '../BookList';

export function JXLHeaderWrapper({
  keyWrapper,
  advanceMode,
  changePrintData,
  setLoopMode,
  loopMode,
}) {
  // Start get all book from current project
  // const initialBook = 'mat';
  const initialChapter = '1';
  const initialVerse = '1';

  const { t } = useTranslation();
  const {
    state: {
      bookId,
    },
  } = useContext(ReferenceContext);

  const {
    state: { bookList },
  } = useBibleReference({
    initialBook: bookId,
    initialChapter,
    initialVerse,
  });
  const {
    states: { canonList },
  } = useContext(ProjectContext);
  // end get all book from current project
  const [selectedBooks, setSelectedBooks] = useState(bookId ? [bookId.toUpperCase()] : []);
  const [openModalBook, setOpenModalBook] = useState(false);

  useEffect(() => {
    changePrintData((prev) => {
      const copyData = { ...prev };
      copyData[keyWrapper].ranges = [];
      copyData[keyWrapper].ranges = selectedBooks;
      return copyData;
    });
  }, [selectedBooks.length]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'end' }}>
        {advanceMode ? (
          <div>
            <TextOnlyTooltip
              placement="top-end"
              title={(
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontStyle: 'normal',
                      fontWeight: 600,
                    }}
                  >
                    Loop mode
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontStyle: 'normal',
                      fontWeight: 400,
                    }}
                  >
                    Projects in the loop are added one by one to the document,
                    for each book selected below.
                  </div>
                </div>
              )}
              arrow
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'black',
                }}
              >
                Loop mode
              </div>
              <LoopSwitch
                defaultChecked={loopMode}
                onChange={() => setLoopMode((prev) => !prev)}
              />
            </TextOnlyTooltip>
          </div>
        ) : (
          <div />
        )}
        <div
          style={{
            margin: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: 24,
            color: 'black',
          }}
        >
          <div style={{ width: 25, height: 25, marginRight: 8 }}>
            <Layout />
          </div>
          Translation
        </div>
      </div>

      <div className="py-5 flex flex-wrap gap-3 uppercase text-sm font-medium ">
        <div
          className={
            selectedBooks.length
            === canonList[0].currentScope.length
              ? 'bg-primary hover:bg-secondary text-white px-3 py-1 rounded-full cursor-pointer whitespace-nowrap'
              : 'bg-gray-200 hover:bg-primary hover:text-white px-3 py-1 rounded-full cursor-pointer whitespace-nowrap'
          }
          onClick={() => {
            setSelectedBooks((prev) => {
              let table = [...prev];
              const newTable = canonList[0].currentScope;
              for (let i = 0; i < newTable.length; i++) {
                if (table.includes(newTable[i])) {
                  table = table.filter((item) => item !== newTable[i]);
                } else {
                  table.push(newTable[i]);
                }
              }
              return table;
            });
          }}
          role="button"
          tabIndex="0"
        >
          {t('label-all')}
        </div>
        <div
          className={
            selectedBooks.sort().toString()
            === canonList[1].currentScope.sort().toString()
              ? 'bg-primary hover:bg-secondary text-white px-3 py-1 rounded-full cursor-pointer whitespace-nowrap'
              : 'bg-gray-200 hover:bg-primary hover:text-white px-3 py-1 rounded-full cursor-pointer whitespace-nowrap'
          }
          onClick={() => {
            setSelectedBooks((prev) => {
              let table = [...prev];
              const newTable = canonList[1].currentScope;
              for (let i = 0; i < newTable.length; i++) {
                if (table.includes(newTable[i])) {
                  table = table.filter((item) => item !== newTable[i]);
                } else {
                  table.push(newTable[i]);
                }
              }
              return table;
            });
          }}
          role="button"
          aria-label="old-testament"
          tabIndex="0"
        >
          {`${t('label-old-testament')} (OT)`}
        </div>
        <div
          className={
            selectedBooks.sort().toString()
            === canonList[2].currentScope.sort().toString()
              ? 'bg-primary hover:bg-secondary text-white px-3 py-1 rounded-full cursor-pointer whitespace-nowrap'
              : 'bg-gray-200 hover:bg-primary hover:text-white px-3 py-1 rounded-full cursor-pointer whitespace-nowrap'
          }
          onClick={() => {
            setSelectedBooks((prev) => {
              let table = [...prev];
              const newTable = canonList[2].currentScope;
              for (let i = 0; i < newTable.length; i++) {
                if (table.includes(newTable[i])) {
                  table = table.filter((item) => item !== newTable[i]);
                } else {
                  table.push(newTable[i]);
                }
              }
              return table;
            });
          }}
          role="button"
          aria-label="new-testament"
          tabIndex="0"
        >
          {`${t('label-new-testament')} (NT)`}
        </div>
        <div
          className={
            selectedBooks.length > 0
            && selectedBooks.length
              < canonList[0].currentScope.length
            && selectedBooks.sort().toString()
              !== canonList[2].currentScope.sort().toString()
            && selectedBooks.sort().toString()
              !== canonList[1].currentScope.sort().toString()
              ? 'bg-primary hover:bg-secondary text-white px-3 py-1 rounded-full cursor-pointer whitespace-nowrap'
              : 'bg-gray-200 hover:bg-primary hover:text-white px-3 py-1 rounded-full cursor-pointer whitespace-nowrap'
          }
          onClick={() => setOpenModalBook(true)}
          role="button"
          tabIndex="0"
          aria-label="custom-book"
        >
          {t('label-custom')}
        </div>
      </div>
      <BookList books={selectedBooks ?? []} />
      <br />

      <Modal
        open={openModalBook}
        onClose={() => setOpenModalBook(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
        }}
      >
        <div style={{ height: '100%', width: '100%' }}>
          <div className="flex items-center justify-center h-screen ">
            <div className="w-9/12 m-auto z-50 bg-white shadow overflow-hidden sm:rounded-lg">
              <SelectBook
                bookList={bookList}
                multiSelectBook
                selectedBooks={selectedBooks}
                setSelectedBooks={setSelectedBooks}
                scope="Other"
              >
                <button
                  type="button"
                  className="w-9 h-9 bg-black p-2"
                  aria-label="close-custombiblenavigation"
                  onClick={() => setOpenModalBook(false)}
                >
                  <XMarkIcon />
                </button>
              </SelectBook>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
