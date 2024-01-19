/* eslint-disable no-nested-ternary */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DiffMatchPatch from 'diff-match-patch';

const dmp = new DiffMatchPatch();
function UsfmConflictEditor({ usfmJsons, currentProjectMeta, selectedChapter }) {
  console.log({ usfmJsons, currentProjectMeta, selectedChapter });
  const [currentChapterVerses, setCurrentChapterVerses] = useState();
  const [importedChapterVerses, setImportedChapterVerses] = useState();
  const [haveConflict, setHaveConflict] = useState([]);
  const [resolveAllActive, setResolveALlActive] = useState();
  const [resetAlll, setResetAll] = useState();
  const { t } = useTranslation();

  const resolveAllTogether = (data, type) => {
    console.log('resolve all together');
  };

  const handleResetSingle = (data, index) => {
    console.log('hanlde reset single conflcit');
  };

  const resetAllResolved = () => {
    console.log('reset all conflict ');
  };
  const displayContent = (selectedChapter) => {
    const currentContent = usfmJsons.current.chapters;
    const importContent = usfmJsons.imported.chapters;
    // console.log(currentContent);
    const currentVerses = currentContent.map((value) => {
      if (value.chapterNumber === selectedChapter) {
        const verses = value.contents.filter((item) => item?.verseNumber);
        console.log(verses);
        return verses;
      }
    });
    const currentValue = currentVerses.filter((item) => item)[0];
    const importedVerses = importContent.map((value) => {
      if (value.chapterNumber === selectedChapter) {
        const verses = value.contents.filter((item) => item?.verseNumber);
        console.log(verses);
        return verses;
      }
    });
    const importedValue = importedVerses.filter((item) => item)[0];
    const conflicts = [];
    currentValue?.map((current, index) => {
      if (current.verseNumber === (importedValue && importedValue[index].verseNumber)) {
        // const diffOut = dmp.diff_main(current.verseText, importedValue[index].verseText);
        // console.log(diffOut);
        if (current.verseText !== importedValue[index].verseText) {
          conflicts.push(current.verseNumber);
        }
      }
    });
    console.log(currentValue, importedValue);
    console.log({ conflicts });
    setHaveConflict(conflicts);
    setCurrentChapterVerses(currentValue);
    setImportedChapterVerses(importedValue);
  };

  // const findDifference =(selectedChapter)=>{

  // }
  useEffect(() => {
    if (selectedChapter) {
      displayContent(selectedChapter);
      // findDifference(selectedChapter)
    }
  }, [selectedChapter]);
  return (
    <div className="bg-white flex-1 border-2 border-gray-100 rounded-md ">
      {/* Header and Buttons */}
      <div className="flex justify-between bg-gray-100 border border-gray-100 ">
        <div className="flex w-full justify-between">
          <div className="flex py-1.5 px-1 gap-2.5">
            <span className="px-2.5 py-0.5 text-black font-semibold tracking-wider text-xs uppercase rounded-xl">{t('label-comparison')}</span>
          </div>
          <div className="flex py-1.5 px-1 gap-2.5 pr-2">
            <button
              type="button"
              onClick={() => resolveAllTogether('selectedFileContent', 'current')}
              disabled={resolveAllActive === false}
              title={t('tooltip-merge-all-orginal-btn')}
              className={`${resolveAllActive ? 'px-2.5 py-0.5 bg-black text-white font-semibold tracking-wider text-xs uppercase rounded-xl' : 'hidden'}`}
            >
              {t('label-original')}
            </button>

            <button
              type="button"
              onClick={() => resolveAllTogether('selectedFileContent', 'incoming')}
              disabled={resolveAllActive === false}
              title={t('tooltip-merge-all-new-btn')}
              className={`${resolveAllActive ? 'px-2.5 py-0.5 bg-success text-white font-semibold tracking-wider text-xs uppercase rounded-xl' : 'hidden'}`}
            >
              {t('label-new')}

            </button>

            <button
              type="button"
              onClick={() => resolveAllTogether('selectedFileContent', 'both')}
              disabled={resolveAllActive === false}
              title={t('tooltip-merge-all-both-btn')}
              className={`${resolveAllActive ? 'px-2.5 py-0.5 bg-blue-500 text-white font-semibold tracking-wider text-xs uppercase rounded-xl' : 'hidden'}`}
            >
              {t('label-both')}

            </button>

            <button
              type="button"
              onClick={() => resetAllResolved()}
              disabled={resetAlll === false}
              title={t('tooltip-merge-all-reset-btn')}
              className={`px-2.5 py-0.5 bg-gray-300  font-semibold tracking-wider text-xs uppercase rounded-xl ${resetAlll ? 'text-black' : 'text-gray-400'}`}
            >
              {t('label-reset')}

            </button>

          </div>
        </div>
        {/* <div className="bg-black flex items-center px-2 rounded-tr-md">
          <Cog8ToothIcon className="w-5 h-5 text-white" />
        </div> */}
      </div>

      {/* Content */}
      <div className="divide-y divide-gray-100 max-h-[71vh] overflow-y-scroll scrollbars-width">
        <div>
          {currentChapterVerses?.map((verse, index) => (
            <div key={verse.verseNumber} className={`${haveConflict.includes(verse.verseNumber) && 'border border-green-500'}`}>
              <p>{verse.verseNumber}</p>
              <div className="flex gap-2">
                <div className="flex-1">
                  {verse.contents?.map((data, index) => (
                    <p key={index}>
                      {/* {console.log(typeof data === 'string' ? data : JSON.stringify(data.s5) || JSON.stringify(data.p))} */}
                      {typeof data === 'string' ? data : JSON.stringify(data.s5) || JSON.stringify(data.p)}
                    </p>
                ))}
                </div>
                <div className="flex-1">
                  {importedChapterVerses && importedChapterVerses[index].contents?.map((data, index) => (
                    <p key={index}>
                      {/* {console.log(typeof data === 'string' ? data : JSON.stringify(data.s5) || JSON.stringify(data.p))} */}
                      {typeof data === 'string' ? data : JSON.stringify(data.s5) || JSON.stringify(data.p)}
                    </p>
                  ))}
                </div>
              </div>
            </div>
        ))}
        </div>
        {/* <div>
          {importedChapterVerses?.map((verse) => (
            <>
              <p key={verse.verseNumber}>{verse.verseNumber}</p>
              {verse.contents?.map((data, index) => (
                <p key={index}>
                  {console.log(typeof data === 'string' ? data : JSON.stringify(data.s5) || JSON.stringify(data.p))}
                  {typeof data === 'string' ? data : JSON.stringify(data.s5) || JSON.stringify(data.p)}
                </p>
          ))}
            </>
        ))}
        </div> */}
        {/* {selectedFileContent.map((content, index) => (
          <div
            key={content.id}
            className={`flex px-2 py-6 gap-4
            ${currentProjectMeta?.languages[0].scriptDirection?.toLowerCase() === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}
          >

            <div
              className=" w-full"
              style={{
                direction: `${currentProjectMeta.data.incomingMeta.languages[0].scriptDirection?.toLowerCase() === 'rtl' ? 'rtl' : 'auto'}`,
              }}
            >
              ggg
              <ConflictSection
                text={
                  content?.title
                  || content?.text
                  || content?.end
                }
                index={index}
                setSelectedFileContent={setSelectedFileContent}
                selectedFileContent={selectedFileContent}
                handleResetSingle={handleResetSingle}
                resolvedFileNames={resolvedFileNames}
                selectedFileName={selectedFileName}
              />
            </div>

          </div>
        ))} */}
      </div>
    </div>
  );
}

export default UsfmConflictEditor;
