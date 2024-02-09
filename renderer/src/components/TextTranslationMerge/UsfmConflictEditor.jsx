/* eslint-disable no-nested-ternary */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowSmallDownIcon, ArrowSmallUpIcon, ArrowsUpDownIcon, ArrowPathRoundedSquareIcon,
} from '@heroicons/react/20/solid';

function UsfmConflictEditor({
  usfmJsons, currentProjectMeta, selectedChapter, setUsfmJsons,
}) {
  const [resolveAllActive, setResolveALlActive] = useState();
  const [resetAlll, setResetAll] = useState();
  const { t } = useTranslation();

  console.log({
    usfmJsons, currentProjectMeta, selectedChapter,
  });

  const resolveAllTogether = (type) => {
    console.log('resolve all together', type);
  };

  const handleResetSingle = (verseNum) => {
    console.log('hanlde reset single conflcit');
    const currentVerseObj = usfmJsons.mergeJson.chapters.slice(selectedChapter - 1, selectedChapter)[0]
      .contents.find((item) => item?.verseNumber === verseNum);
    currentVerseObj.resolved.status = false;
    currentVerseObj.resolved.resolvedContent = null;
    setUsfmJsons((prev) => ({ ...prev, mergeJson: usfmJsons.mergeJson }));
  };

  const resetAllResolved = () => {
    console.log('reset all conflict ');
  };

  const handleResolveSingle = (type, verseNum) => {
    const currentVerseObj = usfmJsons.mergeJson.chapters.slice(selectedChapter - 1, selectedChapter)[0]
      .contents.find((item) => item?.verseNumber === verseNum);
    let currentData = {};
    if (type === 'current') {
      currentData = { verseText: currentVerseObj.verseText, contents: currentVerseObj.contents, verseNumber: verseNum };
    } else {
      currentData = currentVerseObj.incoming;
    }

    // assign to resolved section
    currentVerseObj.resolved.status = true;
    currentVerseObj.resolved.resolvedContent = currentData;
    setUsfmJsons((prev) => ({ ...prev, mergeJson: usfmJsons.mergeJson }));
  };

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
              className={`${true ? 'px-2.5 py-0.5 bg-black text-white font-semibold tracking-wider text-xs uppercase rounded-xl' : 'hidden'}`}
            >
              {t('label-original')}
            </button>

            <button
              type="button"
              onClick={() => resolveAllTogether('incoming')}
              disabled={resolveAllActive === false}
              title={t('tooltip-merge-all-new-btn')}
              className={`${true ? 'px-2.5 py-0.5 bg-success text-white font-semibold tracking-wider text-xs uppercase rounded-xl' : 'hidden'}`}
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

      {/* --------------------------------------------- testing -------------------------------------------- */}

      <div className="">
        {selectedChapter && usfmJsons.mergeJson
          && usfmJsons?.mergeJson?.chapters?.slice(selectedChapter - 1, selectedChapter)[0].contents.map((item, index) => (
            item.verseNumber
            && (
              <div
                key={item.verseNumber}
                className={`flex gap-2 mb-2 
              ${currentProjectMeta.languages[0].scriptDirection?.toLowerCase() === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <span className="font-medium self-center">{item.verseNumber}</span>
                {/* conflict is / was there */}
                {item?.resolved ? (

                  // conflict resolved section (Data from resolved.resolvedContent)
                  item.resolved.status ? (
                    <div>
                      <div className="flex gap-2 border border-gray-500 w-full p-1 rounded-md relative">
                        <div>{item.resolved.resolvedContent.verseText}</div>
                        <ArrowPathRoundedSquareIcon
                          className="w-6 h-6 bg-gray-300 text-black p-1  rounded-full cursor-pointer "
                          onClick={() => handleResetSingle(item.verseNumber)}
                        />
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
                            {item.verseText}
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
                    <div className="text-gray-600">
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
