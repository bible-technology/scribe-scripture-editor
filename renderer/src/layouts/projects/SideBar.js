import Link from 'next/link';
import { useState } from 'react';
// import * as localForage from 'localforage';
import { useTranslation } from 'react-i18next';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import LogoIcon from '@/icons/logo.svg';
import ProjectsIcon from '@/icons/projects.svg';
import NewProjectIcon from '@/icons/new.svg';
import SyncIcon from '@/icons/sync.svg';
import { useGrammartoPerf } from '@/hooks2/useGrammartoPerf';

import AboutModal from '../editor/AboutModal';

const usfmGrammarString = `\\id TIT
    \\h TIT
    \\mt1 TIT
    \\c 1
    \\p
    \\v 1 .verse1..
    \\v 2 .verse2..
    \\v 3 .verse3..
    \\v 4 .verse4..
    \\v 5 ...
    \\v 6 ...
    \\v 7 ...
    \\v 8 ...
    \\v 9 ...
    \\v 10 ...
    \\v 11 ...
    \\v 12 ...
    \\v 13 ...
    \\v 14 ...
    \\v 15 ...
    \\v 16 ...
    \\c 2
    \\p
    \\v 1 ...
    \\v 2 ...
    \\v 3 ...
    \\v 4 ...
    \\v 5 ...
    \\v 6 ...
    \\v 7 ...
    \\v 8 ...
    \\v 9 ...
    \\v 10 ...
    \\v 11 ...
    \\v 12 ...
    \\v 13 ...
    \\v 14 ...
    \\v 15 ...
    \\c 3
    \\p
    \\v 1 ...
    \\v 2 ...
    \\v 3 ...
    \\v 4 ...
    \\v 5 ...
    \\v 6 ...
    \\v 7 ...
    \\v 8 ...
    \\v 9 ...
    \\v 10 ...
    \\v 11 ...
    \\v 12 ...
    \\v 13 ...
    \\v 14 ...
    \\v 15 ...`;

export default function SideBar() {
  const [open, setOpen] = useState(false);
  // const [appMode, setAppMode] = useState();
  const { t } = useTranslation();
  // useEffect(() => {
  //   localForage.getItem('appMode')
  //     .then((value) => {
  //       setAppMode(value);
  //     });
  // }, []);

  const { pathname } = useRouter();

  function openModal(isOpen) {
    setOpen(isOpen);
  }

  const [selected, setselectedBook] = useState('');
  const [perfArr, setPerfArr] = useState([]);

  // Testing HOOk for usfm to perf
  useGrammartoPerf(perfArr, selected);

  return (
    <div className="relative w-28 bg-white shadow min-h-screen">
      <div className="grid justify-items-center items-center h-16 border border-b-1">
        <LogoIcon
          className="h-8 w-8"
          alt="Workflow"
        />
      </div>

      <AboutModal openModal={openModal} open={open} />

      <ul>
        <li className={`text-gray-900 font-medium hover:text-white hover:bg-primary cursor-pointer py-5 group
          ${(pathname === '/projects' || pathname === '/') && !open && 'bg-primary'}`}
        >
          <Link
            href="/projects"
            aria-label="projectList"
            className="flex flex-col items-center px-2"
          >

            <ProjectsIcon
              className="h-5 w-5 lg:h-7 lg:w-7 text-dark group-hover:text-white"
            />
            <div className="text-xs mt-3 uppercase">{t('projects-page')}</div>

          </Link>
        </li>
        <li className={`text-gray-900 font-medium hover:text-white hover:bg-primary cursor-pointer py-5 group ${(pathname === '/newproject' && !open) && 'bg-primary'}`}>
          <Link
            href="/newproject"
            aria-label="new"
            className="flex flex-col items-center"
          >

            <NewProjectIcon
              strokecurrent="black"
              className="h-5 w-5 lg:h-7 lg:w-7 text-dark group-hover:text-white stroke-dark"
            />
            <div className="text-xs mt-3 uppercase">{t('btn-new')}</div>

          </Link>
        </li>
        <li className={`text-gray-900 font-medium hover:text-white hover:bg-primary cursor-pointer py-5
          ${(pathname === '/sync' && !open) && 'bg-primary'}`}
        >
          <Link href="/sync" className="flex flex-col items-center">

            <SyncIcon
              fill="none"
              strokecurrent="none"
              className="h-7 w-7 text-dark group-hover:text-white"
            />
            <div className="text-xs mt-3 uppercase">{t('label-sync')}</div>

          </Link>
        </li>
        {/* Testing link ----------------------------------------------------------================================================= */}
        <li className={`text-gray-900 font-medium hover:text-white hover:bg-primary cursor-pointer py-5
          ${(pathname === '/sync' && !open) && 'bg-primary'}`}
        >
          <button
            onClick={() => {
 setPerfArr([{
    selectors: { org: 'unfoldingWord', lang: 'en', abbr: 'ult' },
    bookCode: 'tit',
    data: usfmGrammarString,
  }]); setselectedBook('TIT');
}}
            className="flex flex-col items-center"
          >

            <SyncIcon
              fill="none"
              strokecurrent="none"
              className="h-7 w-7 text-dark group-hover:text-white"
            />
            <div className="text-xs mt-3 uppercase">PERF</div>

          </button>
        </li>

        <li className={`absolute bottom-0 inset-x-0 text-gray-900 font-medium hover:text-white hover:bg-primary cursor-pointer py-5 ${open && 'bg-primary'}`}>
          {/* <Link href="/sync" className="flex flex-col items-center">

            <SyncIcon
              fill="none"
              strokecurrent="none"
              className="h-7 w-7 text-dark group-hover:text-white"
            />
            <div className="text-xs mt-3 uppercase">{t('label-menu-about')}</div>

          </Link> */}

          <button
            aria-label="about-button"
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded="false"
            className="flex flex-col items-center w-full"
          >
            <InformationCircleIcon
              // fill="none"
              // strokecurrent="none"
              className="h-8 w-8 text-dark group-hover:text-white"
            />
            <span className="text-xs mt-3 uppercase">{t('label-menu-about')}</span>
          </button>
        </li>
        {/* {(appMode === 'online')
          && (
          <li className="text-gray-900 font-medium hover:text-white hover:bg-primary cursor-pointer py-5">
            <Link href="/sync">
              <a className="flex flex-col items-center" href="#sync">
                <SyncIcon
                  fill="none"
                  strokecurrent="none"
                  className="h-7 w-7 text-dark group-hover:text-white"
                />
                <div className="text-xs mt-3 uppercase">{t('label-sync')}</div>
              </a>
            </Link>
          </li>
          )} */}
      </ul>
    </div>
  );
}
