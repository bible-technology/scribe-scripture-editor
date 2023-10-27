import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import { SnackBar } from '@/components/SnackBar';
import PropTypes from 'prop-types';
import { v5 as uuidv5 } from 'uuid';
import moment from 'moment';
import { checkLangNameAndCodeExist } from '@/core/projects/languageUtil';
import useValidator from '@/components/hooks/useValidator';
import { PlusIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import * as logger from '../../../logger';
import { ProjectContext } from '../../context/ProjectContext';
import { environment } from '../../../../environment';

export default function TargetLanguagePopover({ projectType }) {
  const [id, setId] = React.useState();
  const [lang, setLang] = React.useState('');
  const [direction, setDirection] = React.useState();
  const [langcode, setLangCode] = React.useState('');
  const [edit, setEdit] = React.useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [snackBar, setOpenSnackBar] = React.useState(false);
  const [snackText, setSnackText] = React.useState('');
  const [notify, setNotify] = React.useState();
  const [lock, setLock] = useState();
  const [errors, setErrors] = React.useState({
    language: '',
    code: '',
  });
  const {
    states: {
      language,
      languages,
    }, actions: {
      setLanguage,
    },
  } = React.useContext(ProjectContext);
  const {
 action: {
 validateField, isLengthValidated, isTextValidated, isRequiered,
},
} = useValidator();
  const { t } = useTranslation();
  const openLanguageNav = (nav) => {
    logger.debug('TargetLanguagePopover.js', 'In openLanguageNav');
    if (nav === 'edit') {
      logger.debug('TargetLanguagePopover.js', 'Selected a language which can be edited');
      setLock(!language?.custom);
      setEdit(true);
      setId(language?.id);
      setLang(language.ang);
      setDirection(language?.ld ? language.ld : t('label-rtl'));
      setLangCode(language?.lc);
    } else if (nav === 'add') {
      logger.debug('TargetLanguagePopover.js', 'Selected the Pre-defined language which can\'t be edited');
      setLock();
      setEdit(false);
      setLang('');
      setDirection(t('label-ltr'));
      setLangCode('');
    }
  };
  function openModal() {
    setIsOpen(true);
  }
  function closeModal() {
    setIsOpen(false);
    setErrors({ language: '', code: '' });
  }
  const validateLanguageInputs = async (fieldName, value) => {
    let errorText = '';
    switch (fieldName) {
      case 'language':
        if (value.length > 0) {
          const check = await validateField([isLengthValidated(value.trim(), { minLen: 2, maxLen: 40 })]);
          if (!check[0].isValid) {
            errorText = check[0].message;
          }
          setErrors((prev) => ({
            ...prev,
            language: errorText,
          }));
        }
        break;
      case 'code':
        if (value.length > 0) {
          const check = await validateField([isLengthValidated(value.trim(), { minLen: 2, maxLen: 35 }), isTextValidated(value.trim(), 'bcp47Language')]);
          if (!check[0].isValid) {
            errorText = check[0].message;
          } else if (!check[1].isValid) {
            errorText = check[1].message;
          }
          setErrors((prev) => ({
            ...prev,
            code: errorText,
          }));
        }
        break;

      default:
        break;
    }
  };

  const addLanguage = async () => {
    logger.debug('TargetLanguagePopover.js', 'Adding a new language');
    let validate = true;
    // basic validation for direct create click
    const langField = await isRequiered(lang, 'Language Name');
    const langcodeField = await isRequiered(langcode, 'Language Code');
      if (!langField.isValid) {
      validate = false;
      setErrors((prev) => ({
        ...prev,
        language: langField.message,
      }));
    }
    if (!langcodeField.isValid) {
      validate = false;
      setErrors((prev) => ({
        ...prev,
        code: langcodeField.message,
      }));
    }

    if (errors.code.length === 0 && errors.language.length === 0 && validate) {
      // check for name and code exist or not
      const result = await checkLangNameAndCodeExist(languages, lang.toLowerCase().trim(), langcode.toLowerCase().trim(), 'ang', 'lc');
      if (!result.name.status && !result.code.status) {
        const key = lang + langcode + moment().format();
        const id = uuidv5(key, environment.uuidToken);
        setLanguage({
           id, ang: lang.trim(), ld: direction, lc: langcode.trim(),
        });
        closeModal();
      } else {
        setNotify('warning');
        setSnackText((result.name.status && result.name.message) || (result.code.status && result.code.message));
        setOpenSnackBar(true);
      }
      }
  };

  const editLanguage = async () => {
    logger.debug('TargetLanguagePopover.js', 'Editing the language');
    let validate = true;
    // basic validation for direct create click
    const langField = await isRequiered(lang, 'Language Name');
    const langcodeField = await isRequiered(langcode, 'Language Code');
      if (!langField.isValid) {
      validate = false;
      setErrors((prev) => ({
        ...prev,
        language: langField.message,
      }));
    }
    if (!langcodeField.isValid) {
      validate = false;
      setErrors((prev) => ({
        ...prev,
        code: langcodeField.message,
      }));
    }
    if (errors.code.length === 0 && errors.language.length === 0 && validate) {
      // check exist name and code
      const result = await checkLangNameAndCodeExist(languages, lang.toLowerCase().trim(), langcode.toLowerCase().trim(), 'ang', 'lc');
      let proceed = true;
      if (language.ang.toLowerCase().trim() !== lang.toLowerCase().trim()) {
        setSnackText(result.name.message);
        proceed = !(result.name.status);
      } else if (language.lc.toLowerCase().trim() !== langcode.toLowerCase().trim()) {
        setSnackText(result.code.message);
        proceed = !(result.code.status);
      }
      if (proceed) {
        setLanguage({
          id, ang: lang.trim(), ld: direction, lc: langcode.trim(), custom: true,
        });
        closeModal();
      } else {
        setNotify('warning');
        setOpenSnackBar(true);
      }
    }
  };

  return (
    <>
      <div className="flex gap-3">
        <button
          type="button"
          aria-label="add-language"
          className="focus:outline-none bg-primary h-8 w-8 flex items-center justify-center rounded-full"
          onClick={() => { openLanguageNav('add'); openModal(); }}
        >
          <PlusIcon
            className="h-5 w-5 text-white"
            aria-hidden="true"
          />

        </button>
        {/* show edit only for custom languages */}
        {language && language?.custom
        && (
        <button
          type="button"
          className="focus:outline-none bg-primary h-8 w-8 flex items-center justify-center rounded-full"
          onClick={() => { openLanguageNav('edit'); openModal(); }}
        >
          <PencilSquareIcon
            className="h-5 w-5 text-white"
            aria-hidden="true"
          />
        </button>
        )}
      </div>

      <Transition appear show={isOpen} as={Fragment}>

        <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
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

            <div className="fixed inset-0 flex items-center justify-center">
              <div className="h-[27rem] w-[26rem] rounded shadow border border-gray-200 bg-white">
                <div className="grid grid-rows-2 gap-1 m-8">
                  <div>
                    <h2 className="uppercase font-bold leading-5 tracking-widest mb-5 ">{edit === true ? t('label-edit-langauge') : t('label-new-langauge')}</h2>
                    <div>
                      <h3 className="mb-1 text-xs font-base text-primary tracking-wide leading-4 font-light">{t('label-language')}</h3>
                      <input
                        type="text"
                        name="language"
                        id="language"
                        autoComplete="given-name"
                        value={lang}
                        onChange={(e) => {
                          setLang(e.target.value);
                          validateLanguageInputs(e.target.name, e.target.value);
                        }}
                        disabled={lock}
                        className="mb-1 w-80 block rounded shadow-sm sm:text-sm focus:border-primary border-gray-300"
                      />
                    </div>
                    <span className="text-red-500 ml-2 text-xs">
                      {errors?.language}
                    </span>
                    <div className="">
                      <h3 className="mb-1 text-xs font-base text-primary tracking-wide leading-4 font-light">{t('label-language-code')}</h3>
                      <input
                        type="text"
                        name="code"
                        id="code"
                        autoComplete="given-name"
                        value={langcode}
                        onChange={(e) => { setLangCode(e.target.value); validateLanguageInputs(e.target.name, e.target.value); }}
                        disabled={lock}
                        className="mb-1 w-80 block rounded shadow-sm sm:text-sm focus:border-primary border-gray-300"
                      />
                    </div>
                    <span className="text-red-500 ml-2 text-xs">
                      {errors?.code}
                    </span>
                  </div>

                  <div>
                    {projectType !== 'Audio'
                    && (
                      <>
                        <h3 className="mb-1 text-xs font-base  text-primary tracking-wide leading-4 font-light">{t('label-script-direction')}</h3>
                        <div>
                          <div className=" mb-3">
                            <input
                              type="radio"
                              className="form-radio h-4 w-4 text-primary"
                              value={t('label-ltr')}
                              aria-label="LTR"
                              checked={direction === t('label-ltr')}
                              onChange={() => setDirection(t('label-ltr'))}
                              disabled={lock}
                            />
                            <span className=" ml-4 text-xs font-bold">{t('label-ltr')}</span>
                          </div>
                          <div>
                            <input
                              type="radio"
                              className="form-radio h-4 w-4 text-primary"
                              value={t('label-rtl')}
                              aria-label="RTL"
                              checked={direction === t('label-rtl')}
                              onChange={() => setDirection(t('label-rtl'))}
                              disabled={lock}
                            />
                            <span className=" ml-3 text-xs font-bold">{t('label-rtl')}</span>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex items-center justify-center mt-8">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="mr-5 bg-error w-28 h-8 border-color-error rounded
                                  uppercase shadow text-white text-xs tracking-wide leading-4 font-light focus:outline-none"
                      >
                        {t('btn-cancel')}
                      </button>
                      {lock ? <div />
                    : (
                      <button
                        type="button"
                        aria-label="edit-language"
                        className=" bg-success w-28 h-8 border-color-success rounded uppercase text-white text-xs shadow focus:outline-none"
                        onClick={() => (edit === true ? editLanguage() : addLanguage())}
                      >
                        {edit ? t('btn-save') : t('btn-create')}
                      </button>
                    )}
                    </div>

                  </div>

                </div>
              </div>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>

      <SnackBar
        openSnackBar={snackBar}
        snackText={snackText}
        setOpenSnackBar={setOpenSnackBar}
        setSnackText={setSnackText}
        error={notify}
      />

    </>
  );
}
TargetLanguagePopover.propTypes = {
  projectType: PropTypes.string,
};
