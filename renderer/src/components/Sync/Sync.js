import { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import ProjectsLayout from '@/layouts/projects/Layout';
import AuthenticationContextProvider from '@/components/Login/AuthenticationContextProvider';
import ProjectContextProvider from '@/components/context/ProjectContext';
import ReferenceContextProvider from '@/components/context/ReferenceContext';
import {
  CloudArrowDownIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/24/outline';
import { SnackBar } from '@/components/SnackBar';
import useAddNotification from '@/components/hooks/useAddNotification';
import ConfirmationModal from '@/layouts/editor/ConfirmationModal';
import * as localforage from 'localforage';
import { SyncContext } from '../context/SyncContext';
import { uploadToGitea } from './Scribe/SyncToGitea';
import { downloadFromGitea } from './Gitea/SyncFromGitea';
import { cloneAndSetProject, updateSettingsFiles } from './Gitea/SyncFromGiteaUtils';
import { checkoutJsonFiles, pullProject } from './Isomorphic/utils';
import Gitea from './Gitea/Gitea';
import ProjectFileBrowser from './Scribe/ProjectFileBrowser';
import Door43Logo from '@/icons/door43.svg';
import * as logger from '../../logger';

export default function Sync() {
  const { t } = useTranslation();
  const [auth, setAuth] = useState(undefined);
  const [repo, setRepo] = useState(undefined);
  const [pullPopUp, setPullPopup] = useState({ status: false });
  const [pullData, setPullData] = useState();

  const [snackBar, setOpenSnackBar] = useState(false);
  const [snackText, setSnackText] = useState('');
  const [notify, setNotify] = useState();
  const [logout, setLogout] = useState(false);

  const {
    states: {
      selectedAgProject, syncProgress, selectedGiteaProjectBranch,
    },
    action: {
      setSyncProgress, setSelectedGiteaProject,
    },
  } = useContext(SyncContext);

  const { addNotification } = useAddNotification();

  function notifyStatus(status, message) {
    setNotify(status);
    setSnackText(message);
    setOpenSnackBar(true);
  }

  const handleCloudSync = async (projectData, authData, setSyncProgress) => {
    if (!auth) {
      notifyStatus('failure', 'Authentication Failed! , login and try again');
    } else if (!projectData?.projectName) {
      notifyStatus('warning', 'select a project to sync');
    } else {
      await uploadToGitea(projectData, authData, setSyncProgress, notifyStatus, addNotification, setPullPopup);
    }
  };

  const handleOfflineSync = async (currentRepo, currentAuth) => {
    if (currentAuth && currentRepo && selectedGiteaProjectBranch?.name) {
      logger.debug('Sync.js', 'in offlineSync Started');
      await downloadFromGitea(currentRepo, currentAuth, setSyncProgress, notifyStatus, setSelectedGiteaProject, addNotification, selectedGiteaProjectBranch.name, setPullPopup, setPullData, t);
      logger.debug('Sync.js', 'in offlineSync Finished');
    } else if (!selectedGiteaProjectBranch?.name) {
      logger.debug('Sync.js', 'Do select a branch');
      notifyStatus('warning', 'Do select a branch');
    } else {
      logger.debug('Sync.js', 'in offlineSync Sync Failed , Something Wrong, may be internet issue');
      notifyStatus('failure', 'Something went wrong! , login and try again');
    }
  };

  const continuePullAction = async () => {
    if (pullData) {
      if (pullPopUp?.type === 'overwrite') {
        // for pull without conflict
        const checkoutFIles = await checkoutJsonFiles(pullData.fs, pullData.gitprojectDir, pullData.checkoutBranch);
        const pullStatus = checkoutFIles && await pullProject(pullData.fs, pullData.gitprojectDir, pullData.userBranch, auth.token.sha1, pullData.checkoutBranch);
        pullStatus?.status && await updateSettingsFiles(
          pullData.fs,
          pullData.sbDataObject,
          pullData.projectDir,
          pullData.projectName,
          pullData.id,
          pullData.currentUser,
          pullData.updateBurrito,
          pullData.action,
        );
        logger.debug('Sync.js', 'Project Sync to scribe successfull, overwirte with server changes');
        await notifyStatus('success', 'Project Sync to scribe successfull');
        await addNotification('Sync', 'Project Sync Successfull', 'success');
      } else {
        // delete project + clone the project
        const exist = await pullData?.fs.existsSync(pullData?.gitprojectDir);
        // let clone = true;
        if (exist) {
          await pullData?.fs.rmdir((pullData?.gitprojectDir), { recursive: true }, async (err) => {
            if (err) {
              logger.debug('Sync.js', 'Error removing project directory for clone');
              // throw new Error(`Remove Resource failed :  ${err}`);
              // clone = false;
            } else {
              // call clone
              const cloneStatus = await cloneAndSetProject(
                pullData.fs,
                pullData.gitprojectDir,
                pullData.repo,
                pullData.userBranch,
                pullData.auth,
                pullData.checkoutBranch,
              );
                // continue settings file writing
              cloneStatus && await updateSettingsFiles(
                pullData.fs,
                pullData.sbDataObject,
                pullData.projectDir,
                pullData.projectName,
                pullData.id,
                pullData.currentUser,
                pullData.updateBurrito,
                pullData.action,
              );
              logger.debug('Sync.js', 'Project Sync to scribe successfull, clone successfull');
              await notifyStatus('success', 'Project Sync to scribe successfull');
              await addNotification('Sync', 'Project Sync Successfull', 'success');
            }
          });
        } else {
          // call clone
          const cloneStatus = await cloneAndSetProject(
            pullData.fs,
            pullData.gitprojectDir,
            pullData.repo,
            pullData.userBranch,
            pullData.auth,
            pullData.checkoutBranch,
          );
          // continue settings file writing
          cloneStatus && await updateSettingsFiles(
            pullData.fs,
            pullData.sbDataObject,
            pullData.projectDir,
            pullData.projectName,
            pullData.id,
            pullData.currentUser,
            pullData.updateBurrito,
            pullData.action,
          );
          logger.debug('Sync.js', 'Project Sync to scribe successfull, clone successfull');
          await notifyStatus('success', 'Project Sync to scribe successfull');
          await addNotification('Sync', 'Project Sync Successfull', 'success');
        }
      }
    } else {
      logger.debug('Sync.js', 'error pullData not set from function');
    }
  };

  const handleLogout = () => {
    localforage.removeItem('authentication');
    setLogout(true);
  };

  return (
    <AuthenticationContextProvider>
      <ProjectContextProvider>
        <ReferenceContextProvider>
          <ProjectsLayout>
            <div className="grid grid-cols-2 gap-2 bg-gray-50 h-full[90vh] ">
              {/* local projecr side */}
              <div className="bg-white border-x border-gray-200 h-screen[90vh] ">
                <div className="flex justify-between items-center p-3 px-5 uppercase tracking-wider shadow-sm border-b border-gray-200">
                  {/* <span className="font-semibold">Local Projects</span> */}
                  <span className="font-semibold">{t('label-prj-on-my-computer')}</span>
                  <button
                    title={t('tooltip-save-cloud-btn')}
                    type="button"
                    className="text-white bg-primary hover:bg-primary focus:ring-4 focus:outline-none focus:ring-primary font-medium text-xs px-3 py-1.5 text-center inline-flex items-center rounded-full gap-2 uppercase tracking-wider"
                    onClick={() => handleCloudSync(selectedAgProject, auth, setSyncProgress)}
                    disabled={syncProgress.syncStarted}
                  >
                    <CloudArrowUpIcon className="h-5 w-5" />
                    {t('label-save-to-cloud')}
                  </button>
                </div>

                <div className="flex justify-between items-center h-14 px-5 tracking-wide shadow-sm border-b border-gray-200 uppercase">
                  <div className="font-bold ">
                    {t('projects-page')}
                  </div>
                  <div className="text-xs font-semibold uppercase">
                    {t('label-last-synced')}
                  </div>
                </div>

                <div style={{ overflowY: 'auto', height: '75vh' }}>
                  <ProjectFileBrowser />
                </div>
              </div>

              {/* cloud project side */}
              <div className="bg-white border-x border-gray-200 h-screen[90vh]">
                <div className="flex justify-between items-center px-5 uppercase tracking-wider shadow-sm border-b border-gray-200">
                  <span className="font-semibold">{t('label-prj-on-cloud')}</span>

                  <ul class="flex flex-wrap text-xs font-medium text-center text-gray-500">
                    <li class="mr-2">
                      <a
                        href="#door43"
                        aria-current="page"
                        class="inline-block p-3 px-5 mt-4 text-white bg-black rounded-t-lg active border-primary border-b-4"
                      >
                        <Door43Logo className="inline mr-2 w-4" fill="#9bc300" />
                        {t('label-door43')}
                      </a>
                    </li>
                    {/* will use other syncs in future */}
                    {/* <li class="mr-2">
                      <a
                        href="#paratext"
                        class="inline-block p-3 px-5 mt-4 bg-gray-200 rounded-t-lg hover:text-white hover:bg-black"
                      >
                        ParaText
                      </a>
                    </li>
                    <li class="mr-2">
                      <a
                        href="#gitea"
                        class="inline-block p-3 px-5 mt-4 bg-gray-200 rounded-t-lg hover:text-white hover:bg-black"
                      >
                        Gitea
                      </a>
                    </li> */}
                  </ul>
                  <div className="flex items-center">
                    {auth && repo && (
                      <button
                        type="button"
                        title={t('tooltip-save-computer-btn')}
                        className="text-white bg-primary hover:bg-primary focus:ring-4 focus:outline-none focus:ring-primary font-medium text-xs px-3 py-1.5 text-center inline-flex items-center rounded-full gap-2 uppercase tracking-wider"
                        onClick={() => handleOfflineSync(repo, auth)}
                        disabled={syncProgress.syncStarted}
                      >
                        <CloudArrowDownIcon className="h-5 w-5" />
                        {t('label-save-to-computer')}
                      </button>
                    )}
                    {
                      auth && (
                        <button className="px-3 py-1.5 bg-red-500 hover:bg-red-800 text-xs text-white font-medium m-2 rounded-full uppercase" type="button" onClick={() => handleLogout()}>Logout</button>
                      )
                    }
                  </div>

                </div>
                <Gitea setAuth={setAuth} setRepo={setRepo} logout={logout} setLogout={setLogout} />
              </div>
            </div>

            <SnackBar
              openSnackBar={snackBar}
              snackText={snackText}
              setOpenSnackBar={setOpenSnackBar}
              setSnackText={setSnackText}
              error={notify}
            />
            <ConfirmationModal
              openModal={pullPopUp?.status}
              title={pullPopUp?.title}
              setOpenModal={() => setPullPopup((prev) => ({ ...prev, status: false }))}
              confirmMessage={pullPopUp?.confirmMessage}
              buttonName={pullPopUp?.buttonName}
              closeModal={continuePullAction}
            />
          </ProjectsLayout>
        </ReferenceContextProvider>
      </ProjectContextProvider>
    </AuthenticationContextProvider>
  );
}
