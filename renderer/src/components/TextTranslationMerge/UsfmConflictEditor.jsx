/* eslint-disable no-nested-ternary */
import React from 'react';

function UsfmConflictEditor({ usfmJsons }) {
  console.log({ usfmJsons });
  return (
    <div className="">
      <h5 className="text-center">Sample USFM render</h5>
      <div className="mt-3 text-sm">
        {usfmJsons.diffOut?.map((item, index) => (
          <span
            key={index}
            className="px-1"
            style={{
              color: `${item[0] === 1 ? 'green' : item[0] === -1 ? 'red' : ''
                }`,
            }}
          >
            {item[1]}
          </span>
        ))}
      </div>
    </div>
  );
}

export default UsfmConflictEditor;
