import React, { useState } from 'react';
import PropTypes from 'prop-types';
import dynamic from 'next/dynamic';
import RowSection from './RowSection';

const UsfmEditor = dynamic(
  () => import('@/components/EditorPage/UsfmEditor/UsfmEditor'),
  { ssr: false },
);

export default function ColumnSection(props) {
  const { colNumber } = props;
  const maxRows = 3;
  const minRows = 1;
  const [showColOne, setShowColOne] = useState([true]);
  const [showColTwo, setShowColTwo] = useState([true]);

  function addRow(col, index) {
    const rows = col === 'colone' ? { ...showColOne } : { ...showColTwo };
    if (index < maxRows - 1) { rows[index + 1] = true; }
    if (col === 'colone') { setShowColOne({ ...rows }); } else { setShowColTwo({ ...rows }); }
  }

  function removeRow(col, index) {
    const rows = col === 'colone' ? { ...showColOne } : { ...showColTwo };
    if (index > minRows - 1) { rows[index] = false; }
    if (col === 'colone') { setShowColOne({ ...rows }); } else { setShowColTwo({ ...rows }); }
  }

  function expandRow(col, index) {
    const rows = col === 'colone' ? { ...showColOne } : { ...showColTwo };
    if (index < maxRows - 1) { rows[index + 1] = true; }
    if (col === 'colone') { setShowColOne({ ...rows }); } else { setShowColTwo({ ...rows }); }
  }

  return (
    <>
      {colNumber === 3
        && (
          <div className="bg-white rounded-md grid auto-rows-fr gap-2">
            {
              [...Array(maxRows)].map((e, i) => (
                <RowSection
                  key={e}
                  rowCount={i}
                  ishidden={showColOne[i]}
                  addRow={() => addRow('colone', i)}
                  removeRow={() => removeRow('colone', i)}
                />
              ))
            }
          </div>
        )}

      {colNumber >= 2
        && (
          <div className="bg-white rounded-md grid auto-rows-fr gap-2">
            {
              [...Array(maxRows)].map((e, i) => (
                <RowSection
                  key={e}
                  rowCount={i}
                  ishidden={showColTwo[i]}
                  addRow={() => addRow('coltwo', i)}
                  expandRow={() => expandRow('coltwo', i)}
                  removeRow={() => removeRow('coltwo', i)}
                />
              ))
            }
          </div>
        )}

      <div className="bg-white border-b-2 border-secondary rounded-md shadow overflow-hidden">
        <UsfmEditor />
      </div>
    </>
  );
}
ColumnSection.propTypes = {
  colNumber: PropTypes.number,
};
