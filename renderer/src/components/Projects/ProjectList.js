/* eslint-disable react/jsx-no-useless-fragment */
import { useState, useContext } from 'react';

import { useTranslation } from 'react-i18next';
import ProjectsLayout from '@/layouts/projects/Layout';
import EnhancedTableHead from '@/components/ProjectsPage/Projects/EnhancedTableHead';
import { AutographaContext } from '@/components/context/AutographaContext';

import ExportProjectPopUp from '@/layouts/projects/Export/ExportProjectPopUp';
// import ProjectContextProvider from '@/components/context/ProjectContext';
// import AuthenticationContextProvider from '@/components/Login/AuthenticationContextProvider';
import { LoadingSpinner } from '../LoadingSpinner';
import SearchTags from './SearchTags';
import NewProject from './NewProject';
import * as logger from '../../logger';
import ProjectRow from './ProjectRow';
import { ProjectContext } from '../context/ProjectContext';
import ProjectMangement from '../ProjectManagement/ProjectManagement';

export default function ProjectList() {
  const { t } = useTranslation();
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [showArchived, setShowArchived] = useState(false);

  const filterList = ['name', 'language', 'type', 'date', 'view'];
  const {
    states: {
      projects,
      callEditProject,
    },
    action: {
      handleClickStarred,
      setCallEditProject,
      FetchProjects,
    },
  } = useContext(AutographaContext);
  const { states: { openExportPopUp, openManageProject }, actions: { setOpenExportPopUp, setOpenManageProject } } = useContext(ProjectContext);
  const [currentProject, setCurrentProject] = useState();
  const [filteredProjects, setFilteredProjects] = useState(projects);
  const handleExportPopUp = (project) => {
    setCurrentProject(project);
    setOpenExportPopUp(true);
  };
  const closeExportPopUp = () => {
    setOpenExportPopUp(false);
  };
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const closeEditProject = async () => {
    logger.debug('ProjectList.js', 'Closing edit project page and updating the values');
    setCallEditProject(false);
    await FetchProjects();
  };
  const manageProject = (project) => {
    setCurrentProject(project);
    setOpenManageProject(true);
  };
  const closeManageProject = () => {
    setOpenManageProject(false);
  };
  return (
    <>
      {!callEditProject ? (
        <ProjectsLayout
          title={t('projects-page')}
          archive="enable"
          isImport
          showArchived={showArchived}
          setShowArchived={setShowArchived}
          header={(
            <SearchTags
              contentList1={projects}
              // contentList2={projects}
              filterList={filterList}
              onfilerRequest1={setFilteredProjects}
              // onfilerRequest2={setProjects}
            />
          )}
        >
          <div className="mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-4 sm:px-0">

              <div className="flex flex-col">
                <div className="-my-2 sm:-mx-6 lg:-mx-8">
                  <div className="align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="shadow border-b border-gray-200 sm:rounded-lg">
                      {projects ? (
                        <table data-testid="tablelayout" id="projects-list" className="min-w-full divide-y divide-gray-200 mb-9">
                          <EnhancedTableHead
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={handleRequestSort}
                          />
                          <ProjectRow projects={projects} filteredProjects={filteredProjects} order={order} orderBy={orderBy} showArchived={showArchived} openExportPopUp={handleExportPopUp} setCurrentProject={setCurrentProject} handleClickStarred={handleClickStarred} manageProject={manageProject} />

                        </table>
                      ) : (
                        <div
                          className="bg-gray-50"
                          style={{ height: '82vh' }}
                        >
                          <LoadingSpinner />
                        </div>

                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </ProjectsLayout>
      ) : <NewProject call="edit" project={currentProject} closeEdit={() => closeEditProject()} />}
      <ExportProjectPopUp open={openExportPopUp} closePopUp={closeExportPopUp} project={currentProject} />
      {openManageProject
      && <ProjectMangement open={openManageProject} closePopUp={closeManageProject} project={currentProject} />}
    </>
  );
}
