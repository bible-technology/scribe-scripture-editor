import AuthenticationContextProvider from '@/components/Login/AuthenticationContextProvider';
import ProjectContextProvider from '@/components/context/ProjectContext';
import ReferenceContextProvider from '@/components/context/ReferenceContext';
import EditorLayout from '@/layouts/editor/Layout';
// import Editor from '@/modules/editor/Editor';
import SectionContainer from '@/layouts/editor/SectionContainer';
import AutographaContextProvider from '@/components/context/AutographaContext';
import ScribexContextProvider from '@/components/context/ScribexContext';

export default function ReferenceSelector() {
  return (
    <AuthenticationContextProvider>
      <AutographaContextProvider>
        <ProjectContextProvider>
          <ReferenceContextProvider>
            <EditorLayout>
                <ScribexContextProvider>
                  <SectionContainer />
                </ScribexContextProvider>
            </EditorLayout>
          </ReferenceContextProvider>
        </ProjectContextProvider>
      </AutographaContextProvider>
    </AuthenticationContextProvider>
  );
}
