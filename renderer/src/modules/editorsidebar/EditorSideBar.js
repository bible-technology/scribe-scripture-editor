import PropTypes from 'prop-types';
import {
  Fragment, useReducer, useContext, useEffect,
} from 'react';
import { ProjectContext } from '@/components/context/ProjectContext';

import {
  Dialog, Transition,
} from '@headlessui/react';

import {
  XMarkIcon,
} from '@heroicons/react/24/solid';

import {
  ChatBubbleBottomCenterTextIcon,
  MagnifyingGlassIcon,
  BookmarkIcon,
} from '@heroicons/react/24/outline';

import { NoteEditor } from '@biblionexus-foundation/scribe-editor';
import PinIcon from '@/icons/basil/Outline/Status/Pin.svg';
import CrossReferenceIcon from '@/icons/crossreference.svg';
import FootNotesIcon from '@/icons/footnotes.svg';

import Search from './Search';
// import CrossReferences from './CrossReferences';
// import FootNotes from './FootNotes';
// import GraftEditor from './GraftEditor';
import Comments from './Comments';
import Bookmarks from '../../components/EditorPage/BookMarks/Bookmarks';

const initialTab = { tabIndex: 4 };

function reducer(state, action) {
  switch (action.type) {
  case 'search':
    return { tabIndex: 0 };
  case 'xref':
    return { tabIndex: 1 };
  case 'footnotes':
    return { tabIndex: 2 };
  case 'comments':
    return { tabIndex: 3 };
  case 'bookmarks':
    return { tabIndex: 4 };
  default:
    throw new Error();
  }
}

export default function EditorSideBar(props) {
  const [state, dispatch] = useReducer(reducer, initialTab);

  const {
    isOpen,
    closeSideBar,
    notesProps,
  } = props;

  const {
    states: { sideBarTab },
  } = useContext(ProjectContext);

  useEffect(() => {
    sideBarTab && dispatch({ type: sideBarTab });
  }, [sideBarTab]);

  function closeSideBars() {
    closeSideBar(false);
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>

      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        open={isOpen}
        onClose={closeSideBars}
      >

        <div className="min-h-screen px-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30 pointer-events-none" />
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

            <div className="absolute w-96 top-0 left-0 h-full shadow overflow-hidden rounded-r">

              <div className="relative text-center bg-black text-white text-xs font-medium tracking-wider uppercase">
                <div className="grid grid-cols-7 gap-0">
                  <div className="grid grid-cols-3 col-span-3 gap-0">
                    <div
                      onClick={() => dispatch({ type: 'search' })}
                      role="button"
                      aria-label="Magnify"
                      tabIndex="0"
                      className={`text-white h-full
                        w-full hover:bg-primary
                        cursor-pointer ${state.tabIndex === 0 && 'bg-primary'}`}
                    >
                      <MagnifyingGlassIcon className="w-1/3 m-auto h-full" aria-hidden="true" />
                    </div>
                    <div
                      role="button"
                      tabIndex="0"
                      onClick={() => dispatch({ type: 'crossreference' })}
                      className={`text-white h-full
                        w-full hover:bg-primary
                        cursor-pointer ${state.tabIndex === 1 && 'bg-primary'}`}
                    >
                      <CrossReferenceIcon
                        fill="currentColor"
                        className="w-1/5 m-auto h-full"
                        aria-hidden="true"
                      />
                    </div>
                    <div
                      role="button"
                      tabIndex="0"
                      onClick={() => dispatch({ type: 'footnotes' })}
                      className={`text-white
                      h-full w-full hover:bg-primary
                        cursor-pointer ${state.tabIndex === 2 && 'bg-primary'}`}
                    >
                      <FootNotesIcon
                        fill="currentColor"
                        className="w-1/6 m-auto h-full"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-6 col-span-6 gap-0">
                    <div
                      role="button"
                      tabIndex="0"
                      // onClick={() => dispatch({ type: 'comments' })}
                      className={`text-white h-full
                      w-full hover:bg-primary
                      cursor-pointer ${state.tabIndex === 3 && 'bg-primary'}`}
                    >
                      <ChatBubbleBottomCenterTextIcon className="w-1/3 m-auto h-full" aria-hidden="true" />
                    </div>
                    <div
                      role="button"
                      tabIndex="0"
                      onClick={() => dispatch({ type: 'bookmarks' })}
                      className={`text-white h-full w-full hover:bg-primary cursor-pointer ${state.tabIndex === 4 && 'bg-primary'}`}
                    >
                      <BookmarkIcon className="w-1/3 m-auto h-full" aria-hidden="true" />
                    </div>
                    <div className="text-white h-full w-full hover:bg-primary cursor-pointer">
                      <PinIcon
                        fill="currentColor"
                        className="w-2/5 m-auto h-full"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button aria-label="close-button" type="button" className="w-9 h-9 bg-gray-900 p-2 focus:outline-none" onClick={closeSideBars}>
                      <XMarkIcon />
                    </button>
                  </div>
                </div>

              </div>
              <div className="bg-gray-100 pb-20 h-full">
                {state.tabIndex === 0
                  && <Search />}
                {/* {state.tabIndex === 1
                  && <NoteEditor {...notesProps} />} */}
                {state.tabIndex === 2 && (
                  <NoteEditor
                    usj={notesProps.usj}
                    onChange={notesProps.onChange}
                    viewOptions={notesProps.viewOptions}
                    nodeOptions={notesProps.nodeOptions}
                    scrollId={notesProps.text}
                  />
                )}
                {/* && <GraftEditor {...notesProps} />} */}
                {state.tabIndex === 3
                  && <Comments />}
                {state.tabIndex === 4
                  && <Bookmarks />}
              </div>

            </div>

          </Transition.Child>
        </div>

      </Dialog>
    </Transition>

  );
}

EditorSideBar.propTypes = {
  isOpen: PropTypes.bool,
  closeSideBar: PropTypes.func,
};
