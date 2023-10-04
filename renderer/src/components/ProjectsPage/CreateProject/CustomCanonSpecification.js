import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { useBibleReference } from 'bible-reference-rcl';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import SelectBook from '@/components/EditorPage/Navigation/reference/SelectBook';
import { ProjectContext } from '../../context/ProjectContext';
import * as logger from '../../../logger';

const CustomCanonSpecification = ({ bibleNav, closeBibleNav, handleNav }) => {
  const initialBook = 'mat';
  const initialChapter = '1';
  const initialVerse = '1';
  const [name, setName] = React.useState();
  const { t } = useTranslation();
  const {
    states: { canonSpecification, canonList },
    actions: { setcanonSpecification },
  } = React.useContext(ProjectContext);
  const [selectedBooks, setSelectedBooks] = React.useState([]);
  const [lock, setLock] = React.useState();
  const {
    state: { bookList },
  } = useBibleReference({ initialBook, initialChapter, initialVerse });
  const saveCanon = () => {
    setcanonSpecification({
      id: canonList.length + 1, title: name, currentScope: selectedBooks, lock: false,
    });
    closeBibleNav();
  };
  const editCanon = () => {
    logger.debug('CustomCanonSpecification.js', 'In editCanon for editing the current scope');
    setcanonSpecification({
      id: canonSpecification.id, title: name, currentScope: selectedBooks, lock: false,
    });
    closeBibleNav();
  };
  React.useEffect(() => {
    if (handleNav === 'edit') {
      setLock(canonSpecification.locked);
      setName(canonSpecification.title);
      setSelectedBooks(canonSpecification.currentScope);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleNav]);
  return (
    <Transition
      show={bibleNav}
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
        static
        open={bibleNav}
        onClose={closeBibleNav}
      >
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        <div className="flex items-center justify-center h-screen ">
          <div className="w-9/12 m-auto z-50 bg-white shadow overflow-hidden sm:rounded-lg">
            {/* <div className="p-3">
              <input
                type="text"
                name="new spec"
                id=""
                value={name}
                onChange={(e) => { setName(e.target.value); }}
                disabled
                className="bg-white w-80 block rounded shadow-sm sm:text-sm focus:ring-gray-500 focus:border-primary border-gray-300"
              />
            </div> */}
            <SelectBook
              bookList={bookList}
              multiSelectBook
              selectedBooks={selectedBooks}
              setSelectedBooks={setSelectedBooks}
              scope={name}
            >
              <button
                type="button"
                className="w-9 h-9 bg-black p-2"
                aria-label="close-custombiblenavigation"
                onClick={closeBibleNav}
              >
                <XMarkIcon />
              </button>
            </SelectBook>
            <div className="p-3 flex gap-5 justify-end">

              {lock ? (
                <button
                  type="button"
                  className="w-40 h-10  bg-success leading-loose rounded shadow text-xs font-base  text-white tracking-wide  font-light uppercase"
                  onClick={() => closeBibleNav()}
                >
                  {t('btn-ok')}
                </button>
                )
              : (
                <>
                  <button
                    type="button"
                    className="w-40 h-10  bg-error leading-loose rounded shadow text-xs font-base  text-white tracking-wide  font-light uppercase"
                    onClick={() => closeBibleNav()}
                  >
                    {t('btn-cancel')}
                  </button>
                  <button
                    type="button"
                    id="save-canon"
                    className="w-40 h-10  bg-success leading-loose rounded shadow text-xs font-base  text-white tracking-wide  font-light uppercase"
                    onClick={() => (handleNav === 'edit' ? editCanon() : saveCanon())}
                  >
                    {t('btn-save')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
export default CustomCanonSpecification;
CustomCanonSpecification.propTypes = {
  bibleNav: PropTypes.bool,
  closeBibleNav: PropTypes.func,
  handleNav: PropTypes.string,
};
