'use client';

import { useEffect } from 'react';

//import { useRouter } from 'next/router';
import { Button, Typography } from '@mui/material';

import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  container: {
    width: '100vw',
    height: '100dvh',
    display: 'flex',
    WebkitJustifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    fontSize: '64px',
  },
  button: {
    margin: '0 auto',
    marginTop: theme.spacing(2),
  },
}));

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { classes } = useStyles();

  useEffect(() => {
    console.error(error);
  }, [error]);

  const click = () => {
    reset();
  };

  return (
    <div className={classes.container}>
      <div className={classes.content}>
        <Typography variant="h6">{error.message || 'Неизвестная ошибка'}</Typography>

        <Button onClick={click} className={classes.button} variant="contained">
          Попробовать еще раз
        </Button>
      </div>
    </div>
  );
}
