import NewProject from '@/components/Projects/NewProject';
import AuthenticationContextProvider from '@/components/Login/AuthenticationContextProvider';
import ProjectContextProvider from '@/components/context/ProjectContext';
import AutographaContextProvider from '@/components/context/AutographaContext';
import Meta from '../src/Meta';

const newproject = () => (
  <>
    <Meta />
    <AuthenticationContextProvider>
      <AutographaContextProvider>
        <ProjectContextProvider>
          <NewProject call="new" />
        </ProjectContextProvider>
      </AutographaContextProvider>
    </AuthenticationContextProvider>
  </>
);

export default newproject;
