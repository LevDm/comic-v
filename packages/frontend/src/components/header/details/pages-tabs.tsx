'use client';

import * as React from 'react';

import { Tab, Tabs } from '@mui/material';

import { TPage, TPaths } from '../pages';

function a11yProps(index: number) {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  };
}

interface IPagesTabs {
  path: TPaths;
  pages: TPage[];
  onChange: (p: TPaths) => void;
}

export const PagesTabs: React.FC<IPagesTabs> = ({ path, pages, onChange }) => {
  const tabIndex = pages.findIndex((p) => p.path == path);

  const handleChange = (_: unknown, newValue: number) => {
    onChange(pages[newValue].path);
  };

  return (
    <Tabs
      sx={{ ml: '1%', flexGrow: 1, display: { xs: 'none', sm: 'flex' } }}
      value={tabIndex < 0 ? false : tabIndex}
      onChange={handleChange}
      indicatorColor="secondary"
      textColor="inherit"
      aria-label="pages-tabs"
      TabIndicatorProps={{ sx: { borderRadius: 8, bottom: 1 } }}
    >
      {pages.map((page) => (
        <Tab
          key={page.path}
          label={page.title}
          {...a11yProps(0)}
          sx={{
            mx: 1,
            textTransform: 'capitalize',
            opacity: 1,
            borderRadius: 1,
            ':hover': { color: 'secondary.main' },
          }}
        />
      ))}
    </Tabs>
  );
};
