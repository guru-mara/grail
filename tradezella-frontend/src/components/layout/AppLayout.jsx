import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import { Outlet } from 'react-router-dom'; // Import this
import Sidebar from './Sidebar';
import Header from './Header';

const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <Header onDrawerToggle={handleDrawerToggle} />
      <Sidebar mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 240px)` },
          ml: { sm: '240px' },
          mt: '64px'
        }}
      >
        <Outlet /> {/* Replace {children} with <Outlet /> */}
      </Box>
    </Box>
  );
};

export default AppLayout;