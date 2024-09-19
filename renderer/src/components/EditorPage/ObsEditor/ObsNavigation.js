import React, { useState } from 'react';
import PropTypes from 'prop-types';
import navItems from './NavItems.json';

const ObsNavigation = (props) => {
  const { value, onChange } = props;
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <button
        className="bg-blue-500 text-white w-32 h-15 active:bg-blue-600 px-6 py-3 shadow hover:shadow-lg outline-none mr-1 mb-1"
        type="button"
        onClick={handleOpen}
      >
        {value}
        <span />
      </button>
      {open ? (
        <div className="flex items-center justify-center">
          <div className="w-8/12 max-w-md m-auto z-50 bg-black text-white shadow overflow-hidden sm:rounded-lg">
            <div className="flex flex-row justify-between text-center font-semibold text-xs tracking-wider uppercase">
              <div className="grid grid-cols-1 w-full bg-blue-700">
                <div className="px-2 pt-1 text-xl bg-blue-500  cursor-pointer">
                  OBS
                </div>
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={handleClose}>
                  <span className="text-white px-2 text-2xl">x</span>
                </button>
              </div>
            </div>
            <div className="grid py-5 grid-cols-10 gap-2 mt-5 text-center bg-black text-white text-xs font-medium tracking-wide">
              {navItems.map((item) => (
                <button
                  className={`${
                    item === value ? 'bg-blue-700' : ''
                  } p-1 rounded-md hover:bg-blue-500`}
                  type="button"
                  key={item}
                  value={value}
                  onClick={() => {
                    onChange(item);
                    handleClose();
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
ObsNavigation.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
};
export default ObsNavigation;
