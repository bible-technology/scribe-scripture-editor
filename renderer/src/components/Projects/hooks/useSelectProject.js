import * as localforage from 'localforage';
import moment from 'moment';
import * as logger from '../../../logger';

const useHandleSelectProject = () => {
  const handleSelectProject = (
    event,
    projectName,
    projectId,
    router,
    activeNotificationCount,
    setSelectedProject,
    setNotifications,
    setActiveNotificationCount,
  ) => {
    logger.debug('ProjectList.js', 'In handleSelectProject');
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

  return { handleSelectProject };
};

export default useHandleSelectProject;
