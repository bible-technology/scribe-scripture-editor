import { useEffect, useState } from 'react';
import {
  AuthenticationContextProvider,
  RepositoryContextProvider,
} from 'gitea-react-toolkit';
import * as localforage from 'localforage';
import GiteaFileBrowser from './GiteaFileBrowser';
import { environment } from '../../../../environment';
import { createSyncProfile } from '../Scribe/SyncToGiteaUtils';

const Gitea = ({
  setAuth, setRepo, logout, setLogout,
}) => {
  const [authentication, setAuthentication] = useState();
  const [repository, setRepository] = useState();
  const [localDefaultOwner, setLocalDefaultOwner] = useState("");

  useEffect(() => {
    setAuth(authentication);
    setRepo(repository);
    // on auth change update sync on user profile
    (async () => {
      if (authentication !== undefined) {
        await createSyncProfile(authentication);
        if(repository !== undefined) {
          setLocalDefaultOwner(repository.owner.login);
        }
      }
    })();
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authentication, repository]);

  const getAuth = async () => {
    const authentication = await localforage.getItem('authentication');
    setLocalDefaultOwner(authentication !== undefined ? authentication.user.login : "");
    return authentication;
  };

  const saveAuth = async (authentication) => {
    if (authentication === undefined || authentication === null) {
      await localforage.removeItem('authentication');
    } else {
      await localforage.setItem('authentication', authentication);
    }
  };
  useEffect(() => {
    if (logout) {
      setAuthentication();
      setLogout();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logout]);

  return (
    <AuthenticationContextProvider
      config={{
        server: environment.GITEA_SERVER,
        tokenid: environment.GITEA_TOKEN,
      }}
      authentication={authentication}
      onAuthentication={setAuthentication}
      loadAuthentication={getAuth}
      saveAuthentication={saveAuth}
    >
      <RepositoryContextProvider
        repository={repository}
        onRepository={setRepository}
        defaultOwner={localDefaultOwner}
        defaultQuery=""
        branch=""
      >
        <GiteaFileBrowser changeRepo={() => setRepository()} />
      </RepositoryContextProvider>
    </AuthenticationContextProvider>
  );
};
export default Gitea;
