/* eslint-disable no-nested-ternary */
/* eslint-disable react/jsx-no-useless-fragment */

import { useContext, useState, useEffect } from 'react';
import Login from './components/Login/Login';
import AuthenticationContextProvider, { AuthenticationContext } from './components/Login/AuthenticationContextProvider';
import { loadUsers } from './core/Login/handleJson';
import ProjectContextProvider from './components/context/ProjectContext';
import ReferenceContextProvider from './components/context/ReferenceContext';
import * as logger from './logger';
import ProjectList from './modules/projects/ProjectList';
import AutographaContextProvider from './components/context/AutographaContext';
import { getorPutAppLangage } from './core/projects/handleProfile';
import i18n from './translations/i18n';

const Home = () => {
  const { states, action } = useContext(AuthenticationContext);
  const [token, setToken] = useState();
  const [user, setUser] = useState();
  useEffect(() => {
    logger.debug('Home.js', 'Triggers loadUsers for the users list');
    loadUsers();
  }, []);

  const validateUser = async () => {
    if (!states.accessToken) {
      logger.debug('Home.js', 'Triggers getToken to fetch the Token if not available');
      action.getToken();
      setToken();
    } else {
      logger.debug('Home.js', `Token is available ${states.accessToken}`);
      logger.debug('Home.js', `user ${user}`);
      setToken(states.accessToken);
      setUser(states?.currentUser);
      // // set app language from saved user data on start up
      if (states?.currentUser?.username) {
        const appLangCode = await getorPutAppLangage('get', states.currentUser.username);
        if (i18n.language !== appLangCode) {
          i18n.changeLanguage(appLangCode);
        }
      }
    }
  };

  useEffect(() => {
    validateUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [states.accessToken]);

  return (
    <>
      {token && user ? (
        <AuthenticationContextProvider>
          <AutographaContextProvider>
            <ProjectContextProvider>
              <ReferenceContextProvider>
                <ProjectList />
              </ReferenceContextProvider>
            </ProjectContextProvider>
          </AutographaContextProvider>
        </AuthenticationContextProvider>
      ) : (
        <Login />
      )}
    </>
  );
};
export default Home;
