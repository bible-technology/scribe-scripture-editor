import React from 'react';
// import Profile from '@/modules/projects/Profile';
import ProtectedRoute from '@/components/Protected';

const ProfilePage = () => (
  <ProtectedRoute>
    Profile page
    {/* <Profile /> */}
  </ProtectedRoute>
);

export default ProfilePage;
