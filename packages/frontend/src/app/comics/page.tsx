'use client';

import React from 'react';

import { Box, Grid } from '@mui/material';

import { makeStyles } from 'tss-react/mui';

import { ProjectViewController } from '@/components/page-comics/project-view-controller';
import { ProjectsController } from '@/components/page-comics/projects-controller';

const useStyles = makeStyles()((theme) => ({
  container: {
    display: 'flex',
    width: '100vw',
    maxWidth: '100vw',
    height: '100vh',
    padding: theme.spacing('76px', 2, 2),
    [theme.breakpoints.down('md')]: {
      padding: theme.spacing('64px', 0.5, 0.5, 1),
    },
  },
  flexBox: {
    display: 'flex',
    flexGrow: 1,
  },
}));

const ComicsPage = () => {
  const { classes } = useStyles();

  return (
    <Box className={classes.container} component={'main'} position={'relative'}>
      <Grid
        className={classes.flexBox}
        container
        spacing={2}
        sx={{ flexWrap: { xs: 'wrap-reverse', md: 'wrap' }, justifyContent: 'center' }} // { sm: '200vh', lg: 'auto' }
      >
        <Grid
          item
          xs={12}
          md={4}
          className={classes.flexBox}
          height={{ xs: '100%', md: 'auto' }}
          maxWidth={{ xs: 'auto', md: '400px' }}
        >
          <ProjectsController />
        </Grid>
        <Grid
          item
          xs={12}
          md={8}
          className={classes.flexBox}
          sx={{ alignItems: 'center', justifyContent: 'center', width: '100%', height: { md: '100%', xs: 'fit-content' } }}
        >
          <ProjectViewController />
        </Grid>
      </Grid>
    </Box>
  );
};
export default ComicsPage;
