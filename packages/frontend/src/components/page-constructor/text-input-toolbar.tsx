'use client';

import AddRounded from '@mui/icons-material/AddRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SettingsBackupRestoreRoundedIcon from '@mui/icons-material/SettingsBackupRestoreRounded';
import { Button, ButtonGroup, Stack, Tooltip } from '@mui/material';

import { LoadingLine, useToolsStyles } from '@/components/tools-elements';

export interface TextToolbarProps {
  countSymbols?: number;
  isLoading?: boolean;
  disabledBuild?: boolean;
  onClear?: () => void;
  onBuild?: () => void;
}
export const TextToolbar: React.FC<TextToolbarProps> = (props) => {
  const { countSymbols = 0, isLoading = false, disabledBuild = false, onClear, onBuild } = props;

  const { classes } = useToolsStyles();

  const buildClick = () => {
    onBuild?.();
  };

  const clearClick = () => {
    onClear?.();
  };

  const isRebuild = countSymbols > 0;

  return (
    <Stack direction={'row'} flexGrow={1} maxHeight={'40px'} margin={1}>
      <ButtonGroup variant="outlined">
        <Tooltip title={isRebuild ? 'Сгенерировать снова' : 'Сгенерировать'}>
          <Button
            disabled={disabledBuild || isLoading}
            startIcon={(isRebuild && <SettingsBackupRestoreRoundedIcon />) || <AddRounded />}
            className={classes.control}
            onClick={buildClick}
          />
        </Tooltip>
      </ButtonGroup>

      <LoadingLine visible={isLoading} />

      <ButtonGroup variant="outlined">
        <Tooltip title={'Стереть'}>
          <Button
            disabled={!(countSymbols > 0) || isLoading}
            startIcon={<CloseRoundedIcon />}
            className={classes.control}
            onClick={clearClick}
          />
        </Tooltip>
      </ButtonGroup>
    </Stack>
  );
};
