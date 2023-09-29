import React, { useContext, useEffect, useState } from 'react';
import {
  Disclosure,
} from '@headlessui/react';
import {
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import EditorSideBar from '@/modules/editorsidebar/EditorSideBar';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import { ProjectContext } from '@/components/context/ProjectContext';
import { saveReferenceResource } from '@/core/projects/updateAgSettings';
import UserProfile from '@/components/Profile/UserProfile';
import { splitStringByLastOccurance } from '@/util/splitStringByLastMarker';
import styles from './MenuBar.module.css';
import LogoIcon from '@/icons/logo.svg';

export default function TopMenuBar() {
  const {
    states: {
      selectedProject,
      openSideBar,
    },
    actions: {
      setOpenSideBar,
    },
  } = useContext(ProjectContext);

  const {
    state: {
      fontSize,
    },
    actions: {
      setFontsize,
    },
  } = useContext(ReferenceContext);

  const [projectname, setprojectname] = useState(undefined);

  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      if (selectedProject && !projectname) {
        const splitProjectName = await splitStringByLastOccurance(selectedProject, '_');
        setprojectname(splitProjectName);
      }
    })();
  }, [selectedProject, projectname]);

  function closeSideBar(open) {
    setOpenSideBar(open);
  }
  const handleFontSize = (status) => {
    if (status === 'dec' && fontSize > 0.70) {
      setFontsize(fontSize - 0.2);
    }
    if (status === 'inc' && fontSize < 2) {
      setFontsize(fontSize + 0.2);
    }
  };
  const goToProjectPage = async () => {
    saveReferenceResource();
    router.push('/projects');
  };

  return (
    <>
      <EditorSideBar isOpen={openSideBar} closeSideBar={closeSideBar} />
      <Disclosure
        as="nav"
        className="flex items-center h-16 border-b border-gray-200"
      >
        {() => (
          <>
            <button className="h-full px-5 border-r border-gray-200" title={t('label-back')} type="button" onClick={() => goToProjectPage()}>
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <div className="h-full w-20 grid justify-items-center items-center border-r border-gray-200 hover:text-primary">
              <LogoIcon
                className="h-8 w-8"
                alt="Workflow"
              />
            </div>
            <div>
              <span aria-label="editor-project-name" className="text-primary px-10 py-2 text-lg tracking-wide font-bold uppercase" title={t('label-project-name')}>
                {projectname?.[0]}
              </span>
            </div>
            <div className="flex-grow">
              <div className="mt-1 relative w-2/5 m-auto focus:ring-primary focus:border-primary bg-gray-100 block rounded-md sm:text-sm border-none placeholder-gray-700">
                {/* <div className="absolute inset-y-0 left-0 pl-3
                flex items-center pointer-events-none">
                  <span className="text-gray-300 sm:text-sm">
                    <MagnifyingGlassIcon className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  className="bg-gray-100 focus:ring-primary
                  focus:border-primary block w-full pl-10 sm:text-sm border-none rounded-md"
                  placeholder="Search"
                  // onClick={openSideBars}
                /> */}
              </div>
            </div>
            <div className="flex justify-end">
              <div className="mr-4 flex items-center">
                {/* <PopoverProjectType items={solutions}>
                  <button type="button" className={styles.btn}>
                    <AppsIcon
                      fill="currentColor"
                      className="h-6 w-6"
                      aria-hidden="true"
                    />
                  </button>
                </PopoverProjectType> */}
                <button type="button" className={styles.btn}>
                  <div
                    aria-label="decrease-font"
                    onClick={() => { handleFontSize('dec'); }}
                    role="button"
                    tabIndex="0"
                    title={t('tooltip-editor-font-dec')}
                    className="h6 w-6 hover:text-black font-bold border-r border-gray-200 text-center"
                  >
                    {t('label-editor-font-char')}
                  </div>
                  <div
                    aria-label="increase-font"
                    className="h6 w-6 hover:text-black font-bold text-lg text-center"
                    onClick={() => { handleFontSize('inc'); }}
                    role="button"
                    title={t('tooltip-editor-font-inc')}
                    tabIndex="0"
                  >
                    {t('label-editor-font-char')}
                  </div>
                </button>
                {/* <button type="button" className={styles.btn}>
                  <ExpandIcon fill="currentColor" className="h-6 w-6" aria-hidden="true" />
                </button>
                <button type="button" className={styles.btnDark}>
                  <SunIcon className="h-6 w-6" aria-hidden="true" />
                </button> */}

                {/* Profile dropdown */}
                <UserProfile />
              </div>
            </div>

          </>
        )}
      </Disclosure>
    </>
  );
}
