import fetchProjectsMeta from '@/core/projects/fetchProjectsMeta';
import localforage from 'localforage';
import { useState } from 'react';
import packageInfo from '../../../../../package.json';

export default function useGetCurrentProjectMeta() {
  let meta;
  const [currentProjectMeta, setCurrentProjectMeta] = useState(undefined);

  const getProjectMeta = async (currentProjectName) => {
    localforage.getItem('userProfile').then((user) => {
      fetchProjectsMeta({ currentUser: user?.username })
        .then((value) => {
          const projectId = currentProjectName?.split('_').pop();
          const projectName = (currentProjectName.slice(0, currentProjectName.lastIndexOf('_'))).toLowerCase();
          meta = value.projects.filter((val) => val.identification.name.en.toLowerCase() === projectName.toLowerCase()
              && Object.keys(val.identification.primary[packageInfo.name])[0] === projectId);
        }).finally(() => {
          if (meta && meta?.length > 0) {
            setCurrentProjectMeta(meta[0]);
          }
        });
    });
  };

  const response = {
    state: {
      currentProjectMeta,
    },
    actions: {
      getProjectMeta,
    },
  };
  return response;
}
