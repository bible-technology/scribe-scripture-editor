import ProtectedRoute from '@/components/Protected';
import NewWebProject from '@/modules/projects/NewWebProject';

const newproject = () => (
  <ProtectedRoute>
    <NewWebProject call="new" />
  </ProtectedRoute>
);

export default newproject;
