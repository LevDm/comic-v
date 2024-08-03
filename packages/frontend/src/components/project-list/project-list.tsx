'use client';

import React, { useRef } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';

import { Box } from '@mui/material';

import { makeStyles } from 'tss-react/mui';

import { useToolsStyles } from '../tools-elements';

import { RenderFrames } from './list-item';
import { TProcessProject } from '@/utils/fake-data/fake-projects';

export const useStyles = makeStyles()((theme) => ({
  list: {
    [theme.breakpoints.down('md')]: {
      paddingBottom: '70px',
    },
    borderRadius: theme.shape.borderRadius,
  },
}));

export const ProjectList: React.FC<{
  data?: TProcessProject[];
  loading: string[];
  selectedItemId: string | null;
  localId?: string | null;
  onChange?: (item: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
  onSave?: (id: string) => void;
  onShow?: (id: string, inPlayer?: boolean, inModal?: boolean) => void;
}> = (props) => {
  const { onChange, loading, data = [], selectedItemId, localId, onEdit, onDelete, onDownload, onSave, onShow } = props;

  const { classes } = useStyles();
  const { classes: toolsClasses } = useToolsStyles();

  const listRef = useRef<FixedSizeList | null>(null);

  const itemClick = (item: TProcessProject) => {
    onChange?.(item.id);
  };

  const clickEdit = (item: TProcessProject) => {
    onEdit?.(item.id);
  };
  const clickDelete = (item: TProcessProject) => {
    onDelete?.(item.id);
  };
  const clickDownload = (item: TProcessProject) => {
    onDownload?.(item.id);
  };
  const clickSave = (item: TProcessProject) => {
    onSave?.(item.id);
  };
  const clickShow = (item: TProcessProject, inPlayer?: boolean, inModal?: boolean) => {
    onShow?.(item.id, inPlayer, inModal);
  };

  return (
    <>
      <Box sx={{ height: '100%', width: '100%', padding: 0, display: { xs: 'none', md: 'block' } }}>
        <AutoSizer>
          {({ height, width }) => (
            <FixedSizeList
              layout="vertical"
              ref={listRef}
              className={`${classes.list} ${toolsClasses.list}`}
              height={height}
              width={width}
              itemCount={data.length}
              itemSize={160}
              itemData={{
                localId: localId,
                selectedItemId: selectedItemId,
                onClick: itemClick,
                onEdit: clickEdit,
                onDelete: clickDelete,
                onDownload: clickDownload,
                onSave: clickSave,
                onShow: clickShow,
                projects: data,
                loading: loading,
              }}
            >
              {RenderFrames}
            </FixedSizeList>
          )}
        </AutoSizer>
      </Box>
      <Box sx={{ height: '100%', width: '100%', padding: 0, display: { xs: 'block', sm: 'none', md: 'none' } }}>
        <AutoSizer>
          {({ height, width }) => (
            <FixedSizeList
              layout="vertical"
              ref={listRef}
              className={`${classes.list} ${toolsClasses.list}`}
              height={height}
              width={width}
              itemCount={data.length}
              itemSize={160 + 360}
              itemData={{
                fullCard: true,
                localId: localId,
                selectedItemId: selectedItemId,
                onClick: itemClick,
                onEdit: clickEdit,
                onDelete: clickDelete,
                onDownload: clickDownload,
                onSave: clickSave,
                onShow: clickShow,
                projects: data,
                loading: loading,
              }}
            >
              {RenderFrames}
            </FixedSizeList>
          )}
        </AutoSizer>
      </Box>

      <Box sx={{ height: '100%', width: '100%', padding: 0, display: { xs: 'none', sm: 'block', md: 'none' } }}>
        <AutoSizer>
          {({ height, width }) => (
            <FixedSizeList
              layout="vertical"
              ref={listRef}
              className={`${classes.list} ${toolsClasses.list}`}
              height={height}
              width={width}
              itemCount={data.length}
              itemSize={160 + 560}
              itemData={{
                fullCard: true,
                localId: localId,
                selectedItemId: selectedItemId,
                onClick: itemClick,
                onEdit: clickEdit,
                onDelete: clickDelete,
                onDownload: clickDownload,
                onSave: clickSave,
                onShow: clickShow,
                projects: data,
                loading: loading,
              }}
            >
              {RenderFrames}
            </FixedSizeList>
          )}
        </AutoSizer>
      </Box>
    </>
  );
};
