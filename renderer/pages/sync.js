import Sync from '@/components/Sync/Sync';
import AuthenticationContextProvider from '@/components/Login/AuthenticationContextProvider';
import AutographaContextProvider from '@/components/context/AutographaContext';
import SyncContextProvider from '@/components/Sync/SyncContextProvider';

const projects = () => (
  <AuthenticationContextProvider>
    <AutographaContextProvider>
      <SyncContextProvider>
        <Sync />
      </SyncContextProvider>
    </AutographaContextProvider>
  </AuthenticationContextProvider>
);

export default projects;
