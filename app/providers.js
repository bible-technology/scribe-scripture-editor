'use client';

import ScribexContextProvider from '@/components/context/ScribexContext';
import SyncContextProvider from '@/components/context/SyncContext';
import ProjectContextProvider from '../renderer/src/components/context/ProjectContext';
import ReferenceContextProvider from '../renderer/src/components/context/ReferenceContext';
import AuthenticationContextProvider from '../renderer/src/components/Login/AuthenticationContextProvider';
import AutographaContextProvider from '../renderer/src/components/context/AutographaContext';

export function Providers({ children }) {
  return (
    <AuthenticationContextProvider>
      <ProjectContextProvider>
        <ReferenceContextProvider>
          <AutographaContextProvider>
            <ScribexContextProvider>
              <SyncContextProvider>
                {children}
              </SyncContextProvider>
            </ScribexContextProvider>
          </AutographaContextProvider>
        </ReferenceContextProvider>
      </ProjectContextProvider>
    </AuthenticationContextProvider>
  );
}
