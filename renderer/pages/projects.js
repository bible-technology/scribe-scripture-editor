import ProjectList from '@/components/Projects/ProjectList';
import AuthenticationContextProvider from '@/components/Login/AuthenticationContextProvider';
import AutographaContextProvider from '@/components/context/AutographaContext';
import ProjectContextProvider from '@/components/context/ProjectContext';
import Meta from '../src/Meta';

const Projects = () => (
  <>
    <Meta />
    <AuthenticationContextProvider>
      <AutographaContextProvider>
        <ProjectContextProvider>
          <ProjectList />
        </ProjectContextProvider>
      </AutographaContextProvider>
    </AuthenticationContextProvider>
  </>
  );

export default Projects;
