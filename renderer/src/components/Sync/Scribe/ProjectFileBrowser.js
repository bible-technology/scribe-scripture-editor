import {
 useContext, useEffect,
} from 'react';
import GridRow from '../GridRow';
import { SyncContext } from '../../context/SyncContext';

export default function ProjectFileBrowser() {
  const {
    states: {
    agProjects, agProjectsMeta, selectedAgProject, syncProgress,
  },
    action: {
      fetchProjects, setSelectedAgProject,
    },
  } = useContext(SyncContext);

  useEffect(() => {
    const getProjects = async () => {
      await fetchProjects();
    };
    getProjects();
    // eslint-disable-next-line
  }, []);

  const handleSelectProject = (currentProject, meta) => {
    const currentId = Object.keys(meta.identification.primary.scribe)[0];
    const prevSelectedId = selectedAgProject?.projectId || undefined;
    if (selectedAgProject?.projectName === currentProject && prevSelectedId === currentId) {
      setSelectedAgProject(undefined);
    } else {
      setSelectedAgProject({ projectName: currentProject, projectMeta: meta, projectId: currentId });
    }
  };

  return (
    agProjectsMeta?.map((projectMeta) => (
      // not listing audio project in sync list
      agProjects.filter((project) => projectMeta?.identification?.name?.en === project && projectMeta?.type?.flavorType?.flavor?.name !== 'audioTranslation'
      && !projectMeta?.project[projectMeta?.type?.flavorType?.flavor?.name]?.isArchived).length > 0
      && (
        <div
          // key={projectMeta?.identification?.name?.en}
          key={Object.keys(projectMeta?.identification.primary.scribe)[0]}
          role="button"
          onClick={() => handleSelectProject(projectMeta?.identification?.name?.en, projectMeta)}
          tabIndex={-1}
        >
          <GridRow
            // key={projectMeta?.identification?.name?.en}
            key={Object.keys(projectMeta?.identification.primary.scribe)[0]}
            title={projectMeta?.identification?.name?.en}
            lastSync={projectMeta?.lastSync}
            // selected={selectedAgProject?.projectName === projectMeta?.identification?.name?.en}
            selected={selectedAgProject?.projectId === Object.keys(projectMeta?.identification.primary.scribe)[0]}
            isUpload={selectedAgProject?.projectName === projectMeta?.identification?.name?.en && syncProgress.syncStarted && syncProgress.syncType === 'syncTo'}
            uploadPercentage={(syncProgress.completedFiles * 100) / syncProgress.totalFiles}
          />
        </div>
      )
    ))
);
}
