import React, { Fragment, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Combobox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/solid';
import CheckSvg from '@/icons/basil/Outline/Interface/Check.svg';

function MultiComboBox({
  selected, setSelected, data, options, selectedOption, setselectedOption,
}) {
  const [query, setQuery] = useState('');

  const filteredData = data.length > 0 && query === ''
    ? data
    : data?.filter((taData) => taData?.title
      .toLowerCase()
      .replace(/\s+/g, '')
      .includes(query.toLowerCase().replace(/\s+/g, '')));
  // console.log({ options, selectedOption });

  useEffect(() => {
    if (selectedOption === null && options.length > 0) {
      setselectedOption(options[0]);
    }
  }, [options, selectedOption, setselectedOption]);

  return (
    <div className="sm:w-6/12 lg:w-10/12">
      <Combobox value={selected?.title} onChange={setSelected}>
        <div className="relative mt-1">
          <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
            <Combobox.Input
              className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
              displayValue={selected?.title}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Combobox.Button className="absolute z-99 inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery('')}
          >
            <Combobox.Options className="absolute z-50 mt-1 max-h-48 scrollbars-width overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              <div className="flex flex-col">
                {options.length > 0 && options.map((option) => (
                  <div
                    key={option}
                    role="button"
                    tabIndex={-2}
                    className="flex px-2 py-1 cursor-pointer justify-between hover:bg-gray-200 rounded-md"
                    onClick={() => setselectedOption(option)}
                  >
                    <div className="">{option}</div>
                    <div>
                      {selectedOption === option
                        && (
                          <CheckSvg
                            fill="green"
                            className="w-5 h-5"
                          />
                        )}
                    </div>
                  </div>
                ))}
              </div>
              <hr className="border-2 mb-2" />
              {/* eslint-disable-next-line no-nested-ternary */}
              {filteredData.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  Nothing found.
                </div>
              ) : (
                filteredData.map((taData, index) => (
                  <Combobox.Option
                    key={`${taData.folder}_${index + 0}}`}
                    className={({ active }) => `relative cursor-default w-4/5 lg:w-96 select-none py-1.5 px-4 ${active ? 'text-primary bg-gray-200' : 'text-gray-900'
                      }`}
                    value={taData}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate whitespace-normal text-left text-sm ml-2 ${selected ? 'font-medium' : 'font-normal'
                            }`}
                          // onMouseEnter={() => setHover(index)}
                          // onMouseLeave={() => unsetHover()}
                          title={taData.subTitle}
                        >
                          {taData.title}
                          {/* {hovered === index ? taData.subTitle : taData.title} */}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-teal-600'
                              }`}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </div>
  );
}

MultiComboBox.propTypes = {
  selected: PropTypes.object,
  setSelected: PropTypes.func,
  data: PropTypes.array,
  options: PropTypes.array,
  selectedOption: PropTypes.string,
  setselectedOption: PropTypes.func,
};

export default MultiComboBox;
