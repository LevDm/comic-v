'use client';

import * as React from 'react';
import { useState } from 'react';

import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { Box, IconButton, Menu, MenuItem, Typography } from '@mui/material';

import { TPage, TPaths } from '../pages';

interface IPagesMenu {
  pages: TPage[];
  path: TPaths;
  onChange: (path: TPaths) => void;
}

export const PagesMenu: React.FC<IPagesMenu> = ({ pages, path, onChange }) => {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const itemClick = (path: TPaths) => {
    onChange(path);
    handleCloseNavMenu();
  };

  return (
    <Box sx={{ ml: '1%', flexGrow: 1, display: { xs: 'flex', sm: 'none' } }}>
      <IconButton
        size="large"
        aria-label="account of current user"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={handleOpenNavMenu}
        color="inherit"
      >
        <MenuRoundedIcon />
      </IconButton>
      <Menu
        id="menu-appbar"
        anchorEl={anchorElNav}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        open={Boolean(anchorElNav)}
        onClose={handleCloseNavMenu}
        sx={{
          display: { xs: 'block', sm: 'none' },
        }}
      >
        {pages.map((page) => (
          <MenuItem key={page.path} onClick={() => itemClick(page.path)}>
            <Typography
              textAlign="center"
              sx={{ textAlign: 'center', textTransform: 'capitalize', ...(path == page.path && { color: 'secondary.main' }) }}
            >
              {page.title}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};
