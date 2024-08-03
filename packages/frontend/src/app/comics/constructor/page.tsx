'use client';

import { Box, Grid, Stack } from '@mui/material';

import { makeStyles } from 'tss-react/mui';

import { ImageSelectorController } from '@/components/image-selector';
import { SlideDetailsController } from '@/components/page-constructor/details-controller';
import { ProjectInitController } from '@/components/page-constructor/project-init-controller';
import { ProjectToolbarController } from '@/components/page-constructor/project-toolbar-controller';
import { InfoSlideController } from '@/components/page-constructor/slide-info-controller';
import { SlideScriptController } from '@/components/page-constructor/slide-script-input-controller';
import { InputSlideTextController } from '@/components/page-constructor/slide-text-input-controller';
import { SlidesListController } from '@/components/slides-list';
import { backgroundGradient } from '@/theme';

const useStyles = makeStyles()((theme) => ({
  container: {
    position: 'relative',
    width: '100vw',
    height: '100dvh',
  },

  contentContainer: {
    display: 'flex',
    padding: theme.spacing('76px', 2, 2),
    maxWidth: '100vw',
    maxHeight: '100dvh',

    //940
    [theme.breakpoints.down('sm')]: {},
  },

  flexBox: {
    display: 'flex',
    flexGrow: 1,
  },

  initBackdrop: {
    top: 0,
    left: 0,
    zIndex: 100,
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: `${'#1F1D2B'}ff`,
  },

  inicContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    background: backgroundGradient(),
  },

  initCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '50%',
    //height: '60%',
    //minHeight: 400,
    minWidth: 300,
    padding: theme.spacing(2),
    margin: 'auto',
    backgroundColor: `${theme.palette.background.paper}80`,
    backdropFilter: 'blur(10px)',
    borderRadius: theme.shape.borderRadius,
  },
}));

export default function ConstructorPage() {
  const { classes } = useStyles();
  return (
    <Box className={classes.container} component={'main'}>
      <Box className={classes.contentContainer} height={'100%'}>
        <Grid className={classes.flexBox} container height={'100%'}>
          <Grid
            item
            xs={0}
            md={'auto'}
            maxWidth={{ xs: 'auto', md: '360px' }}
            width={{ xs: 'auto', md: '25%' }}
            className={classes.flexBox}
            paddingRight={2}
          >
            <SlidesListController />
          </Grid>

          <Grid item xs={0} width={{ xs: 'auto', md: '50%' }} className={classes.flexBox}>
            <Stack className={classes.flexBox} direction={'column'} gap={2}>
              <ProjectToolbarController />
              <ImageSelectorController />
              <InputSlideTextController />
            </Stack>
          </Grid>

          <Grid
            item
            xs={0}
            md={'auto'}
            className={classes.flexBox}
            paddingLeft={2}
            maxWidth={{ xs: 'auto', md: '400px' }}
            width={{ xs: 'auto', md: '25%' }}
          >
            <Stack className={classes.flexBox} direction={'column'} gap={2}>
              <InfoSlideController />

              <SlideScriptController />

              <SlideDetailsController />
            </Stack>
          </Grid>
        </Grid>
      </Box>

      <ProjectInitController />
    </Box>
  );
}
