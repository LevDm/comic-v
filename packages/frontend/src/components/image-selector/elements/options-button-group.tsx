'use client';

import React from 'react';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { Badge, Button, ButtonGroup, Grow, Tooltip } from '@mui/material';

import { isNull } from 'lodash';

import { TOptions } from '../types';

import { useToolsStyles } from '@/components/tools-elements';

interface IOptionsButtonGroup {
  loading: boolean;
  targetItem: null | TOptions;
  optLen: number;
  addDisabled: boolean;
  addHandler: () => void;
  toLeftOptions: () => void;
  toRightOptions: () => void;
}
const MAX_IMAGES = 10;
export const OptionsButtonGroup: React.FC<IOptionsButtonGroup> = ({
  targetItem,
  optLen,
  addDisabled,
  loading,
  addHandler,
  toLeftOptions,
  toRightOptions,
}) => {
  const { classes } = useToolsStyles();

  return (
    <Grow in={!isNull(targetItem)} timeout={300}>
      <ButtonGroup variant="outlined" aria-label="options-control" sx={{ height: '40px' }}>
        <Tooltip title="Добавить картинку">
          <Badge
            badgeContent={optLen > 0 ? `${optLen}/${MAX_IMAGES}` : undefined}
            color="secondary"
            style={{ userSelect: 'none' }}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            <Button
              disabled={loading || addDisabled}
              key="add"
              startIcon={<AddRoundedIcon />}
              className={classes.control}
              onClick={addHandler}
              sx={{ width: 100 }}
            />
          </Badge>
        </Tooltip>
        <Tooltip title="Листать вверх">
          <Button
            disabled={optLen < 5}
            key="prev"
            startIcon={<ExpandLessRoundedIcon />}
            className={classes.control}
            onClick={toLeftOptions}
          />
        </Tooltip>
        <Tooltip title="Листать вниз">
          <Button
            disabled={optLen < 5}
            key="next"
            startIcon={<ExpandMoreRoundedIcon />}
            className={classes.control}
            onClick={toRightOptions}
          />
        </Tooltip>
      </ButtonGroup>
    </Grow>
  );
};
