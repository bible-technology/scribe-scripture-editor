import React from 'react';

function ImportUsfmUI({ currentProjectMeta, handleImportUsfm, buttonName }) {
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
    </>
  );
}

export default ImportUsfmUI;
