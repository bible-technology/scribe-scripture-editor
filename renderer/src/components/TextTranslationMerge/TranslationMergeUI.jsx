import React, {
  useRef, Fragment, useState, useEffect, useContext,
} from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { AutographaContext } from '@/components/context/AutographaContext';
import { useTranslation } from 'react-i18next';
import { XMarkIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '@/layouts/editor/ConfirmationModal';

function TranslationMergeUI() {
  const {
    states: {
      openTextTranslationMerge,
    },
    action: {
      setOpenTextTranslationMerge,
    },
  } = useContext(AutographaContext);

  const { t } = useTranslation();
  const cancelButtonRef = useRef(null);
  const [model, setModel] = React.useState({
    openModel: false,
    title: '',
    confirmMessage: '',
    buttonName: '',
  });

  const modalClose = () => {
    setModel({
      openModel: false,
      title: '',
      confirmMessage: '',
      buttonName: '',
    });
  };

  const removeSection = async (abort = false) => {
    if (abort === false) {
      // pass
    } else {
      // popup with warning
      setModel({
        openModel: true,
        title: t('modal-title-abort-conflict-resolution'),
        confirmMessage: t('msg-abort-conflict-resolution'),
        buttonName: t('label-abort'),
      });
    }
  };

  const handleOnAbortMerge = () => {
    console.log('Agreed on abort');
    modalClose();
    setOpenTextTranslationMerge(false);
  };

  return (
    <>

      <Transition
        show={openTextTranslationMerge}
        as={Fragment}
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          initialFocus={cancelButtonRef}
          static
          open={openTextTranslationMerge}
          onClose={() => removeSection(true)}
        >

          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          <div className="flex flex-col mx-12 mt-10 fixed inset-0 z-10 overflow-y-auto items-center justify-center ">
            <div className="bg-black relative flex justify-between px-3 items-center rounded-t-lg h-10 w-[80%]">
              <h1 className="text-white font-bold text-sm uppercase">{t('label-resolve-conflict')}</h1>
              <div aria-label="resources-search" className="pt-1.5 pb-[6.5px]  bg-secondary text-white text-xs tracking-widest leading-snug text-center" />
              {/* close btn section */}
              <button
                type="button"
                className="focus:outline-none w-9 h-9 bg-black text-white p-2"
                onClick={() => removeSection(true)}
              >
                <XMarkIcon />
              </button>
            </div>

            {/* contents section */}
            content
          </div>
        </Dialog>
      </Transition>

      <ConfirmationModal
        openModal={model.openModel}
        title={model.title}
        setOpenModal={() => modalClose()}
        confirmMessage={model.confirmMessage}
        buttonName={model.buttonName}
        closeModal={() => handleOnAbortMerge()}
      />
    </>
  );
}

export default TranslationMergeUI;
