import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

const ResourceOption = ({
  Icon,
  text,
  id,
  selectResource,
  setSelectResource,
  setTitle,
  setShowInput,
}) => {
  const handleSelectResource = (e, id, text) => {
    if (id) {
      setSelectResource(id);
      setTitle(text);
      setShowInput(false);
    }
  };
  useEffect(() => {
    if (!selectResource) {
      setSelectResource('bible');
      setTitle('Bible');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <button
      onClick={(e) => handleSelectResource(e, id, text)}
      type="button"
      id={selectResource}
      className={`flex items-center text-xs uppercase 
      font-semibold tracking-wider py-2 px-4 
      ${id === selectResource ? 'bg-primary outline-none rounded shadow  text-white' : ''}`}
    >
      {/* <img
        className="text-white mr-2"
        src={Icon}
        alt=""
      /> */}
      {Icon}
      {text}
    </button>
  );
};
export default ResourceOption;
ResourceOption.propTypes = {
  // Icon: PropTypes.object,
  text: PropTypes.string,
  selectResource: PropTypes.string,
  id: PropTypes.string,
  setSelectResource: PropTypes.func,
  setTitle: PropTypes.func,
  setShowInput: PropTypes.func,
};
