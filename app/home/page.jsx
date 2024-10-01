'use client';

import SectionContainer from '@/layouts/editor/WebSectionContainer';
import ProtectedRoute from '@/components/Protected';

export default function page() {
  return (
    <ProtectedRoute>
      <SectionContainer />
    </ProtectedRoute>
  );
}
