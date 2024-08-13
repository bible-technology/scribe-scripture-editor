import React from 'react';

function BulkSelectionGroup({
  selectedOption = '',
  handleSelect,
  toggleOptions = [],
}) {
  return (
    <div className="px-2 h-8 flex gap-3 text-xs text-gray-800 items-center">
      {toggleOptions.map((option) => (
        <div key={option?.key} className="flex gap-1 items-center">
          <input
            type="radio"
            value={option?.key}
            className="pr-2"
            checked={selectedOption === option?.key}
            onChange={handleSelect}
          />
          <label className="">
            {option?.name}
          </label>
        </div>
      ))}
    </div>
  );
}

export default BulkSelectionGroup;
