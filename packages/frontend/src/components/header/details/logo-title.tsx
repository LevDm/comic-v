import React from 'react';

import { Luckiest_Guy } from 'next/font/google';

import { ButtonBase, SvgIcon, Typography } from '@mui/material';

import Logo from '../../../../public/logo.svg';
import { TPaths } from '../pages';

const luckiest = Luckiest_Guy({
  weight: ['400'],
  subsets: ['latin'],
  display: 'block',
});

interface ILogoTitle {
  onClick: (path: TPaths) => void;
}

export const LogoTitle: React.FC<ILogoTitle> = ({ onClick }) => {
  const clickHandler = () => {
    onClick('/');
  };
  return (
    <ButtonBase onClick={clickHandler} disableRipple>
      <SvgIcon
        component={Logo}
        viewBox="0 0 128 128"
        htmlColor="transparent"
        style={{ cursor: 'pointer', height: 26, width: 26 }}
      />
      <Typography
        variant="h6"
        noWrap
        sx={{
          fontFamily: luckiest.style.fontFamily,
          letterSpacing: 2,
          marginLeft: 0.4,
          display: {
            xs: 'none',
            sm: 'block',
          },
        }}
      >
        Comic V
      </Typography>
    </ButtonBase>
  );
};
