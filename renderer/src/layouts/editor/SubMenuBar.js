import { useState, useContext, useEffect } from 'react';
import { BookmarkIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import MenuBar from '@/components/Menubar/MenuBar';
import CustomUsfmToolbar from '@/components/EditorPage/UsfmEditor/CustomUsfmToolbar';
import { ProjectContext } from '@/components/context/ProjectContext';
import CustomNofications from '@/components/Notification/CustomNofications';
import localforage from 'localforage';
import EditorSync from '@/components/Sync/Gitea/EditorSync/EditorSync';
// import useNetwork from '@/components/hooks/useNetowrk';
import { isElectron } from '@/core/handleElectron';
import Font from '@/icons/font.svg';
import ColumnsIcon from '@/icons/basil/Outline/Interface/Columns.svg';
import MenuDropdown from '../../components/MenuDropdown/MenuDropdown';
import menuStyles from './MenuBar.module.css';
import packageInfo from '../../../../package.json';
import { newPath, sbStorageDownload } from '../../../../supabase';
// if (!process.env.NEXT_PUBLIC_IS_ELECTRON) {
//   const supabaseStorage = require('../../../../../supabase').supabaseStorage
//   const newPath = require('../../../../supabase').newPath
// }
// import WifiIcon from '@/icons/wifi.svg';

const activate = () => {
  // console.log('rename');
};

const EditorTools = [
  {
    renderElement: <CustomUsfmToolbar />,
  },
];

export default function SubMenuBar() {
  // const [snackBar, setSnackBar] = useState(true);
  const {
    state: {
      layout,
      row,
      // openResource1,
      // openResource3,

    },
    actions: {
      setOpenResource1,
      setOpenResource3,
      setLayout,
      setRow,
    },
  } = useContext(ReferenceContext);
  const {
    states: {
      editorSave,
      selectedProject,
    },
    actions: {
      setOpenSideBar,
    },
  } = useContext(ProjectContext);

  const openBookMarks = () => {
    setOpenSideBar(true);
  };
  const { t } = useTranslation();
  // const networkState = useNetwork();
  const FileMenuItems = [
    {
      itemname: t('label-bookmarks'),
      icon: <BookmarkIcon />,
      callback: openBookMarks,
    },
    {
      itemname: 'Font',
      icon: <Font />,
      renderElement: <MenuDropdown />,
      callback: activate,
    },
  ];

  const handleResource = () => {
    if (layout === 0) {
      setOpenResource1(false);
    }
    if (layout === 1) {
      setOpenResource1(false);
      setOpenResource3(false);
    }

    if (layout < 3) {
      setLayout(layout + 1);
      setRow(row + 1);
    }
    if (layout >= 2) {
      setLayout(0);
      setRow(row + 1);
    }
    // if (layout === 2) { setLayout(0); }
  };

  // This below code is for identifying the type of resource to remove Bookmarks from OBS
  const [resourceType, setResourceType] = useState();

  async function supabaseResourceType() {
    const projectName = await localforage.getItem('currentProject');
    const userProfile = await localforage.getItem('userProfile');
    const email = userProfile.user.email;
    const { data, error } = await sbStorageDownload(`${newPath}/${email}/projects/${projectName}/metadata.json`);
    if (error) {
      console.log('SubMenuBar.js', error);
    }
    const metadata = JSON.parse(await data.text());
    setResourceType(metadata.type.flavorType.flavor.name);
  }

  useEffect(() => {
    if (isElectron()) {
      localforage.getItem('userProfile').then((value) => {
        const username = value?.username;
        localforage.getItem('currentProject').then((projectName) => {
          const path = require('path');
          const fs = window.require('fs');
          const newpath = localStorage.getItem('userPath');
          const metaPath = path.join(newpath, packageInfo.name, 'users', username, 'projects', projectName, 'metadata.json');
          const data = fs.readFileSync(metaPath, 'utf-8');
          const metadata = JSON.parse(data);
          setResourceType(metadata.type.flavorType.flavor.name);
        });
      });
    } else {
      supabaseResourceType();
    }
  });
  return (
    <>

      {/* <StatsModal openModal={openStatsModal} open={openStats} /> */}

      {/* <Transition appear show={refernceLoading.status} as={Fragment}>
        <Dialog
          as={Fragment}
          // className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => { }}
        > */}
      {/* <1div className="static"> */}

      {/* This element is to trick the browser into centering the modal contents. */}
      {/* <span
              // className="inline-block h-screen align-bottom"
              aria-hidden="true"
            >
              &#8203;
            </span> */}
      {/* <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            > */}

      {/* <div className="inline-block absolute bottom-0 left-0 align-top transform transition-all w-2/5 p-4">

                <div className="relative p-5 mt-5 bg-validation rounded-lg text-sm font-semibold text-gray-500">
                  <button
                    type="button"
                    className="bg-black absolute top-0 right-0 h-6 w-6 rounded-full text-center text-white p-1 -mt-2 -mr-2 focus:outline-none"
                    onClick={() => closeSnackBar(false)}
                  >
                    <XMarkIcon />
                  </button>
                  <p>
                    {refernceLoading.text}
                    {counter > 0 ? counter : ''}
                  </p>closeSnackBar
                </div> */}

      {/* <div className="relative p-5 mt-5 bg-light rounded-lg text-sm font-semibold text-gray-500">
                  <button
                    type="button"
                    className="bg-black absolute top-0 right-0 h-6 w-6 rounded-full text-center text-white p-1 -mt-2 -mr-2 focus:outline-none"
                    onClick={() => closeSnackBar(false)}
                  >
                    <XMarkIcon />
                  </button>
                  <p>This is a Notifiction.</p>
                </div>

                <div className="relative p-5 mt-5 bg-validation rounded-lg text-sm font-semibold text-gray-500">
                  <button
                    type="button"
                    className="bg-black absolute top-0 right-0 h-6 w-6 rounded-full text-center text-white p-1 -mt-2 -mr-2 focus:outline-none"
                    onClick={() => closeSnackBar(false)}
                  >
                    <XMarkIcon />
                  </button>
                  <p>This is a Notifiction.</p>
                </div> */}

      {/* </div>

            </Transition.Child>
          </div>
        </Dialog>
      </Transition> */}

      <nav className="flex p-2 shadow-sm border-b border-gray-200">
        <div className="w-3/5">
          <MenuBar header={t('label-menu-file')} MenuItems={resourceType === 'textStories' ? FileMenuItems.slice(1) : FileMenuItems} />
          {/* <span>
            <MenuBar header="FORMAT" MenuItems={FormatMenuItems} style={{ left: '-60px' }} />
          </span> */}
          {/* <button type="button" className={styles.menu} aria-expanded="false">
            <span>Insert</span>
          </button> */}
          <span>
            <MenuBar header={t('label-menu-edit')} MenuItems={EditorTools} style={{ left: '-60px', height: '65px' }} />
          </span>
        </div>
        {/* <div className="w-2/3">
          <div className="flex-1 items-center text-center place-self-center" />
        </div> */}
        <div className="w-2/5">
          <div className="flex justify-end">

            {/* saved text and animations */}
            <div className={`group ${menuStyles.saved}`}>
              <span>
                {editorSave}
              </span>
            </div>

            {/* Network Status */}
            {/* <div className={`group ${menuStyles.saved}`} title={`Network status : ${networkState.online ? 'Online' : 'Offline' }`}>
              <WifiIcon className={`w-6 h-6 ${networkState.online ? 'fill-green-500' : 'fill-red-500'}`} />
            </div> */}

            {/* Editor sync 2 new one */}
            <EditorSync selectedProject={selectedProject} />

            <button aria-label="add-panels" title={t('tooltip-editor-layout')} type="button" onClick={() => handleResource()} className={`group ${menuStyles.btn}`}>
              <ColumnsIcon fill="currentColor" className="h-6 w-6" aria-hidden="true" />
              <span
                aria-label="number-of-panels"
                className="px-2 ml-1 bg-primary
              text-white  group-hover:bg-white
              group-hover:text-primary inline-flex
              text-xxs leading-5 font-semibold rounded-full"
              >
                {layout + 1}
              </span>
            </button>
            <CustomNofications />
            {/* <button type="button" className={`group ${menuStyles.btn}`}>
              <ReplyIcon fill="currentColor" className="h-6 w-6" aria-hidden="true" />
            </button>
            <button type="button" className={`group ${menuStyles.btn} mx-0`}>
              <ForwardIcon fill="currentColor" className="h-6 w-6" aria-hidden="true" />
            </button>
            <div
              className="flex items-center px-4"
              onClick={() => setOpenStats(true)}
              role="button"
              tabIndex="0"
            >
              <div className="bg-success w-20 h-2 mr-4 rounded overflow-hidden">
                <div className="bg-gray-300 w-10 h-2" />
              </div>
              <span className="text-xxs uppercase font-semibold">
                Saved
                <span className="text-primary"> 5 Mins </span>
              </span>
            </div> */}

            {/* <button
              type="button"
              onClick={() => setOpen(true)}
              className={menuStyles.btn}
            >
              <InformationCircleIcon className="h-6 w-6" aria-hidden="true" />
            </button> */}

          </div>
        </div>
      </nav>

    </>

  );
}
