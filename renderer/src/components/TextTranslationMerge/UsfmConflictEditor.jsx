/* eslint-disable no-nested-ternary */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowSmallDownIcon, ArrowSmallUpIcon, ArrowsUpDownIcon, ArrowPathRoundedSquareIcon,
} from '@heroicons/react/20/solid';

function UsfmConflictEditor({
  usfmJsons, currentProjectMeta, selectedChapter, setUsfmJsons, setChapterResolveDone, resolvedChapters, selectedBook, resolvedBooks, conflictedChapters,
}) {
  const [resolveAllActive, setResolveALlActive] = useState(true);
  const [resetAlll, setResetAll] = useState(false);
  const { t } = useTranslation();

  console.log({
    usfmJsons, currentProjectMeta, selectedChapter,
  });

  const resolveAllTogether = (type) => {
    usfmJsons[selectedBook].mergeJson.chapters.slice(selectedChapter - 1, selectedChapter)[0]
      .contents.forEach((verseObj) => {
        if (verseObj?.resolved?.status === false) {
          let currentData = {};
          if (type === 'current') {
            currentData = { verseText: verseObj.verseText, contents: verseObj.contents, verseNumber: verseObj.verseNumber };
          } else {
            currentData = verseObj.incoming;
          }

          // assign to resolved section
          verseObj.resolved.status = true;
          verseObj.resolved.resolvedContent = currentData;
          // set the current data to the verse => contents and verse => verseText
          verseObj.contents = currentData.contents;
          verseObj.verseText = currentData.verseText;
        }
      });
    setUsfmJsons((prev) => ({ ...prev, [selectedBook]: { ...prev[selectedBook], mergeJson: usfmJsons[selectedBook].mergeJson } }));
    setResolveALlActive(false);
    setResetAll(true);
  };

  const handleResetSingle = (verseNum) => {
    const currentVerseObj = usfmJsons[selectedBook].mergeJson.chapters.slice(selectedChapter - 1, selectedChapter)[0]
      .contents.find((item) => item?.verseNumber === verseNum);
    currentVerseObj.resolved.status = false;
    currentVerseObj.resolved.resolvedContent = null;
    // reset the default contents and verseText with current data
    currentVerseObj.contents = currentVerseObj.current.contents;
    currentVerseObj.verseText = currentVerseObj.current.verseText;
    setUsfmJsons((prev) => ({ ...prev, [selectedBook]: { ...prev[selectedBook], mergeJson: usfmJsons[selectedBook].mergeJson } }));
    setResolveALlActive(true);
    setResetAll(false);
    setChapterResolveDone(false);
  };

  const resetAllResolved = () => {
    usfmJsons[selectedBook].mergeJson.chapters.slice(selectedChapter - 1, selectedChapter)[0]
      .contents.forEach((verseObj) => {
        if (verseObj?.resolved?.status === true) {
          verseObj.resolved.status = false;
          verseObj.resolved.resolvedContent = null;
          // reset the default contents and verseText with current data
          verseObj.contents = verseObj.current.contents;
          verseObj.verseText = verseObj.current.verseText;
        }
      });
    setUsfmJsons((prev) => ({ ...prev, [selectedBook]: { ...prev[selectedBook], mergeJson: usfmJsons[selectedBook].mergeJson } }));
    setResolveALlActive(true);
    setResetAll(false);
    setChapterResolveDone(false);
  };

  const handleResolveSingle = (type, verseNum) => {
    const currentVerseObj = usfmJsons[selectedBook].mergeJson.chapters.slice(selectedChapter - 1, selectedChapter)[0]
      .contents.find((item) => item?.verseNumber === verseNum);
    let currentData = {};
    if (type === 'current') {
      // INFO: the the resolved data is now storing in contents and verseText , which can be used to USFM generation easily
      currentData = { verseText: currentVerseObj.verseText, contents: currentVerseObj.contents, verseNumber: verseNum };
      // the content & verse text by default have the current content
    } else {
      currentData = currentVerseObj.incoming;
    }

    // assign to resolved section
    currentVerseObj.resolved.status = true;
    currentVerseObj.resolved.resolvedContent = currentData;
    // set the current data to the verse => contents and verse => verseText
    currentVerseObj.contents = currentData.contents;
    currentVerseObj.verseText = currentData.verseText;
    setUsfmJsons((prev) => ({ ...prev, [selectedBook]: { ...prev[selectedBook], mergeJson: usfmJsons[selectedBook].mergeJson } }));
  };

  useEffect(() => {
    // check all resolved in the current ch
    let resolvedStatus = false;
    for (let index = 0; index < usfmJsons[selectedBook].mergeJson.chapters.slice(selectedChapter - 1, selectedChapter)[0].contents.length; index++) {
      const verseObj = usfmJsons[selectedBook].mergeJson.chapters.slice(selectedChapter - 1, selectedChapter)[0].contents[index];
      if (verseObj?.resolved && verseObj?.resolved?.status === false) {
        resolvedStatus = false;
        setChapterResolveDone(false);
        setResetAll(false);
        setResolveALlActive(true);
        break;
      } else {
        resolvedStatus = true;
      }
    }
    if (resolvedStatus) {
      setChapterResolveDone(true);
      setResetAll(true);
      setResolveALlActive(false);
    }
  }, [usfmJsons, selectedChapter]);

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
              onClick={() => resolveAllTogether('current')}
              disabled={resolveAllActive === false}
              title={t('tooltip-merge-all-orginal-btn')}
              className={`${resolveAllActive ? 'px-2.5 py-0.5 bg-black text-white font-semibold tracking-wider text-xs uppercase rounded-xl' : 'hidden'}`}
            >
              {t('label-original')}
            </button>

            <button
              type="button"
              onClick={() => resolveAllTogether('incoming')}
              disabled={resolveAllActive === false}
              title={t('tooltip-merge-all-new-btn')}
              className={`${resolveAllActive ? 'px-2.5 py-0.5 bg-success text-white font-semibold tracking-wider text-xs uppercase rounded-xl' : 'hidden'}`}
            >
              {t('label-new')}

            </button>

            {/* <button
              type="button"
              onClick={() => resolveAllTogether('both')}
              disabled={resolveAllActive === false}
              title={t('tooltip-merge-all-both-btn')}
              className={`${resolveAllActive ? 'px-2.5 py-0.5 bg-blue-500 text-white font-semibold tracking-wider text-xs uppercase rounded-xl' : 'hidden'}`}
            >
              {t('label-both')}

            </button> */}

            <button
              type="button"
              onClick={() => resetAllResolved()}
              disabled={resetAlll === false || !conflictedChapters?.includes(selectedChapter)}
              title={t('tooltip-merge-all-reset-btn')}
              className={`px-2.5 py-0.5 bg-gray-300  font-semibold tracking-wider text-xs uppercase rounded-xl ${(conflictedChapters?.includes(selectedChapter) && resetAlll) ? 'text-black' : 'text-gray-400'}`}
            >
              {t('label-reset')}
            </button>

          </div>
        </div>
        {/* <div className="bg-black flex items-center px-2 rounded-tr-md">
          <Cog8ToothIcon className="w-5 h-5 text-white" />
        </div> */}
      </div>

      {/* --------------------------------------------- testing -------------------------------------------- */}

      <div className="">
        {selectedChapter && usfmJsons[selectedBook].mergeJson
          && usfmJsons[selectedBook]?.mergeJson?.chapters?.slice(selectedChapter - 1, selectedChapter)[0].contents.map((item, index) => (
            item.verseNumber
            && (
              <div
                key={item.verseNumber}
                className={`flex gap-2 mb-2 
              ${currentProjectMeta.languages[0].scriptDirection?.toLowerCase() === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <span className="font-medium self-center">{item.verseNumber}</span>
                {/* conflict is / was there */}
                {(item?.resolved) ? (

                  // conflict resolved section (Data from resolved.resolvedContent)
                  item.resolved.status ? (
                    <div>
                      <div className="flex gap-2 border border-gray-500 w-full p-1 rounded-md relative">
                        {/* <div>{item.resolved.resolvedContent.verseText}</div> */}
                        <div>{item.verseText}</div>
                        {conflictedChapters?.includes(selectedChapter) && (
                          <ArrowPathRoundedSquareIcon
                            className="w-6 h-6 bg-gray-300 text-black p-1  rounded-full cursor-pointer "
                            onClick={() => handleResetSingle(item.verseNumber)}
                          />
                        )}
                      </div>
                    </div>
                  )
                    : (
                      // conflict Exist Show Both data
                      <div className="flex px-2 gap-4 min-h-[6rem]">
                        <div className="flex flex-col gap-2  w-full p-1 rounded-md ">
                          <div
                            title="Click to accept current change"
                            role="button"
                            tabIndex={-1}
                            className=" p-1"
                          // onClick={() => handleResolveSingle('current', item.verseNumber)}
                          >
                            {item.current.verseText}
                          </div>
                          <div
                            title="Click to accept incoming change"
                            role="button"
                            tabIndex={-1}
                            className=" p-1 text-success"
                          // onClick={() => handleResolveSingle('incoming', item.verseNumber)}
                          >
                            {item.incoming.verseText}
                          </div>
                        </div>

                        <div className="flex flex-col justify-around self-stretch">
                          {/* current */}
                          <div
                            role="button"
                            tabIndex={-1}
                            onClick={() => handleResolveSingle('current', item.verseNumber)}
                            // onMouseEnter={() => setHoveredId('current')}
                            // onMouseLeave={() => setHoveredId('')}
                            title={t('tooltip-merge-orginal-btn')}
                            className="bg-black w-6 h-6 rounded-full flex justify-center items-center"
                          >
                            <ArrowSmallUpIcon className="w-4 h-4 text-white " />
                          </div>
                          {/* Both */}
                          {/* <div
                            role="button"
                            tabIndex={-2}
                            onClick={() => { }}
                            onMouseEnter={() => setHoveredId('both')}
                            onMouseLeave={() => setHoveredId('')}
                            title={t('tooltip-merge-both-btn')}
                            className="bg-blue-500 w-6 h-6 rounded-full flex justify-center items-center"
                          >
                            <ArrowsUpDownIcon className="w-4 h-4 text-white" />
                          </div> */}
                          {/* Incoming */}
                          <div
                            role="button"
                            tabIndex={-3}
                            onClick={() => handleResolveSingle('incoming', item.verseNumber)}
                            // onMouseEnter={() => setHoveredId('incoming')}
                            // onMouseLeave={() => setHoveredId('')}
                            title={t('tooltip-merge-new-btn')}
                            className="bg-success w-6 h-6 rounded-full flex justify-center items-center"
                          >
                            <ArrowSmallDownIcon className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      </div>
                    )
                )
                  : (
                    <div className="text-gray-400">
                      {item.verseText}
                    </div>
                  )}
              </div>
            )
          ))}
      </div>

    </div>
  );
}

export default UsfmConflictEditor;
