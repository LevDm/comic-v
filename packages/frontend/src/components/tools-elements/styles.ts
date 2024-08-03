import { makeStyles } from 'tss-react/mui';

export const useToolsStyles = makeStyles()((theme) => ({
  list: {
    '::-webkit-scrollbar': {
      width: 5,
      borderRadius: 4,
      backgroundColor: theme.palette.secondary.dark,
    },
    '::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.secondary.main,
      borderRadius: 4,
    },
  },

  dashedFrame: {
    border: '2px dashed',
    borderColor: theme.palette.primary.main,
  },
  solidFrame: {
    border: '2px solid',
    borderColor: theme.palette.primary.main,
  },

  control: {
    borderRadius: theme.shape.borderRadius,
    minHeight: '40px',
    '& span': {
      margin: 0,
    },
  },
}));
