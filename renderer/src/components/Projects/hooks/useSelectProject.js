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
    setSelectedProject(projectName);
    localforage.setItem('currentProject', `${projectName}_${projectId}`);
    router.push('/home');
  };

  return { handleSelectProject };
};

export default useHandleSelectProject;
