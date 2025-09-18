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
      const temp = [...(value || [])];
      const newNotification = {
        title: 'Project',
        text: `successfully loaded ${projectName} files`,
        type: 'success',
        time: moment().format(),
        hidden: true,
      };

      temp.push(newNotification);

      localforage.setItem('notification', temp).then(() => {
        setNotifications(temp);
        const unreadCount = temp.filter((n) => !n.isRead).length;
        setActiveNotificationCount(unreadCount);
      });
    });
  };

  return { handleSelectProject };
};

export default useHandleSelectProject;
