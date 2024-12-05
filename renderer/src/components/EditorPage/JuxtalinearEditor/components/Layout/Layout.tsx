import React from 'react';
import { AppHeader } from '../AppHeader';
import { Box } from '@mui/material'; // Updated import for MUI v5

interface LayoutProps {
  children?: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <Box id="sundesmos" sx={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <div>
        {children}
      </div>
    </Box>
  );
};
