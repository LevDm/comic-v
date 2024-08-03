import React, { memo, useEffect, useRef, useState } from 'react';

import { ButtonBase, Tooltip } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';

import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  button: {
    flex: 1,
    borderRadius: theme.shape.borderRadius * 2,
    padding: theme.spacing(1),
  },
  propgessContainer: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },
}));

const DURATION = {
  play: 3000,
  tick: 300,
};

interface IShowLinePart {
  id: string;
  order: number;
  value: number;
  onChange: (id: string) => void;
  onEnd: (id: string) => void;
  play: boolean;
}

const Line: React.FC<IShowLinePart> = ({ id, value, order, play, onChange, onEnd }) => {
  const { classes } = useStyles();

  const [progress, setProgress] = useState<number>(0);

  const run = useRef<{ ticker: NodeJS.Timeout; timer: NodeJS.Timeout } | null>(null);

  const tick = () => {
    setProgress((oldProgress) => {
      const diff = 100 / (DURATION.play / DURATION.tick);
      const res = Math.min(oldProgress + diff, 100);
      return res;
    });
  };

  const stop = () => {
    clearInterval(run.current?.ticker);
    clearTimeout(run.current?.timer);
  };

  useEffect(() => {
    if (value != progress) {
      stop();
      setProgress(value);
    }
    if (play) {
      const ticker = setInterval(tick, DURATION.tick);
      const timer = setTimeout(cancel, DURATION.play + 300);

      run.current = {
        ticker: ticker,
        timer: timer,
      };

      return () => {
        clearInterval(ticker);
        clearTimeout(timer);
      };
    }
  }, [play, value]);

  const cancel = () => {
    stop();
    onEnd(id);
  };

  const clickHandler = () => {
    onChange(id);
  };

  return (
    <Tooltip title={`Слайд ${order}`}>
      <ButtonBase className={classes.button} onClick={clickHandler}>
        <div className={classes.propgessContainer}>
          <LinearProgress variant="determinate" value={progress} color="secondary" />
        </div>
      </ButtonBase>
    </Tooltip>
  );
};
export const ShowLinePart = memo(Line);
