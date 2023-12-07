/* eslint-disable react/no-array-index-key */
import { Fragment, useState } from 'react';
import {
  Combobox, Dialog, Transition,
} from '@headlessui/react';
import {
  CheckIcon,
  ChevronUpDownIcon,
} from '@heroicons/react/24/solid';
import { TextAa } from 'phosphor-react';
import {
  useDetectFonts,
  fontList as fontsArray,
} from 'font-detect-rhl';

export default function MenuDropdown({
 selectedFont, setSelectedFont, buttonStyle,
}) {
  const detectedFonts = useDetectFonts({ fonts: fontsArray });
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  function handleFontClick(font) {
    setSelectedFont(font);
    setIsOpen(false);
  }

  const filteredFonts = query === ''
    ? detectedFonts
    : detectedFonts.filter((font) => font.name
      .toLowerCase()
      .replace(/\s+/g, '')
      .includes(query.toLowerCase().replace(/\s+/g, '')));

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={buttonStyle || 'cursor-pointer py-2 px-2 text-left sm:text-sm'}
      >
        <TextAa
          className="w-5 h-5 text-grey-800"
          aria-hidden="true"
        />
      </button>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-20"
          onClose={() => setIsOpen(false)}
          returnFocus
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full min-h-32 max-w-md p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                  <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
                    Font Selector
                  </Dialog.Title>
                  <Combobox
                    className="w-full"
                    value={selectedFont}
                    onChange={(font) => handleFontClick(font)}
                  >
                    <div className="relative w-full mt-1">
                      <Combobox.Button
                        aria-label="selected-font"
                        className="relative w-full py-2 pl-3 pr-10 text-left bg-white rounded-lg shadow-md cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm"
                      >
                        <Combobox.Input
                          className="w-full border-none py-1 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                          displayValue={selectedFont}
                          onChange={(event) => setQuery(event.target.value)}
                        />
                        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <ChevronUpDownIcon
                            className="w-5 h-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </span>
                      </Combobox.Button>
                      <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                        afterLeave={() => setQuery('')}
                      >
                        <Combobox.Options className="absolute w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          {filteredFonts.length === 0 && query !== '' ? (
                            <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                              No fonts found.
                            </div>
                          ) : (detectedFonts
                            && filteredFonts.map((font, index) => (
                              <Combobox.Option
                                key={index}
                                className={({ active }) => `${active ? 'text-amber-900 bg-amber-100' : 'text-gray-900'}
                                  cursor-default select-none relative py-2 pl-5 pr-4`}
                                value={font.name}
                                aria-label={font.name}
                              >
                                {({
                                    selectedFont,
                                    active,
                                  }) => (
                                    <div className="flex justify-between items-center">
                                      <span
                                        className={`${selectedFont
                                          ? 'font-medium'
                                          : 'font-normal'
                                          } block truncate`}
                                      >
                                        ➤ &nbsp;
                                        {font.name}
                                        &nbsp;
                                      </span>
                                      <span
                                        className="truncate"
                                        style={{ fontFamily: font.name }}
                                      >
                                        {font.name}
                                      </span>
                                      {selectedFont ? (
                                        <span
                                          className={`${active
                                            ? 'text-amber-600'
                                            : 'text-amber-600'
                                            }
                                absolute inset-y-0 left-0 flex items-center pl-3`}
                                        >
                                          <CheckIcon
                                            className="w-5 h-5"
                                            aria-hidden="true"
                                          />
                                        </span>
                                      ) : null}
                                    </div>
                                  )}
                              </Combobox.Option>
                              )))}
                        </Combobox.Options>
                      </Transition>
                    </div>
                  </Combobox>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
