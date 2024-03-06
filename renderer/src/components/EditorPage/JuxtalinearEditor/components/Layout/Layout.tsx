import React from 'react';
import { AppHeader } from '../AppHeader';
import { Box } from '@material-ui/core';

interface LayoutProps {
  children?: React.ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <Box id="sundesmos" sx={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <div>
        {children}
      </div>
    </Box>
  )
}
