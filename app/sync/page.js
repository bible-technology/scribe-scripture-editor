import ProtectedRoute from '@/components/Protected';
// import Sync from '@/modules/projects/Sync';

const sync = () => (
  <ProtectedRoute>
    Sync page
    {/* <Sync /> */}
  </ProtectedRoute>
);

export default sync;
