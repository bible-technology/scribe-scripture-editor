import { useEffect, useState } from 'react';
import {
  AuthenticationContextProvider,
  RepositoryContextProvider,
} from 'gitea-react-toolkit';
import GiteaFileBrowser from './GiteaFileBrowser';
import { environment } from '../../../../environment';
import { createSyncProfile } from '../Scribe/SyncToGiteaUtils';

const Gitea = ({ setAuth, setRepo }) => {
  const [authentication, setAuthentication] = useState();
  const [repository, setRepository] = useState();

  useEffect(() => {
    setAuth(authentication);
    setRepo(repository);
    // on auth change update sycn on user profile
    (async () => {
      if (authentication !== undefined) {
        await createSyncProfile(authentication);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authentication, repository]);

  return (
    <AuthenticationContextProvider
      config={{
        server: environment.GITEA_SERVER,
        tokenid: environment.GITEA_TOKEN,
      }}
      authentication={authentication}
      onAuthentication={setAuthentication}
    >
      <RepositoryContextProvider
        repository={repository}
        onRepository={setRepository}
        defaultOwner={authentication && authentication.user.name}
        defaultQuery=""
        branch=""
      >
        <GiteaFileBrowser changeRepo={() => setRepository()} />
      </RepositoryContextProvider>
    </AuthenticationContextProvider>
  );
};
export default Gitea;
