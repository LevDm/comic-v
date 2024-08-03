import React from 'react';

import { Box, Grow, Tooltip } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';

export const LoadingLine: React.FC<{ visible?: boolean; api?: ('G' | 'K')[] }> = ({ visible, api = [] }) => {
  return (
    <Grow in={visible ?? true} timeout={300}>
      <Box
        sx={{
          width: '100%',
          marginX: 2,
          alignSelf: 'center',
          display: 'flex',
          flexDirection: 'row',
          gap: 0.5,
        }}
      >
        {api.includes('G') && (
          <Tooltip title={'Gigachat'}>
            <div
              style={{
                minHeight: 8,
                minWidth: 8,
                borderRadius: 4,
                backgroundColor: 'white',
              }}
            />
          </Tooltip>
        )}
        {api.includes('K') && (
          <Tooltip title={'Kandinsky'}>
            <div
              style={{
                minHeight: 8,
                minWidth: 8,
                borderRadius: 4,
                backgroundColor: '#E3FF6C',
              }}
            />
          </Tooltip>
        )}
        <Box
          sx={{
            borderRadius: 10,
            overflow: 'hidden',
            width: '100%',
            alignSelf: 'center',
          }}
        >
          <LinearProgress color="secondary" />
        </Box>
      </Box>
    </Grow>
  );
};
