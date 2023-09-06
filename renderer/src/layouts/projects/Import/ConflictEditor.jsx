// import { Cog8ToothIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ConflictSection from './ConflictSection';

function ConflictEditor({
  selectedFileContent, setSelectedFileContent, selectedFileName, FileContentOrginal, setEnableSave, resolvedFileNames,
}) {
  const [resolveAllActive, setResolveALlActive] = useState();
  const [resetAlll, setResetAll] = useState();
  const { t } = useTranslation();

  useEffect(() => {
    if (resolvedFileNames?.includes(selectedFileName)) {
      setResolveALlActive(false);
      setResetAll(false);
    } else {
      setResolveALlActive(true);
      setResetAll(false);
    }
  }, [selectedFileName, resolvedFileNames]);

  useEffect(() => {
    let conflcitCount = 0;
    let resolvedCount = 0;
    let save = false;
    for (let index = 0; index < selectedFileContent.length; index++) {
      if (selectedFileContent[index]?.conflict) {
        conflcitCount += 1;
        if (selectedFileContent[index].conflictResolved) {
          resolvedCount += 1;
        }
      }
    }
    if (conflcitCount > 0 && conflcitCount === resolvedCount) {
      save = true;
    } else {
      setResolveALlActive(true);
      setResetAll(false);
    }
    setEnableSave(save);
    if (save) {
      setResolveALlActive(false);
      setResetAll(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFileContent]);

  const resolveAllTogether = (data, type) => {
    if (resolveAllActive) {
      const conflictedData = [...data];
      // loop check for conflcit lines
      for (let i = 0; i < conflictedData.length; i++) {
        const currentText = conflictedData[i]?.title || conflictedData[i]?.text || conflictedData[i]?.end;
        if (currentText) {
          // eslint-disable-next-line prefer-regex-literals
          const conflictRegex = new RegExp(
            /^<{7}([^=]*)\n([\s\S]*)\n={7}\n([\s\S]*)\n>{7}[^=]*$/,
          );
          const matchArr = currentText.match(conflictRegex);
          if (matchArr?.length > 3) {
            let resolvedText;
            if (type === 'current') {
              resolvedText = matchArr[2];
              conflictedData[i].resolvedType = 'current';
            } else if (type === 'incoming') {
              resolvedText = matchArr[3];
              conflictedData[i].resolvedType = 'incoming';
            } else if (type === 'both') {
              resolvedText = `${matchArr[2]}\t${matchArr[3]}`;
              conflictedData[i].resolvedType = 'both';
            }
            if (resolvedText) {
              conflictedData[i].conflictResolved = true;
              if ('text' in conflictedData[i]) {
                conflictedData[i].text = resolvedText;
              } else if ('title' in conflictedData[i]) {
                conflictedData[i].title = resolvedText;
              } else if ('end' in conflictedData[i]) {
                conflictedData[i].end = resolvedText;
              }
            }
          }
        }
      }
      // update state
      setResolveALlActive(false);
      setResetAll(true);
      // update line with current | incoming | both based on selection
      setSelectedFileContent(conflictedData);
    }
  };

  const handleResetSingle = (data, index) => {
    const orginalFileContent = JSON.parse(FileContentOrginal)[index];
    const conflictedData = [...data];
    conflictedData[index] = orginalFileContent;
    setSelectedFileContent(conflictedData);
  };

  const resetAllResolved = () => {
    setResetAll(false);
    setResolveALlActive(true);
    // update state with copy of conflcited data
    setSelectedFileContent(JSON.parse(FileContentOrginal));
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
              onClick={() => resolveAllTogether(selectedFileContent, 'current')}
              disabled={resolveAllActive === false}
              title={t('tooltip-merge-all-orginal-btn')}
              className={`${resolveAllActive ? 'px-2.5 py-0.5 bg-black text-white font-semibold tracking-wider text-xs uppercase rounded-xl' : 'hidden'}`}
            >
              {t('label-original')}
            </button>

            <button
              type="button"
              onClick={() => resolveAllTogether(selectedFileContent, 'incoming')}
              disabled={resolveAllActive === false}
              title={t('tooltip-merge-all-new-btn')}
              className={`${resolveAllActive ? 'px-2.5 py-0.5 bg-success text-white font-semibold tracking-wider text-xs uppercase rounded-xl' : 'hidden'}`}
            >
              {t('label-new')}

            </button>

            <button
              type="button"
              onClick={() => resolveAllTogether(selectedFileContent, 'both')}
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
        {selectedFileContent.map((content, index) => (
          <div key={content.id} className="flex px-2 py-6 gap-4">
            {(index !== 0 && index !== selectedFileContent.length - 1) && (
              <div className="h-4 w-4 py-1 px-2 mt-1 flex items-center justify-center bg-primary rounded-full text-xxs text-white">
                {index}
              </div>
            )}

            <div className={` w-full ${(index === 0 || index === selectedFileContent.length - 1) && 'ml-8'} `}>
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
      </div>
    </div>
  );
}

export default ConflictEditor;
