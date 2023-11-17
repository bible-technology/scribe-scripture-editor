import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/solid';
import { classNames } from '../../util/classNames';

export default function CustomList({
 selected, setSelected, options, show, width,
}) {
  const dropdownWidth = width ?? 40;
  return (
    <Listbox value={selected} onChange={setSelected} disabled={!show}>
      <div className={classNames(show === false ? 'bg-gray-200' : '', 'relative w-52 lg:w-40 rounded shadow-sm sm:text-sm focus:border-primary border-gray-300')}>
        <Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-left rounded-lg shadow-md cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm">
          <span id={selected?.title} className="block truncate">{selected?.title}</span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronUpDownIcon
              className="w-5 h-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className={`absolute z-50 w-52 lg:w-${dropdownWidth} py-1 mt-1 overflow-auto scrollbars-width text-base bg-white rounded-md shadow-lg max-h-44 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm`}>
            {options.map((option) => (
              <Listbox.Option
                key={option.title}
                className={({ active }) => `${active ? 'text-amber-900 bg-amber-100' : 'text-gray-900'}
                  cursor-default select-none relative py-2 pl-10 pr-4 hover:bg-gray-200`}
                value={option}
              >
                {({ selected, active }) => (
                  <>
                    <span
                      aria-label={option.title}
                      className={`${
                        selected ? 'font-medium' : 'font-normal'
                      } block truncate`}
                    >
                      {option.title}
                    </span>
                    {selected ? (
                      <span
                        className={`${
                          active ? 'text-amber-600' : 'text-amber-600'
                        }
                        absolute inset-y-0 left-0 flex items-center pl-3`}
                      >
                        <CheckIcon className="w-5 h-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}

CustomList.propTypes = {
  selected: PropTypes.object,
  setSelected: PropTypes.func,
  options: PropTypes.array,
  show: PropTypes.bool,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};
