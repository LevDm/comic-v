'use client';

import { useState } from 'react';

import AssistantRoundedIcon from '@mui/icons-material/AssistantRounded';
import { Backdrop, Box, Button, ButtonGroup, Divider, Grow, Modal, Paper, Stack, Tooltip, Typography } from '@mui/material';

import { observer } from 'mobx-react-lite';

import { useToolsStyles } from '@/components/tools-elements';
import { useProcessStore } from '@/utils/mobx-stores';

export const InfoSlideController: React.FC = observer(() => {
  const { selectedSlideData, theme } = useProcessStore();

  const slideData = selectedSlideData.get();

  return <InfoSlide theme={theme.get()} theses={slideData?.theses?.text} />;
});

interface InfoSlideProps {
  theme?: string | null;
  theses?: string | null;
}
const InfoSlide: React.FC<InfoSlideProps> = ({ theme, theses }) => {
  const { classes } = useToolsStyles();

  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const onClick = () => {
    setOpen(true);
  };

  return (
    <>
      <Stack direction={'row'} flexGrow={1} maxHeight={'40px'} justifyContent={'space-between'}>
        <Box sx={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography color="primary">Ресурсы генерации</Typography>
        </Box>
        <ButtonGroup variant="outlined">
          <Tooltip title={'Контекст'}>
            <Button startIcon={<AssistantRoundedIcon />} className={classes.control} onClick={onClick} />
          </Tooltip>
        </ButtonGroup>
      </Stack>
      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
            sx: {
              backdropFilter: 'blur(10px)',
            },
          },
        }}
        sx={{ display: 'grid' }}
      >
        <Grow in={open} timeout={500}>
          <Paper
            elevation={0}
            sx={{ position: 'absolute', padding: 4, alignSelf: 'center', justifySelf: 'center', maxWidth: '80dvw' }}
          >
            <Stack sx={{}} direction={'column'} gap={2}>
              <Typography>Контекст слайда</Typography>
              <Divider orientation="horizontal" flexItem />
              {theme && <Typography>{`Тема: ${theme}`}</Typography>}
              {theses && <Typography>{`Тезис: ${theses}`}</Typography>}
            </Stack>
          </Paper>
        </Grow>
      </Modal>
    </>
  );
};
