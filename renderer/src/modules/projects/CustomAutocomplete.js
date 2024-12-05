import React from 'react';
import { useAutocomplete } from '@mui/material';
import NoSsr from '@mui/material/NoSsr';
import CheckIcon from '@mui/icons-material/Check';

import styled from 'styled-components';
import PropTypes from 'prop-types';

const Label = styled('label')`
  padding: 8px 8px 6px 0;
  display: block;
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.025em;
  color: #0068E2;
  font-weight: 300;
  
`;

const InputWrapper = styled('div')`
  width: 326px;
  min-height: 38px;
  border: 1px solid #d9d9d9;
  background-color: #fff;
  border-radius: 4px;
  padding: 1px;
  display: flex;
  flex-wrap: wrap;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
 
  

  &:hover {
   
  }

  &.focused {
    border-color: #0068E2;
    border-width: 2px;
    
  }

  & input {
    font-size: 14px;
    font-weight: 300;
    height: 30px;
    box-sizing: border-box;
    padding: 4px 6px;
    width: 0;
    min-width: 30px;
    flex-grow: 1;
    border: 0;
    margin: 0;
    outline: 0;
  }
`;

const Listbox = styled('ul')`
  width: 300px;
  font-weight: 300;
  margin: 2px 0 0;
  padding: 0;
  position: absolute;
  list-style: none;
  background-color: #fff;
  overflow: auto;
  max-height: 250px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1;

  & li {
    padding: 5px 12px;
    display: flex;

    & span {
      flex-grow: 1;
    }

    & svg {
      color: transparent;
    }
  }

  & li[aria-selected='true'] {
    background-color: #fafafa;
    font-weight: 300;

    & svg {
      color: #1890ff;
    }
  }

  & li[data-focus='true'] {
    background-color: #e6f7ff;
    cursor: pointer;

    & svg {
      color: #000;
    }
  }
`;

export default function CustomizedHook({
  list, label, setValue,
}) {
  const {
    getRootProps,
    getInputLabelProps,
    getInputProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
    focused,
    setAnchorEl,
  } = useAutocomplete({
    id: 'customized-hook-demo',
    defaultValue: list[0],
    multiple: false,
    options: list,
    getOptionLabel: (option) => option.title,
  });
  React.useEffect(() => {
    setValue({ label, data: getInputProps().value });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getInputProps().value]);
  return (
    <NoSsr>
      <div>
        <div {...getRootProps()}>
          <Label {...getInputLabelProps()}>
            { label }
            {label !== 'Region' && <span className="text-error">*</span>}
          </Label>
          <InputWrapper ref={setAnchorEl} className={focused ? 'focused' : ''}>
            <input {...getInputProps()} />
          </InputWrapper>
        </div>
        {groupedOptions.length > 0 ? (
          <Listbox {...getListboxProps()}>
            {groupedOptions.map((option, index) => (
              <li key={option.title} {...getOptionProps({ option, index })}>
                <span>{option.title}</span>
                <CheckIcon fontSize="small" />
              </li>
            ))}
          </Listbox>
        ) : null}
      </div>
    </NoSsr>
  );
}

CustomizedHook.propTypes = {
  list: PropTypes.array,
  label: PropTypes.string,
  tag: PropTypes.object,
  setValue: PropTypes.func,
};
