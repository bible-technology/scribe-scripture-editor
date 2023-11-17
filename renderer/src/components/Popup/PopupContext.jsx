/* eslint-disable react/jsx-no-constructed-context-values */
import { createContext, useState, useContext } from 'react';
import PropTypes from 'prop-types';

export const PopupContext = createContext();

export function usePopup() {
  return useContext(PopupContext);
}

export const PopupContextProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const context = {
    isOpen,
    setIsOpen,
  };

  return (
    <PopupContext.Provider value={context}>
      {children}
    </PopupContext.Provider>
  );
};

PopupContextProvider.propTypes = {
  children: PropTypes.node,
};
