import React, { useEffect } from 'react';
import * as localForage from 'localforage';
import moment from 'moment';
import {
  updateAgSettings,
  updateWebAgSettings,
} from '../../../core/projects/updateAgSettings';
import { isElectron } from '../../../core/handleElectron';
import fetchProjectsMeta from '../../../core/projects/fetchProjectsMeta';
import * as logger from '../../../logger';

function useProjectsSort() {
  const [starredrow, setStarredRow] = React.useState('');
  const [unstarredrow, setUnStarredRow] = React.useState('');
  const [temparray, settemparray] = React.useState(null);
  const [active, setactive] = React.useState('');
  const [orderUnstarred, setOrderUnstarred] = React.useState('asc');
  const [orderByUnstarred, setOrderByUnstarred] = React.useState('name');
  const [starredProjects, setStarredProjets] = React.useState();
  const [unstarredProjects, setUnStarredProjets] = React.useState();
  const [projects, setProjects] = React.useState();
  const [selectedProject, setSelectedProject] = React.useState('');
  const [notifications, setNotifications] = React.useState([]);
  const [callEditProject, setCallEditProject] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [activeNotificationCount, setActiveNotificationCount] = React.useState(0);

  const starrtedData = [];
  const unstarrtedData = [];
  const allProjects = [];

  useEffect(() => {
    if (notifications.length !== 0) {
      localForage.setItem('notification', notifications);
    }
    localForage.getItem('notification').then((val) => {
      if (val === null) {
        localForage.setItem('notification', []);
      }
    });
  }, [notifications]);

  const handleRequestSortUnstarred = (event, property) => {
    logger.debug(
      'useProjectsSort.js',
      `calling unstarred stable sort with value of orderBy=${property}`,
    );
    const isAsc = orderByUnstarred === property && orderUnstarred === 'asc';
    setOrderUnstarred(isAsc ? 'desc' : 'asc');
    setOrderByUnstarred(property);
  };

  const handleDelete = (event, name, property) => {
    logger.debug('useProjectsSort.js', 'calling handleDelete event');
    const selectedIndex = property === 'starred'
      ? starredrow.findIndex((x) => x.name === name)
      : unstarredrow.findIndex((x) => x.name === name);
    logger.debug(
      'useProjectsSort.js',
      `removing the element with name=${name}`,
    );
    /* eslint no-unused-expressions: ["error", { "allowTernary": true }] */
    property === 'starred'
      ? starredrow.splice(selectedIndex, 1)
      : unstarredrow.splice(selectedIndex, 1);
    handleRequestSortUnstarred('asc', 'view');
  };

  // eslint-disable-next-line
  useEffect(() => {
    if (temparray) {
      active === 'starred'
        ? unstarredrow.push(temparray)
        : starredrow.push(temparray);

      settemparray(null);
      setactive('');
    }
    handleRequestSortUnstarred('asc', 'view');
    // eslint-disable-next-line
  }, [temparray, active]);

  const createData = (
    name,
    language,
    date,
    view,
    description,
    id,
    type,
    isArchived,
    starred,
  ) => ({
    name,
    language,
    date,
    view,
    description,
    id,
    type,
    isArchived,
    starred,
  });

  const fetchAllProjects = (
    ProjectName,
    Language,
    createdAt,
    LastView,
    ProjectDescription,
    id,
    type,
    isArchived,
    starred,
  ) => {
    allProjects.push(
      createData(
        ProjectName,
        Language,
        createdAt,
        LastView,
        ProjectDescription,
        id,
        type,
        isArchived,
        starred,
      ),
    );
  };

  const FetchProjects = async () => {
    const userProfile = await localForage.getItem('userProfile');
    const user = isElectron() ? userProfile.username : userProfile.user.email;
    console.log('from project sort', { user });
    if (user) {
      logger.debug('useProjectsSort.js', 'Fetching the projects');
      const projectsData = fetchProjectsMeta({ currentUser: user });
      projectsData.then((value) => {
        console.log('fetchPrjectsmeta', { value });
        if (value) {
          localForage
            .setItem('projectmeta', value)
            .then(() => {
              localForage
                .getItem('projectmeta')
                .then((value) => {
                  if (value) {
                    value.projects.forEach((_project) => {
                      const created = Object.keys(
                        _project.identification.primary
                          .scribe,
                      );
                      let lastSeen;
                      let description;
                      let flavorType;
                      let isArchived;
                      let starred;
                      switch (
                      _project.type.flavorType.flavor
                        .name
                      ) {
                        case 'textTranslation':
                          lastSeen = _project.project
                            ?.textTranslation
                            ?.lastSeen;
                          description = _project.project
                            ?.textTranslation
                            ?.description;
                          isArchived = _project.project
                            ?.textTranslation
                            ?.isArchived;
                            starred = _project.project?.textTranslation?.starred;
                          flavorType = 'Text Translation';
                          break;
                        case 'textStories':
                          lastSeen = _project.project
                            ?.textStories
                            ?.lastSeen;
                          description = _project.project
                            ?.textStories
                            ?.description;
                          isArchived = _project.project
                            ?.textStories
                            ?.isArchived;
                            starred = _project.project?.textStories?.starred;
                          flavorType = 'OBS';
                          break;
                        case 'audioTranslation':
                          lastSeen = _project.project
                            ?.audioTranslation
                            ?.lastSeen;
                          description = _project.project
                            ?.audioTranslation
                            ?.description;
                          isArchived = _project.project
                            ?.audioTranslation
                            ?.isArchived;
                            starred = _project.project?.audioTranslation?.starred;
                          flavorType = 'Audio';
                          break;
                        default:
                          break;
                      }
                      fetchAllProjects(
                        _project.identification.name
                          .en,
                        _project.languages[0].name
                          .en,
                        // _project.identification.primary.scribe[created].timestamp,
                        _project.meta.dateCreated,
                        lastSeen,
                        description,
                        created,
                        flavorType,
                        isArchived,
                        starred,
                      );
                    });
                  }
                })
                .then(() => {
                  setStarredRow(starrtedData);
                  setStarredProjets(starrtedData);
                  setUnStarredRow(unstarrtedData);
                  setUnStarredProjets(unstarrtedData);
                  setProjects(allProjects);
                });
            })
            .catch((err) => {
              logger.error(
                'useProjectsSort.js',
                'Failed to fetch project list',
              );
              // we got an error
              throw err;
            });
        }
      });
    }
  };
  const archiveProject = async (project, name) => {
    const userProfile = await localForage.getItem('userProfile');
    const currentUser = isElectron() ? userProfile?.username : userProfile?.user?.email;

    const projects = await localForage.getItem('projectmeta');
    const updatedProjects = JSON.parse(JSON.stringify(projects));

    updatedProjects.projects.forEach((_project) => {
      if (_project.identification.name.en !== name) { return; }

      const flavorName = _project.type.flavorType.flavor.name;
      const dirNameMap = {
        textTranslation: 'textTranslation',
        textStories: 'textStories',
        audioTranslation: 'audioTranslation',
      };

      const dirName = dirNameMap[flavorName];
      if (!dirName) { return; }

      const status = _project.project[dirName].isArchived;
      _project.project[dirName].isArchived = !status;
      _project.project[dirName].lastSeen = moment().format();

      const id = Object.keys(_project.identification.primary.scribe);
      const projectName = `${name}_${id}`;
      logger.debug('useProjectsSort.js', `Updating archive/restore in scribe settings for ${name}`);

      if (isElectron()) {
        updateAgSettings(currentUser, projectName, _project);
      } else {
        updateWebAgSettings(currentUser, projectName, _project);
      }
    });

    await localForage.setItem('projectmeta', updatedProjects);
    await FetchProjects();
  };

  const handleClickStarred = async (event, name, property) => {
    // Helper Function: Determine directory name
    const getDirName = (flavorName) => {
      const dirNameMap = {
        textTranslation: 'textTranslation',
        textStories: 'textStories',
        audioTranslation: 'audioTranslation',
      };
      return dirNameMap[flavorName];
    };

    // Helper Function: Toggle the starred status of projects
    const toggleStarredStatus = (projects, name) => {
      projects.forEach((project) => {
        if (project.identification.name.en === name) {
          const dirName = getDirName(project.type.flavorType.flavor.name);
          if (dirName) {
            project.project[dirName].starred = !project.project[dirName].starred;
            project.project[dirName].lastSeen = moment().format();
          }
        }
      });
    };

    logger.debug('useProjectsSort.js', 'converting starred to be unstarred and viceversa');

    const isActiveStarred = property === 'starred';
    setactive(isActiveStarred ? 'starred' : 'unstarred');

    const rows = isActiveStarred ? starredrow : unstarredrow;
    const copy = rows.splice(rows.findIndex((x) => x.name === name), 1);

    const userProfile = await localForage.getItem('userProfile');
    const currentUser = isElectron() ? userProfile?.username : userProfile?.user?.email;

    const projectsData = await localForage.getItem('projectmeta');
    if (!projectsData) { return; }

    const projects = JSON.parse(JSON.stringify(projectsData.projects));
    toggleStarredStatus(projects, name);

    await localForage.setItem('projectmeta', { ...projectsData, projects });

    const projectToUpdate = projects.find((project) => project.identification.name.en === name);
    if (projectToUpdate) {
      const id = Object.keys(projectToUpdate.identification.primary.scribe)[0];
      const projectName = `${name}_${id}`;
      logger.debug('useProjectsSort.js', `Updating star/unstar in Scribe settings for ${name}`);
      if (isElectron()) {
        updateAgSettings(currentUser, projectName, projectToUpdate);
      } else {
        updateWebAgSettings(currentUser, projectName, projectToUpdate);
      }
    }

    settemparray(copy[0]);
    await FetchProjects();
  };

  React.useEffect(() => {
    FetchProjects();
    // eslint-disable-next-line
  }, []);

  const response = {
    state: {
      starredrow,
      unstarredrow,
      projects,
      callEditProject,
      orderUnstarred,
      orderByUnstarred,
      starredProjects,
      loading,
      unstarredProjects,
      selectedProject,
      notifications,
      activeNotificationCount,
    },
    actions: {
      handleClickStarred,
      // handleWebClickStarred,
      setCallEditProject,
      handleDelete,
      handleRequestSortUnstarred,
      archiveProject,
      // archiveWebProject,
      setStarredRow,
      setProjects,
      setLoading,
      setUnStarredRow,
      settemparray,
      setactive,
      setOrderUnstarred,
      setOrderByUnstarred,
      FetchProjects,
      setSelectedProject,
      setNotifications,
      setActiveNotificationCount,
    },
  };
  return response;
}
export default useProjectsSort;
