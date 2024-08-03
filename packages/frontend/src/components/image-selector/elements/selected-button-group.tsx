'use client';

import React from 'react';

import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import RedoRoundedIcon from '@mui/icons-material/RedoRounded';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import { Button, ButtonGroup, Grow, Tooltip } from '@mui/material';

import { isNull } from 'lodash';

import { TOptions } from '../types';

import { useToolsStyles } from '@/components/tools-elements';

interface ISelectedButtonGroup {
  isLoading: boolean;
  targetItem: null | TOptions;
  history: TOptions[];
  deleteSelect: () => void;
  undoSelect: (item: TOptions) => void;
  redoSelect: (item: TOptions) => void;
}

export const SelectedButtonGroup: React.FC<ISelectedButtonGroup> = ({
  isLoading,
  targetItem,
  history,
  deleteSelect,
  undoSelect,
  redoSelect,
}) => {
  const { classes } = useToolsStyles();

  const undoHandler = () => {
    undoSelect(history[0]);
  };

  const redoHandler = () => {
    redoSelect(history[1]);
  };

  return (
    <Grow in={!isNull(targetItem)} timeout={300}>
      <ButtonGroup variant="outlined" aria-label="select-control" sx={{ height: '40px' }}>
        <Tooltip title="Предыдущий шаг">
          <Button
            key="undo"
            disabled={!(history.length > 0) || history[0]?.id == targetItem?.id}
            startIcon={<UndoRoundedIcon />}
            className={classes.control}
            onClick={undoHandler}
          />
        </Tooltip>
        <Tooltip title="Текущий шаг">
          <Button
            key="redo"
            disabled={!(history.length > 1) || history[1]?.id == targetItem?.id}
            startIcon={<RedoRoundedIcon />}
            className={classes.control}
            onClick={redoHandler}
          />
        </Tooltip>
        <Tooltip title="Удалить картинку">
          <Button
            key="delete"
            disabled={isNull(targetItem) || isLoading}
            startIcon={<DeleteOutlineRoundedIcon />}
            className={classes.control}
            onClick={deleteSelect}
          />
        </Tooltip>
      </ButtonGroup>
    </Grow>
  );
};
