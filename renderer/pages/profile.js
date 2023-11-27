import Profile from '@/modules/projects/Profile';
import AuthenticationContextProvider from '@/components/Login/AuthenticationContextProvider';
import ProjectContextProvider from '@/components/context/ProjectContext';

const profile = () => (
  <AuthenticationContextProvider>
    <ProjectContextProvider>
      <Profile />
    </ProjectContextProvider>
  </AuthenticationContextProvider>
);

export default profile;
