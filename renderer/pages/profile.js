import Profile from '@/modules/projects/Profile';
import AuthenticationContextProvider from '@/components/Login/AuthenticationContextProvider';
import ProjectContextProvider from '@/components/context/ProjectContext';
import Meta from '../src/Meta';

const profile = () => (
  <>
    <Meta />
    <AuthenticationContextProvider>
      <ProjectContextProvider>
        <Profile />
      </ProjectContextProvider>
    </AuthenticationContextProvider>
  </>
);

export default profile;
