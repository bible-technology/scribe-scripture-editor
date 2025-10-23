import * as localforage from 'localforage';
import * as logger from '../../../logger';

const useHandleSelectProject = () => {
  const handleSelectProject = (
    event,
    projectName,
    projectId,
    router,
    setSelectedProject,
  ) => {
    logger.debug('ProjectList.js', 'In handleSelectProject');

    if (typeof setSelectedProject === 'function') {
      setSelectedProject(projectName);
    } else {
      logger.warn('setSelectedProject is not a function');
    }

    localforage.setItem('currentProject', `${projectName}_${projectId}`);
    router.push('/home');
  };

  return { handleSelectProject };
};

export default useHandleSelectProject;
