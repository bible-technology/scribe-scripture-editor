/* eslint-disable no-nested-ternary */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const DisplayTagObj = ({ tagObj }) => (

  typeof tagObj === 'string' ? (<p>{tagObj}</p>)
    : (
      Object.entries(tagObj).map(([tag, value, index]) => (
        <p key={index} data-tag={tag}>
          <span className="text-gray-500">{tag}</span>
          {' '}
          <span>{Array.isArray(value) ? value.map((v, index) => <DisplayTagObj key={index} tagObj={v} />) : value}</span>
        </p>
      ))
    )
);

function UsfmConflictEditor({ usfmJsons, currentProjectMeta, selectedChapter }) {
  const [resolveAllActive, setResolveALlActive] = useState();
  const [resetAlll, setResetAll] = useState();
  const { t } = useTranslation();

  const [currentChapter, setCurrentChapter] = useState(null);

  console.log({
    usfmJsons, currentProjectMeta, selectedChapter, currentChapter,
  });

  const resolveAllTogether = (data, type) => {
    console.log('resolve all together');
  };

  const handleResetSingle = (data, index) => {
    console.log('hanlde reset single conflcit');
  };

  const resetAllResolved = () => {
    console.log('reset all conflict ');
  };

  useEffect(() => {
    if (usfmJsons && selectedChapter) {
      const currentCh = usfmJsons.mergeJson.chapters.slice(selectedChapter - 1, selectedChapter);
      if (currentCh?.length === 1) {
        setCurrentChapter(currentCh[0]);
      }
    }
  }, [selectedChapter, usfmJsons]);

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
      {/* <div className="divide-y divide-gray-100 max-h-[71vh] overflow-y-scroll scrollbars-width">
        {selectedFileContent.map((content, index) => (
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
        ))}
      </div> */}

      {/* --------------------------------------------- testing -------------------------------------------- */}

      <div className="">
        {selectedChapter && currentChapter && currentChapter.contents.map((item, index) => (
          item?.verseNumber
            ? (
              <div key={item.verseNumber} className="flex gap-2">
                <span>{item.verseNumber}</span>
                <div>
                  {item.contents.map((tag, index) => <DisplayTagObj key={index} tagObj={tag} />)}
                </div>
              </div>
            )

            : (
              <div key={index}>
                <DisplayTagObj tagObj={item} />
              </div>
            )
        ))}
      </div>

    </div>
  );
}

export default UsfmConflictEditor;
