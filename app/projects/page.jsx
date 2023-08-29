import ProjectList from '@/modules/projects/WebProjectList';
import ProtectedRoute from '@/components/Protected';

const projects = () => (
  <ProtectedRoute>
    <ProjectList />
  </ProtectedRoute>
);

export default projects;
