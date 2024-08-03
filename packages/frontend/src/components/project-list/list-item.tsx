'use client';

import React, { useCallback } from 'react';

import { Box, ButtonBase, Divider, Grow, ListItem, Paper, Stack, Typography, styled } from '@mui/material';

import { format } from 'date-fns';
import { makeStyles } from 'tss-react/mui';

import { ShowProject } from '../page-comics/project-view-controller';
import { ProjectTools } from '../project-toolbar/project-toolbar';
import { useToolsStyles } from '../tools-elements';

import { TProcessProject } from '@/utils/fake-data/fake-projects';
import { MyProject } from '@/utils/mobx-stores/view-store';

export const useStyles = makeStyles<void, 'itemToolbar'>()((theme, _, classes) => ({
  itemContainer: {
    padding: 0,
    paddingRight: 4,
  },
  itemSize: {
    height: '100%',
    width: '100%',
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
  },

  itemClicabled: {
    alignItems: 'stretch',
    flexDirection: 'column',
  },
  itemPaper: {
    alignItems: 'stretch',
    flexDirection: 'column',
    cursor: 'pointer',
    [`&:hover .${classes.itemToolbar}`]: {
      transform: 'translateY(0)',
      opacity: 1,
      pointerEvents: 'auto',
    },

    [theme.breakpoints.down('md')]: {
      [`&:hover .${classes.itemToolbar}`]: {
        transform: 'translateY(100%)',
        opacity: 0,
      },
    },
  },
  itemToolbar: {
    position: 'absolute',
    transition: 'all 0.3s 0.2s ease',
    transform: 'translateY(100%)',
    pointerEvents: 'none',
    opacity: 0,
    alignItems: 'center',
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    width: '100%',
    backgroundColor: `${theme.palette.background.paper}80`,
    backdropFilter: 'blur(2px)',
    display: 'flex',
    bottom: 0,
  },
}));

interface IFrames {
  data: {
    onClick?: (v: TProcessProject) => void;
    onEdit?: (v: TProcessProject) => void;
    onDelete?: (v: TProcessProject) => void;
    onDownload?: (v: TProcessProject) => void;
    onSave?: (v: TProcessProject) => void;
    onShow?: (v: TProcessProject, inPlayer?: boolean, inModal?: boolean) => void;
    projects: TProcessProject[];
    loading: string[];
    selectedItemId: string | null;
    localId?: string | null;
    fullCard?: boolean;
  };

  index: number;
  style: React.CSSProperties;
}

interface IFrame {
  item: TProcessProject;
  isSelected: boolean;
  isSpecial: boolean;
  isLoading: boolean;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDownload: () => void;
  onSave: () => void;
  onShow: () => void;
  style: React.CSSProperties;
  fullCard: boolean;
}

const Root = styled('div')(({ theme }) => ({
  width: '100%',
  ...theme.typography.body2,
  color: theme.palette.text.secondary,
  '& > :not(style) ~ :not(style)': {
    marginTop: theme.spacing(2),
  },
}));

