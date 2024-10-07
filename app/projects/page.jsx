'use client';

import ProjectList from '@/components/Projects/ProjectList';
import ProtectedRoute from '@/components/Protected';

const projects = () => (
  <ProtectedRoute>
    <ProjectList />
  </ProtectedRoute>
);

export default projects;
