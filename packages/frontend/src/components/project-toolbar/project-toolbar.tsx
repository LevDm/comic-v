'use client';

import React from 'react';

import BrushRoundedIcon from '@mui/icons-material/BrushRounded';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import OndemandVideoRoundedIcon from '@mui/icons-material/OndemandVideoRounded';
import SaveAltRoundedIcon from '@mui/icons-material/SaveAltRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import TvRoundedIcon from '@mui/icons-material/TvRounded';
import { Button, ButtonGroup, Stack, Tooltip } from '@mui/material';

import { LoadingLine, useToolsStyles } from '../tools-elements';

import { TImageFormat, TImageStyle } from '@/utils/mobx-stores/process-store';

type tSave = 'local' | 'server';

interface IProjectTools {
  isPlayer?: boolean;
  isLoading?: boolean;
  fromSave?: tSave;
  format: TImageFormat;
  style: TImageStyle;
  onClicks?: {
    edit?: () => void;
    delete?: () => void;
    show?: () => void;
    save?: () => void;
    download?: () => void;
  };
}

export const ProjectTools: React.FC<IProjectTools> = ({
  isPlayer = false,
  isLoading = false,
  format,
  style,
  fromSave = 'server',
  onClicks,
}) => {
  const { classes } = useToolsStyles();

  const saveDownloadClick = () => {
    if (fromSave === 'server') {
      onClicks?.download?.();
    } else {
      onClicks?.save?.();
    }
  };

  return (
    <Stack direction={'row'} flexGrow={1} maxHeight={'40px'}>
      <ButtonGroup variant="outlined" aria-label="options-project-edit">
        <Tooltip title="Редактировать">
          <Button
            key="eit"
            startIcon={<BrushRoundedIcon />}
            className={classes.control}
            onClick={onClicks?.edit}
            disabled={isLoading}
          />
        </Tooltip>
        <Tooltip title="Удалить">
          <Button
            key="delete"
            startIcon={<DeleteForeverRoundedIcon />}
            className={classes.control}
            onClick={onClicks?.delete}
            disabled={isLoading}
          />
        </Tooltip>
      </ButtonGroup>

      <LoadingLine visible={isLoading} />

      <ButtonGroup variant="outlined" aria-label="options-project-action">
        <Tooltip title={isPlayer ? 'Плеер' : 'Предпросмотр'}>
          <Button
            key="show"
            startIcon={(isPlayer && <TvRoundedIcon />) || <OndemandVideoRoundedIcon />}
            className={classes.control}
            onClick={onClicks?.show}
            disabled={isLoading}
          />
        </Tooltip>
        <Button key="format" sx={{ lineHeight: 1 }} className={classes.control} disabled>
          {format} {style.slice(0, 3)}
        </Button>
        <Tooltip title={fromSave === 'server' ? 'Скачать' : 'Сохранить'}>
          <Button
            key="save"
            startIcon={(fromSave === 'server' && <SaveAltRoundedIcon />) || <SaveRoundedIcon />}
            className={classes.control}
            onClick={saveDownloadClick}
            disabled={isLoading}
          />
        </Tooltip>
      </ButtonGroup>
    </Stack>
  );
};