const Frame: React.FC<IFrame> = (props) => {
  const { fullCard, style, onClick, onEdit, onDelete, onDownload, onSave, onShow, isSelected, isSpecial, item, isLoading } =
    props;

  const { classes } = useStyles();
  const { classes: toolsClasses } = useToolsStyles();

  const formatS = 1.33;
  const height = parseInt(String(style.height ?? 400), 10) - 160 + 48;

  return (
    <Grow in={true}>
      <ListItem className={classes.itemContainer} style={style}>
        <Paper className={`${classes.itemSize} ${classes.itemPaper}`}>
          <ButtonBase
            className={`${classes.itemSize} ${classes.itemClicabled} ${!fullCard && isSelected && toolsClasses.solidFrame} ${item.backup === 'local' && toolsClasses.dashedFrame}`}
            onClick={onClick}
            disableRipple={fullCard}
          >
            {fullCard && (
              <Box
                sx={{
                  maxHeight: height,
                  display: 'flex',
                  flexGrow: 1,
                }}
              >
                <ShowProject
                  project={item as MyProject}
                  isLoading={isLoading}
                  isPlayer={false}
                  isModalPlayer={true}
                  previewSX={{
                    maxWidth: `${height * formatS}px`,
                    height: '100%',
                    width: '100%',
                    alignSelf: 'center',
                  }}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onDownload={onDownload}
                  onSave={onSave}
                  onShow={onShow}
                />
              </Box>
            )}
            <Stack
              direction={'column'}
              spacing={1}
              margin={1.5}
              alignItems={'flex-start'}
              flexGrow={10}
              //flex={2}
              sx={{ wordBreak: 'break-all' }}
            >
              <Typography
                fontWeight={'bold'}
                textAlign={'right'}
                display={'flex'}
                justifyContent={'space-between'}
                sx={{ width: '100%' }}
              >
                {(item.name?.length ?? 0) > 0 ? item.name : 'Неназванный проект'}
                <Typography component={'span'} sx={{ textAlign: 'right', minWidth: 68 }} color={'text.disabled'}>
                  {format(item.creationDate ?? '', 'HH:mm / dd.MM')}
                </Typography>
              </Typography>
              <Root>
                <Divider
                  orientation="horizontal"
                  sx={{
                    color: isSpecial ? 'secondary.main' : undefined,
                    ':before': {
                      borderColor: isSpecial ? 'secondary.main' : undefined,
                    },
                    ':after': {
                      borderColor: isSpecial ? 'secondary.main' : undefined,
                    },
                  }}
                  textAlign="right"
                >
                  {isSpecial && 'В редакторе'}
                </Divider>
              </Root>
              <Stack direction={'column'} justifyContent={'space-between'} alignItems={'flex-start'} flex={1} width={'100%'}>
                <Typography color={'text.secondary'} textAlign={'left'}>
                  {item.theme}
                </Typography>
              </Stack>
            </Stack>
          </ButtonBase>
          <div className={classes.itemToolbar}>
            <ProjectTools
              fromSave={item.backup}
              isLoading={isLoading}
              format={item.format}
              style={item.style}
              onClicks={{ show: onShow, edit: onEdit, delete: onDelete, save: onSave, download: onDownload }}
            />
          </div>
        </Paper>
      </ListItem>
    </Grow>
  );
};

const MFrame = React.memo(Frame, (prev, next) => {
  const equal = JSON.stringify(prev) == JSON.stringify(next);
  return equal;
});

export const RenderFrames: React.FC<IFrames> = (props) => {
  const { data, index, style } = props;
  const {
    onClick,
    loading,
    onEdit,
    onDelete,
    onDownload,
    onSave,
    onShow,
    projects,
    selectedItemId,
    localId,
    fullCard = false,
  } = data;
  const item = projects[index];

  const clickHandler = useCallback(() => {
    if (!fullCard) {
      onClick?.(item);
    }
  }, [item, data]);

  const editHandler = useCallback(() => {
    onEdit?.(item);
  }, [item, data]);

  const deleteHandler = useCallback(() => {
    onDelete?.(item);
  }, [item, data]);

  const downloadHandler = useCallback(() => {
    onDownload?.(item);
  }, [item, data]);

  const saveHandler = useCallback(() => {
    onSave?.(item);
  }, [item, data]);

  const showHandler = useCallback(() => {
    onShow?.(item, true, fullCard);
  }, [item, data]);

  return (
    <MFrame
      style={{ ...style, paddingTop: index && 8 }}
      item={item}
      isSelected={item.id == selectedItemId}
      isSpecial={item.id == localId}
      onClick={clickHandler}
      onEdit={editHandler}
      onDelete={deleteHandler}
      onDownload={downloadHandler}
      onSave={saveHandler}
      onShow={showHandler}
      fullCard={fullCard}
      isLoading={(loading?.findIndex((el) => el == item.id) ?? -1) >= 0}
    />
  );
};
