import { useState, useEffect } from 'react';
import * as localForage from 'localforage';
import * as logger from '../../../logger';
import fetchProjectsMeta from '../../../core/projects/fetchProjectsMeta';
import { getOrPutLastSyncInAgSettings } from '../Scribe/SyncToGiteaUtils';

function useSync() {
  const projectList = [];
  const projectMetaData = [];
  const [agProjects, setAgProjects] = useState([]);
  const [agProjectsMeta, setAgProjectsMeta] = useState([]);
  const [selectedAgProject, setSelectedAgProject] = useState(undefined);
  const [selectedGiteaProjectBranch, setSelectedGiteaProjectBranch] = useState([]);
  const [selectedGiteaProject, setSelectedGiteaProject] = useState({
    repo: null,
    branch: null,
    metaDataSB: null,
    localUsername: null,
    auth: null,
    mergeStatus: false,
  });
  const [syncProgress, setSyncProgress] = useState({
    syncStarted: false,
    totalFiles: 0,
    completedFiles: 0,
  });
  const [refreshGiteaListUI, setRefreshGiteaListUI] = useState({ triger: false, timeOut: false });

  const fetchProjects = async () => {
    logger.debug('UseSync.js', 'calling fetchProjects event');
    localForage.getItem('userProfile').then((user) => {
      fetchProjectsMeta({ currentUser: user?.username })
      .then(async (value) => {
        for (let i = 0; i < value.projects.length; i++) {
          projectList.push(value.projects[i].identification.name.en);
          // find the lastSync data
          // eslint-disable-next-line no-await-in-loop
          const syncObj = await getOrPutLastSyncInAgSettings('get', value.projects[i]);
          value.projects[i].lastSync = syncObj;
          projectMetaData.push(value.projects[i]);
        }
    }).finally(() => {
      logger.debug('UseSync.js', 'Updating project List');
      setAgProjectsMeta(projectMetaData);
      setAgProjects(projectList);
    });
    });
  };

  // to refresh both sides on completion of sync to update UI
  useEffect(() => {
    if (syncProgress.syncStarted && !refreshGiteaListUI.triger) {
      setRefreshGiteaListUI({ ...refreshGiteaListUI, triger: true });
    }
    if (!syncProgress.syncProgress && refreshGiteaListUI.triger) {
      setRefreshGiteaListUI({ ...refreshGiteaListUI, timeOut: true });
      setTimeout(async () => {
        setRefreshGiteaListUI({ ...refreshGiteaListUI, triger: false, timeOut: false });
        await fetchProjects();
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncProgress.syncStarted]);

  const response = {
    state: {
      agProjects,
      agProjectsMeta,
      selectedAgProject,
      syncProgress,
      selectedGiteaProject,
      refreshGiteaListUI,
      selectedGiteaProjectBranch,
    },
    actions: {
      fetchProjects,
      setSelectedAgProject,
      setSyncProgress,
      setSelectedGiteaProject,
      setRefreshGiteaListUI,
      setSelectedGiteaProjectBranch,
    },
  };
  return response;
}
export default useSync;
