'use client';

import React, { useCallback } from 'react';

import Image from 'next/image';

import { Grow, ListItem } from '@mui/material';

import { isUndefined } from 'lodash';
import { makeStyles } from 'tss-react/mui';

import { TOptions } from '../types';

import { useToolsStyles } from '@/components/tools-elements';

interface IFrames {
  data: { onClick: (v: TOptions) => void; options: TOptions[]; selectedItem: null | TOptions };
  index: number;
  style: React.CSSProperties;
}

interface IFrame {
  target: boolean;
  image?: string;
  onClick: () => void;
  style: React.CSSProperties;
}

export const useStyles = makeStyles()((theme) => ({
  itemContainer: {
    padding: 0,
    paddingRight: 6,
  },
  imageItem: {
    height: '100%',
    width: '100%',
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    position: 'relative',
    userSelect: 'none',
    cursor: 'pointer',
  },
}));

const Frame: React.FC<IFrame> = (props) => {
  const { target, style, onClick, image } = props;

  const { classes: toolsClasses } = useToolsStyles();
  const { classes } = useStyles();

  return (
    <Grow in={true}>
      <ListItem className={classes.itemContainer} style={style} {...(!target && { onClick: onClick })}>
        <div className={`${classes.imageItem} ${target && toolsClasses.solidFrame}`}>
          <Grow in={!isUndefined(image)}>
            {(image && <Image src={`data:image/png;base64,${image}`} alt="" fill />) || <div />}
          </Grow>
        </div>
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
  const { onClick, options, selectedItem } = data;
  const item = options[index];
  const { image } = item;

  const target = selectedItem?.id == item.id;

  const clickHandler = useCallback(() => {
    onClick(item);
  }, [item]);

  return <MFrame style={{ ...style, paddingTop: index && 4 }} target={target} image={image} onClick={clickHandler} />;
};
