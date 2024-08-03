'use client';

import { Roboto } from 'next/font/google';

import { createTheme } from '@mui/material/styles';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 950,
      lg: 1200,
      xl: 1800,
    },
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#ce93d8',
    },
    secondary: {
      main: '#FF8F00', //'#9575cd',
    },
    background: {
      default: '#1F1D2B',
      paper: '#262332',
    },
  },
  components: {
    MuiAppBar: {
      defaultProps: {
        color: 'transparent',
        elevation: 0,
        style: {
          backgroundColor: '#26233280',
          backdropFilter: 'blur(10px)',
        },
      },
    },
  },
  shape: {
    borderRadius: 16,
  },
});
