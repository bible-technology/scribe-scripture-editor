import ProtectedRoute from '@/components/Protected';
import NewWebProject from '@/components/Projects/NewWebProject';

const newproject = () => (
  <ProtectedRoute>
    <NewWebProject call="new" />
  </ProtectedRoute>
);

export default newproject;
