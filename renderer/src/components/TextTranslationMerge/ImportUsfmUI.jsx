import React from 'react';

function ImportUsfmUI({
  currentProjectMeta, handleImportUsfm, buttonName, savedConflictsBooks, resumeConflictResolution,
}) {
  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="w-full h-[30vh]  flex justify-center items-center gap-2">

        <div className="w-full h-full flex-1">

          <div className="flex flex-col gap-3 items-center justify-center h-full">
            <h4 className="font-medium text-center">Current Project Scope</h4>
            <div className="grid grid-cols-7 overflow-y-auto">

              {currentProjectMeta && Object.keys(currentProjectMeta?.type?.flavorType?.currentScope).map((scope) => (
                <span className="ml-2" key={scope}>{scope}</span>
              ))}
            </div>
            <button
              type="button"
              className="border-2 border-primary rounded-lg px-2 py-1 hover:bg-primary hover:text-white"
              onClick={handleImportUsfm}
            >
              {buttonName}
            </button>
          </div>

        </div>

        <div className="w-[.5px] h-full bg-gray-400" />

        {/* saved conflicts - resume */}
        {savedConflictsBooks?.length > 0 && (

          <div className="w-full flex-1 h-full flex flex-col justify-center items-center gap-2">

            <h4 className="font-medium text-center">Resume Conflict Resolution</h4>
            <div className="grid grid-cols-5 gap-2 overflow-y-auto">

              {savedConflictsBooks.map((book) => (
                <button
                  key={book}
                  type="button"
                  className="border-2 border-primary rounded-lg px-2 py-1 hover:bg-primary hover:text-white"
                  onClick={() => resumeConflictResolution(book)}
                >
                  {book.toUpperCase().split('.')[0]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImportUsfmUI;
