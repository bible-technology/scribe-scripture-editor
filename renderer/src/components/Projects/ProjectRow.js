import React, { Fragment, useContext } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import {
  StarIcon, EllipsisVerticalIcon, ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import moment from 'moment';
import { getComparator, stableSort } from '@/components/ProjectsPage/Projects/SortingHelper';
import { AutographaContext } from '@/components/context/AutographaContext';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import useEditProject from './hooks/useEditProject';
import useHandleSelectProject from './hooks/useSelectProject';
import NewProjectIcon from '@/icons/new.svg';
import { ProjectContext } from '../context/ProjectContext';

const ProjectRow = ({
  projects, order, orderBy, showArchived, openExportPopUp, handleClickStarred, setCurrentProject, filteredProjects,
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { editProject } = useEditProject();
  const { handleSelectProject } = useHandleSelectProject();
  const { actions: { setOpenImportPopUp } } = useContext(ProjectContext);

  const {
    states: {
      activeNotificationCount,
    },
    action: {
      archiveProject,
      setSelectedProject,
      setNotifications,
      setCallEditProject,
      setActiveNotificationCount,
    },
  } = useContext(AutographaContext);

  const archivedProjects = projects?.filter((project) => project.isArchived === true);

  function filterArchive(project) {
    if (project.isArchived === showArchived) {
      return true;
    } if (project.isArchived === undefined && showArchived === false) {
      return true;
    }
    return false;
  }

  function sortStarred(a, b) {
    if (a.starred === b.starred) {
      return 0;
    }
    if (a.starred && !b.starred) {
      return -1;
    } if (!a.starred && b.starred) {
      return 1;
    }
    return 0;
  }

  return (
    <tbody className="bg-white divide-y divide-gray-200" id="projects-list-body">
      {((projects?.length === 0 && filteredProjects?.length > 0) || (!showArchived && projects?.length === archivedProjects?.length)) && (
        <tr>
          <td colSpan="7" className="space-y-7 px-6 py-28 whitespace-nowrap text-center">
            <h2 className="font-medium text-gray-500 tracking-wide">You don&apos;t have any projects yet</h2>
            <button type="button" className="font-bold leading-3 tracking-wider text-sm m-auto bg-primary rounded-full py-2 px-5">
              <Link href="/newproject" className="flex items-center gap-2">
                <NewProjectIcon
                  className="h-5 w-5 stroke-white"
                />
                <span className="text-white uppercase">Create project</span>
              </Link>
            </button>
            <button
              aria-label="import"
              type="button"
              className="flex m-auto text-white font-bold text-sm px-5 py-2 rounded-full
                                    leading-3 tracking-wider uppercase bg-primary items-center"
              onClick={() => setOpenImportPopUp(true)}
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2 text-white" />
              {t('btn-import')}
            </button>
          </td>
        </tr>
      )}
      {
       projects?.length > 0 && filteredProjects?.length === 0 && (
       <tr>
         <td colSpan="7" className="space-y-7 px-6 py-28 whitespace-nowrap text-center">
           <h2 className="font-medium text-gray-500 tracking-wide">No projects found. Try a different search term.</h2>
         </td>
       </tr>
        )
      }
      {
        showArchived && projects?.length !== 0 && archivedProjects?.length === 0 && (
          <tr>
            <td colSpan="7" className="space-y-7 px-6 py-28 whitespace-nowrap text-center">
              <h2 className="font-medium text-gray-500 tracking-wide">There are no archived projects.</h2>
            </td>
          </tr>
        )
      }
      {projects?.length !== 0 && filteredProjects && (stableSort(
        filteredProjects,
        getComparator(order, orderBy),
        orderBy,
        order,
      ).filter(filterArchive).sort(sortStarred).map((project) => (
        <Disclosure key={project.id[0]}>
          {({ open }) => (
            <>
              <tr
                className="hover:bg-gray-100 focus:outline-none cursor-pointer"
                onClick={
                  (event) => (showArchived ? '' : handleSelectProject(event, project.name, project.id[0], router, activeNotificationCount, setSelectedProject, setNotifications, setActiveNotificationCount))
                }
              >
                <td
                  className="px-4 py-4"
                >
                  <button
                    title={project.starred ? 'unstar-project' : 'star-project'}
                    aria-label={project.starred ? 'unstar-project' : 'star-project'}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleClickStarred(event, project.name, project.starred ? 'unstarred' : 'starred');
                    }}
                    type="button"
                  >
                    {project.starred
                      ? <StarIcon className="h-5 w-5 fill-current text-yellow-400" aria-hidden="true" />
                      : <StarIcon className="h-5 w-5" aria-hidden="true" />}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="ml-0">
                      <div
                        id={`${project.name}`}
                        role="button"
                        aria-label={project.starred ? 'unstar-project-name' : 'star-project-name'}
                        tabIndex="0"
                        className="text-sm font-medium text-gray-900"
                      >
                        {project.name}

                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{project.language}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{project.type}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{moment(project.date).format('LL')}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{moment(project.view, 'YYYY-MM-DD h:mm:ss').fromNow()}</td>
                <td
                  className="px-6 py-4 text-right text-sm font-medium flex items-center relative"
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                >
                  <Disclosure.Button
                    className="flex  w-full px-1 py-2 text-sm font-medium text-left text-gray-500 rounded-lg focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75"
                  >
                    {open
                      ? <ChevronUpIcon aria-label="arrow-up" className="w-5 h-5 text-gray-500 hover:text-purple-600" />
                      : <ChevronDownIcon aria-label="expand-project" className="w-5 h-5 text-gray-500 hover:text-purple-600" />}
                  </Disclosure.Button>
                  <Menu as="div">
                    <div>
                      <Menu.Button className="px-1">
                        <EllipsisVerticalIcon className="h-5 w-5 text-primary" aria-label="menu-project" aria-hidden="true" />
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 font-normal top-14 w-56 mb-1 z-50 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="px-1 py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                type="button"
                                aria-label="edit-project"
                                className={`${active ? 'bg-primary text-white' : 'text-gray-900'
                                  } group rounded-md items-center w-full px-2 py-2 text-sm ${project.isArchived ? 'hidden' : 'flex'}`}
                                onClick={() => editProject(project, setCurrentProject, setCallEditProject)}
                              >
                                {t('btn-edit')}
                              </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                type="button"
                                aria-label="export-project"
                                className={`${active ? 'bg-primary text-white' : 'text-gray-900'
                                  } group rounded-md items-center w-full px-2 py-2 text-sm ${project.isArchived ? 'hidden' : 'flex'}`}
                                onClick={() => openExportPopUp(project)}
                              >
                                {t('btn-export')}
                              </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                type="button"
                                aria-label="archive-restore-project"
                                className={`${active ? 'bg-primary text-white' : 'text-gray-900'
                                  } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                onClick={() => {
                                  archiveProject(project, project.name);
                                }}
                              >
                                {project.isArchived === true ? t('label-restore') : t('label-archive')}
                              </button>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </td>
              </tr>
              <Transition
                as={Fragment}
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
              >
                <Disclosure.Panel as="tr" key={project.name}>
                  <td aria-label="empty column" />
                  <td colSpan={2} className="px-6 py-4">
                    <div className="text-xxs uppercase font-regular text-gray-500 tracking-wider p-1">{t('label-description')}</div>
                    <div
                      title={project.description}
                      aria-label="project-description-display"
                      className="text-sm tracking-wide md:max-w-[200px] lg:max-w-[400px] xl:max-w-[550px] p-1 overflow-hidden truncate"
                    >
                      {project.description}

                    </div>
                  </td>
                  <td colSpan="2" className="px-5">
                    <div className="text-xxs uppercase font-regular text-gray-500 tracking-wider p-1">{t('label-project-id')}</div>
                    <div className="text-sm tracking-wide p-1">{project.id[0]}</div>
                  </td>
                </Disclosure.Panel>

              </Transition>
            </>
          )}
        </Disclosure>
      ))
      )}
    </tbody>
  );
};

export default ProjectRow;
