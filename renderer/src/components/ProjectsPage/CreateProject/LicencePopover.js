import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';

import { Dialog, Transition, Switch } from '@headlessui/react';

import { PencilSquareIcon } from '@heroicons/react/24/outline';

import { BlockEditable } from 'markdown-translatable/dist/components';
import { useTranslation } from 'react-i18next';
import { ProjectContext } from '../../context/ProjectContext';

export default function LicencePopover({ call }) {
  const [name, setName] = React.useState();
  const [content, setContent] = React.useState();
  const [isOpen, setIsOpen] = useState(false);
  const [edit, setEdit] = React.useState(false);
  const [preview, setPreview] = useState(true);
  const { t } = useTranslation();

  function closeModal() {
    setIsOpen(false);
    setPreview(true);
  }

  function openModal() {
    setIsOpen(true);
  }

  const {
    states: {
      copyright,
    }, actions: { setCopyRight },
  } = React.useContext(ProjectContext);
  const openlicenceNav = () => {
    setName(copyright.id);
    setEdit(!copyright.locked);
    if (call === 'new') {
      // eslint-disable-next-line import/no-dynamic-require
      const licensefile = require(`../../../lib/license/${copyright.title}.md`);
      setContent(licensefile.default);
    } else if (copyright.licence) {
      setContent(copyright.licence);
    } else {
      // eslint-disable-next-line import/no-dynamic-require
      const licensefile = require(`../../../lib/license/${copyright.title}.md`);
      setContent(licensefile.default);
    }
  };
  const callback = (markdown) => {
    // logger.debug('markdownviewer.js', `set translation as ${markdown}`);
    setContent(markdown);
  };
  const addLicence = () => {
    // eslint-disable-next-line no-template-curly-in-string
    setCopyRight({ id: name, title: copyright.title, licence: content });
  };
  return (
    <>
      <div className="flex gap-3">
        {/* <button
        type="button"
        onClick={() => { openlicenceNav('add'); openModal(); }}
        className="focus:outline-none
        bg-primary h-8 w-8 flex items-center justify-center rounded-full"
      >
        <PlusIcon
          className="h-5 w-5 text-white"
          aria-hidden="true"
        />
      </button> */}
        <button
          type="button"
          onClick={() => { openlicenceNav(); openModal(); }}
          className="focus:outline-none bg-primary h-8 w-8 flex items-center justify-center rounded-full"
        >
          <PencilSquareIcon
            className="h-5 w-5 text-white"
            aria-hidden="true"
          />
        </button>
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          open={isOpen}
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => closeModal}
        >
          <div className="h-2/3 px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-2/3 p-8 h-full relative text-left align-middle transition-all transform bg-white rounded">

                <div className="pb-4">
                  <h2 className="uppercase font-bold leading-5 tracking-widest ">new license</h2>
                  <Switch.Group as="div" className="flex items-center space-x-4">
                    <Switch.Label>{t('label-preview')}</Switch.Label>
                    <Switch
                      checked={preview}
                      onChange={setPreview}
                      className={`${preview ? 'bg-primary' : 'bg-dark'}
                                relative inline-flex flex-shrink-0 h-5 w-10 border-2 border-transparent rounded-full cursor-pointer
                                transition-colors ease-in-out duration-200 focus:outline-none focus-visible:ring-2
                              focus-visible:ring-white focus-visible:ring-opacity-75`}
                    >
                      <span className="sr-only">Use setting</span>
                      <span
                        aria-hidden="true"
                        className={`${preview ? 'translate-x-5' : 'translate-x-0'}
                                  pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200`}
                      />
                    </Switch>

                    {/* <Switch
                    as="button"
                    checked={preview}
                    onChange={setPreview}
                    className={`${preview ? 'bg-indigo-600' : 'bg-gray-200'
                      } relative inline-flex flex-shrink-0 h-6 transition-colors
                       duration-200 ease-in-out border-2 border-transparent
                       rounded-full cursor-pointer w-11 focus:outline-none focus:shadow-outline`}
                  >
                    {({ checked }) => (
                      <span
                        className={`${checked ? 'translate-x-5' : 'translate-x-0'
                          } inline-block w-5 h-5 transition duration-200 ease-in-out
                           transform bg-white rounded-full`}
                      />
                    )}
                  </Switch> */}

                  </Switch.Group>
                </div>

                <div className="h-5/6 overflow-y-auto">
                  <input
                    placeholder={t('placeholder-license-name')}
                    className="bg-gray-200 w-96 block rounded shadow-sm sm:text-sm border border-gray-300 h-10 focus:ring-primary pl-3"
                    value={name}
                    onChange={(e) => { setName(e.target.value); }}
                    disabled
                  />
                  <BlockEditable
                    markdown={content}
                    preview={preview}
                    onEdit={callback}
                    inputFilters={[
                      [/<br>/gi, '\n'],
                      [/(<u>|<\/u>)/gi, '__'],
                    ]}
                    outputFilters={[[/\n/gi, '<br>']]}
                  />

                </div>

                <div className="absolute bottom-5 left-0 right-5 flex gap-3 justify-end">
                  {edit
                  && (
                    <button
                      type="button"
                      className="mt-5 bg-success w-28 h-8 border-color-success rounded uppercase text-white text-xs shadow focus:outline-none"
                      onClick={() => { addLicence(); closeModal(); }}
                    >
                      {t('btn-save')}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={closeModal}
                    className=" mt-5
                bg-error w-28 h-8 border-color-error rounded uppercase shadow text-white text-xs tracking-wide leading-4 font-light focus:outline-none"
                  >
                    {t('btn-cancel')}
                  </button>
                </div>

              </div>

            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
LicencePopover.propTypes = {
  call: PropTypes.string,
};
