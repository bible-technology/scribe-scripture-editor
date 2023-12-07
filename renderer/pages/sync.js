import Sync from '@/components/Sync/Sync';
import AuthenticationContextProvider from '@/components/Login/AuthenticationContextProvider';
import AutographaContextProvider from '@/components/context/AutographaContext';
import SyncContextProvider from '@/components/context/SyncContext';
import Meta from '../src/Meta';

const projects = () => (
  <>
    <Meta />
    <AuthenticationContextProvider>
      <AutographaContextProvider>
        <SyncContextProvider>
          <Sync />
        </SyncContextProvider>
      </AutographaContextProvider>
    </AuthenticationContextProvider>
  </>
);

export default projects;
