/* eslint-disable react/jsx-no-useless-fragment */
import React, { Fragment, useState } from 'react';
import { useRouter } from 'next/router';
import moment from 'moment';

import { Disclosure, Transition, Menu } from '@headlessui/react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import {
  StarIcon, EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';
import localforage from 'localforage';

import { useTranslation } from 'react-i18next';
import ProjectsLayout from '@/layouts/projects/Layout';
import EnhancedTableHead from '@/components/ProjectsPage/Projects/EnhancedTableHead';
import AutographaContextProvider, { AutographaContext } from '@/components/context/AutographaContext';
import { getComparator, stableSort } from '@/components/ProjectsPage/Projects/SortingHelper';

import ExportProjectPopUp from '@/layouts/projects/Export/ExportProjectPopUp';
import ProjectContextProvider from '@/components/context/ProjectContext';
import AuthenticationContextProvider from '@/components/Login/AuthenticationContextProvider';
import LoadingScreen from '@/components/Loading/LoadingScreen';
import SearchTags from './SearchTags';
import NewProject from './NewProject';
import * as logger from '../../logger';
import packageInfo from '../../../../package.json';
import { environment } from '../../../environment';

export default function ProjectList() {
  const router = useRouter();
  const { t } = useTranslation();
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [showArchived, setShowArchived] = useState(false);

  const filterList = ['name', 'language', 'type', 'date', 'view'];
  const {
    states: {
      starredrow,
      unstarredrow,
      starredProjects,
      unstarredProjects,
      activeNotificationCount,
    },
    action: {
      setStarredRow,
      setUnStarredRow,
      handleClickStarred,
      archiveProject,
      setSelectedProject,
      setNotifications,
      setActiveNotificationCount,
      FetchProjects,
    },
  } = React.useContext(AutographaContext);
  const [callEditProject, setCallEditProject] = useState(false);
  const [openPopUp, setOpenPopUp] = useState(false);
  const [currentProject, setCurrentProject] = useState();
  const openExportPopUp = (project) => {
    setCurrentProject(project);
    setOpenPopUp(true);
  };
  const closeExportPopUp = () => {
    setOpenPopUp(false);
  };
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectProject = (event, projectName, projectId) => {
    logger.debug('ProjectList.js', 'In handleSelectProject');
    console.log({ projectName });
    setSelectedProject(projectName);
    localforage.setItem('currentProject', `${projectName}_${projectId}`);
    router.push('/home');
    localforage.getItem('notification').then((value) => {
      const temp = [...value];
      temp.push({
        title: 'Project',
        text: `successfully loaded ${projectName} files`,
        type: 'success',
        time: moment().format(),
        hidden: true,
      });
      setNotifications(temp);
    }).then(() => setActiveNotificationCount(activeNotificationCount + 1));
  };

  const editproject = async (project) => {
    logger.debug('ProjectList.js', 'In editproject');
    const path = require('path');
    const fs = window.require('fs');
    const newpath = localStorage.getItem('userPath');
    await localforage.getItem('userProfile').then((value) => {
      const folder = path.join(newpath, packageInfo.name, 'users', value.username, 'projects', `${project.name}_${project.id[0]}`);
      const data = fs.readFileSync(path.join(folder, 'metadata.json'), 'utf-8');
      let metadata = JSON.parse(data);
      const firstKey = Object.keys(metadata.ingredients)[0];
      const folderName = firstKey.split(/[(\\)?(/)?]/gm).slice(0, -1);
      let dirName = '';
      folderName.forEach((folder) => {
        dirName = path.join(dirName, folder);
      });
      const settings = fs.readFileSync(path.join(folder, dirName, environment.PROJECT_SETTING_FILE), 'utf-8');
      const agSetting = JSON.parse(settings);
      metadata = { ...metadata, ...agSetting };
      logger.debug('ProjectList.js', 'Loading current project metadata');
      setCurrentProject(metadata);
      setCallEditProject(true);
    });
  };

  const closeEditProject = async () => {
    logger.debug('ProjectList.js', 'Closing edit project page and updating the values');
    setCallEditProject(false);
    await FetchProjects();
  };
  // checking if isArchived is true show projects in archive tab else project tab
  function filterArchive(project) {
    if (project.isArchived === showArchived) {
      return true;
    } if (project.isArchived === undefined && showArchived === false) {
      return true;
    }
    return false;
  }
  return (
    <>
      {callEditProject === false
        ? (
          <>
            <ProjectsLayout
              title={t('projects-page')}
              archive="enable"
              isImport
              showArchived={showArchived}
              setShowArchived={setShowArchived}
              header={(
                <SearchTags
                  contentList1={starredProjects}
                  contentList2={unstarredProjects}
                  filterList={filterList}
                  onfilerRequest1={setStarredRow}
                  onfilerRequest2={setUnStarredRow}
                />
              )}
            >
              <div className="mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-4 sm:px-0">

                  <div className="flex flex-col">
                    <div className="-my-2 sm:-mx-6 lg:-mx-8">
                      <div className="align-middle inline-block min-w-full sm:px-6 lg:px-8">
                        <div className="shadow border-b border-gray-200 sm:rounded-lg">
                          <table id="projects-list" data-testid="tablelayout" className="min-w-full divide-y divide-gray-200 mb-9">
                            <EnhancedTableHead
                              order={order}
                              orderBy={orderBy}
                              onRequestSort={handleRequestSort}
                            />
                            <tbody id="projects-list-star" className="bg-white divide-y divide-gray-200">
                              {starredrow && (stableSort(
                                starredrow,
                                getComparator(order, orderBy),
                                orderBy,
                                order,
                              ).filter(filterArchive).map((project) => (
                                <Disclosure key={project.name}>
                                  {({ open }) => (
                                    <>
                                      <tr
                                        className="hover:bg-gray-100 focus:outline-none cursor-pointer"
                                      >
                                        <td className="px-4 py-4">
                                          <button
                                            title={t('tooltip-star-project')}
                                            aria-label="star-project"
                                            onClick={(event) => handleClickStarred(event, project.name, 'starred')}
                                            type="button"
                                          >
                                            <StarIcon className="h-5 w-5 fill-current text-yellow-400" aria-hidden="true" />
                                          </button>
                                        </td>
                                        {/* <td className="px-4 py-4">
                                      <button
                                        type="button"
                                        title="open project"
                                        onClick={
                                          (event) => handleSelectProject(event, project.name, project.id[0])
                                        }
                                      >
                                        <ExternalLinkIcon className="h-5 w-5 text-primary" aria-hidden="true" />
                                      </button>
                                    </td> */}
                                        <td className="px-6 py-4">
                                          <div
                                            onClick={
                                              (event) => handleSelectProject(event, project.name, project.id[0])
                                            }
                                            role="button"
                                            id={`${project.name}`}
                                            aria-label="project-name"
                                            tabIndex="0"
                                            className="focus:outline-none text-sm font-medium text-gray-900"
                                          >
                                            {project.name}
                                          </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{project.language}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{project.type}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{moment(project.date).format('LL')}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{moment(project.view, 'YYYY-MM-DD h:mm:ss').fromNow()}</td>

                                        <td className="px-6 py-4 text-right text-sm font-medium flex justify-end">
                                          <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left text-gray-200 rounded-lg focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75">
                                            {open
                                              ? <ChevronUpIcon aria-label="star-arrow-up" className="w-5 h-5 text-gray-500 hover:text-purple-600" />
                                              : <ChevronDownIcon aria-label="star-expand-project" className="w-5 h-5 text-gray-500 hover:text-purple-600" />}
                                          </Disclosure.Button>
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
                                          <td className="px-6 py-4">
                                            <div className="text-xxs uppercase font-regular text-gray-500 tracking-wider p-1">{t('label-description')}</div>
                                            <div className="text-sm tracking-wide p-1">{project.description}</div>
                                          </td>
                                          <td colSpan="3" className="px-5">
                                            <div className="text-xxs uppercase font-regular text-gray-500 tracking-wider p-1">{t('label-project-id')}</div>
                                            <div className="text-sm tracking-wide p-1">{project.id[0]}</div>
                                          </td>
                                          <td className="pl-5">

                                            <Menu as="div">
                                              <div>
                                                <Menu.Button className="px-5">
                                                  <EllipsisVerticalIcon aria-label="star-menu-project" className="h-5 w-5 text-primary" aria-hidden="true" />
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
                                                <Menu.Items className="fixed right-26 top-4 w-56 mt-2 z-50 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                  <div className="px-1 py-1 ">
                                                    <Menu.Item>
                                                      {({ active }) => (
                                                        <button
                                                          type="button"
                                                          aria-label="edit-project"
                                                          className={`${active ? 'bg-primary text-white' : 'text-gray-900'
                                                            } group flex rounded-md items-center w-full px-2 py-2 text-sm ${project.isArchived ? 'hidden' : 'flex'}`}
                                                          onClick={() => editproject(project)}
                                                        >
                                                          {t('btn-edit')}
                                                        </button>
                                                      )}
                                                    </Menu.Item>
                                                    <Menu.Item>
                                                      {({ active }) => (
                                                        <button
                                                          type="button"
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
                                        </Disclosure.Panel>
                                      </Transition>
                                    </>
                                  )}
                                </Disclosure>
                              ))
                              )}
                            </tbody>
                            <tbody id="projects-list-unstar" className="bg-white divide-y divide-gray-200">
                              {unstarredrow && (stableSort(
                                unstarredrow,
                                getComparator(order, orderBy),
                                orderBy,
                                order,
                              ).filter(filterArchive).map((project) => (
                                <Disclosure key={project.id[0]}>
                                  {({ open }) => (
                                    <>
                                      <tr className="hover:bg-gray-100 focus:outline-none cursor-pointer">
                                        <td
                                          className="px-4 py-4"
                                        >
                                          <button
                                            title={t('tooltip-un-star-project')}
                                            aria-label="unstar-project"
                                            onClick={(event) => handleClickStarred(event, project.name, 'unstarred')}
                                            type="button"
                                          >
                                            <StarIcon className="h-5 w-5" aria-hidden="true" />
                                          </button>
                                        </td>
                                        {/* <td className="px-4 py-4">
                                            <button
                                              type="button"
                                              title="open project"
                                              onClick={
                                                (event) => handleSelectProject(event, project.name, project.id[0])
                                              }
                                            >
                                              <ExternalLinkIcon className="h-5 w-5 text-primary" aria-hidden="true" />
                                            </button>
                                          </td> */}
                                        <td className="px-6 py-4">
                                          <div className="flex items-center">
                                            <div className="ml-0">
                                              <div
                                                id={`${project.name}`}
                                                onClick={
                                                  (event) => handleSelectProject(event, project.name, project.id[0])
                                                }
                                                role="button"
                                                aria-label="unstar-project-name"
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
                                        <td className="px-6 py-4 text-right text-sm font-medium">
                                          <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left text-gray-500 rounded-lg focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75">
                                            {open
                                              ? <ChevronUpIcon aria-label="unstar-arrow-up" className="w-5 h-5 text-gray-500 hover:text-purple-600" />
                                              : <ChevronDownIcon aria-label="unstar-expand-project" className="w-5 h-5 text-gray-500 hover:text-purple-600" />}
                                          </Disclosure.Button>
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
                                          <td className="px-6 py-4">
                                            <div className="text-xxs uppercase font-regular text-gray-500 tracking-wider p-1">{t('label-description')}</div>
                                            <div aria-label="project-description-display" className="text-sm tracking-wide p-1">{project.description}</div>
                                          </td>
                                          <td colSpan="3" className="px-5">
                                            <div className="text-xxs uppercase font-regular text-gray-500 tracking-wider p-1">{t('label-project-id')}</div>
                                            <div className="text-sm tracking-wide p-1">{project.id[0]}</div>
                                          </td>
                                          <td className="pl-5">
                                            <Menu as="div">
                                              <div>
                                                <Menu.Button className="px-5">
                                                  <EllipsisVerticalIcon className="h-5 w-5 text-primary" aria-label="unstar-menu-project" aria-hidden="true" />
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
                                                <Menu.Items className="fixed right-26 top-4 w-56 mb-1 z-50 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                  <div className="px-1 py-1">
                                                    <Menu.Item>
                                                      {({ active }) => (
                                                        <button
                                                          type="button"
                                                          aria-label="edit-project"
                                                          className={`${active ? 'bg-primary text-white' : 'text-gray-900'
                                                            } group rounded-md items-center w-full px-2 py-2 text-sm ${project.isArchived ? 'hidden' : 'flex'}`}
                                                          onClick={() => editproject(project)}
                                                        >
                                                          {t('btn-edit')}
                                                        </button>
                                                      )}
                                                    </Menu.Item>
                                                    <Menu.Item>
                                                      {({ active }) => (
                                                        <button
                                                          type="button"
                                                          aria-label="unstar-export-project"
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
                                                          aria-label="unstar-archive-restore-project"
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
                                        </Disclosure.Panel>

                                      </Transition>
                                    </>
                                  )}
                                </Disclosure>
                              ))
                              )}
                            </tbody>
                          </table>
                          {(!starredrow || !unstarredrow) && <div><LoadingScreen /></div>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </ProjectsLayout>
            <ExportProjectPopUp open={openPopUp} closePopUp={closeExportPopUp} project={currentProject} />
          </>
        )
        : (
          <AuthenticationContextProvider>
            <AutographaContextProvider>
              <ProjectContextProvider>
                <NewProject call="edit" project={currentProject} closeEdit={() => closeEditProject()} />
              </ProjectContextProvider>
            </AutographaContextProvider>
          </AuthenticationContextProvider>
        )}
    </>
  );
}
