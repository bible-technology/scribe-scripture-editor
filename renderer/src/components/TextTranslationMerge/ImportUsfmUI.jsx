import React from 'react';

function ImportUsfmUI({
  currentProjectMeta, handleImportUsfm, buttonName, savedConflictsBooks, resumeConflictResolution,
}) {
  return (
    <>
      <div>
        Project Scope :
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
      {/* saved conflicts - resume */}
      <div className="w-full p-2 border border-gray-300 rounded-md mt-5">
        <div>Resume Conflict Resolution</div>
        <div>

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
    </>
  );
}

export default ImportUsfmUI;
