'use client';

import React, { ChangeEvent, useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';

import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded';
import {
  Backdrop,
  Button,
  ButtonBase,
  Divider,
  Grow,
  IconButton,
  Modal,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import { isNull, isUndefined } from 'lodash';
import { observer } from 'mobx-react-lite';

import { useToolsStyles } from '@/components/tools-elements';
import { useProcessStore } from '@/utils/mobx-stores';

export const SlideDetailsController = observer(() => {
  const {
    selectedSlideData,
    scenesDetails,
    heroes,
    deleteHero,
    deleteScene,
    addHero,
    addScene,
    createAddHero,
    createAddScene,
    updateHero,
    updateScene,
  } = useProcessStore();

  const slideData = selectedSlideData.get();

  if (isNull(slideData)) return null;

  return (
    <SlideDetails
      heroes={heroes.get()}
      scenes={scenesDetails.get()}
      slideScenes={slideData.scenesItems}
      s_itemDelete={(v: string) => {
        deleteScene(slideData.id, v);
      }}
      s_descriptionChange={(v: string, value: string) => {
        updateScene(v, { description: value });
      }}
      s_createItem={(item: { description: string }) => {
        if (item.description.length > 0) {
          createAddScene(slideData.id, { description: item.description });
          return true;
        }
        return false;
      }}
      s_itemSelect={(v: string) => {
        addScene(slideData.id, v);
      }}
      slideHeroes={slideData.heroesItems}
      h_itemDelete={(v: string) => {
        deleteHero(slideData.id, v);
      }}
      h_descriptionChange={(v: string, value: string) => {
        updateHero(v, { description: value });
      }}
      h_nameChange={(v: string, value: string) => {
        updateHero(v, { name: value });
      }}
      h_createItem={(item: { description: string; name: string | null }) => {
        if ((item?.name?.length ?? 0 > 0) && (item?.description.length ?? 0 > 0)) {
          createAddHero(slideData.id, { description: item.description, name: item.name ?? '' });
          return true;
        }
        return false;
      }}
      h_itemSelect={(v: string) => {
        addHero(slideData.id, v);
      }}
    />
  );
});

interface SlideDetailsProps {
  scenes: { id: string; description: string }[];
  heroes: { id: string; name: string; description: string }[];

  slideScenes: { id: string; description: string }[];
  s_itemDelete?: (v: string) => void;
  s_descriptionChange?: (v: string, value: string) => void;
  s_createItem?: (item: { description: string; name: string | null }) => boolean;
  s_itemSelect?: (v: string) => void;

  slideHeroes: { id: string; description: string }[];
  h_itemDelete?: (v: string) => void;
  h_descriptionChange?: (v: string, value: string) => void;
  h_nameChange?: (v: string, value: string) => void;
  h_createItem?: (item: { description: string; name: string | null }) => boolean;
  h_itemSelect?: (v: string) => void;
}

const SlideDetails: React.FC<SlideDetailsProps> = (props) => {
  const { scenes, heroes, slideScenes, slideHeroes } = props;

  const [visible, setVisible] = useState<boolean>(false);

  const changeModalVisible = () => {
    setVisible((prev) => !prev);
  };

  return (
    <>
      <Button onClick={changeModalVisible} variant={'outlined'}>
        Детали кадра
      </Button>
      <Modal
        open={visible}
        onClose={changeModalVisible}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
            sx: {
              backdropFilter: 'blur(10px)',
            },
          },
        }}
        sx={{ display: 'grid' }}
      >
        <Grow in={visible} timeout={500}>
          <Stack
            sx={{
              position: 'absolute',
              padding: 4,
              alignSelf: 'center',
              justifySelf: 'center',
              maxWidth: '80dvw',
              width: '100%',
            }}
            direction={'row'}
            gap={2}
          >
            <Paper elevation={0} sx={{ padding: 2, display: 'flex', maxWidth: '38dvw', flex: 1, width: '100%' }}>
              <Stack direction={'column'} flex={1} gap={2}>
                <Typography color="primary" textAlign={'center'}>
                  Сцена
                </Typography>

                <InputList
                  limitLenght={2}
                  oneField={true}
                  data={slideScenes}
                  createItem={props.s_createItem}
                  itemDelete={props.s_itemDelete}
                  descriptionChange={props.s_descriptionChange}
                />

                <Divider orientation="horizontal" flexItem />
                <Typography color="secondary" textAlign={'center'}>
                  Варианты
                </Typography>

                <Stack direction={'column'} gap={2} height={320}>
                  <ListItems data={scenes} itemSelect={props.s_itemSelect} />
                </Stack>
              </Stack>
            </Paper>

            <Paper elevation={0} sx={{ padding: 2, display: 'flex', maxWidth: '38dvw', flex: 1, width: '100%' }}>
              <Stack direction={'column'} flex={1} gap={3}>
                <Typography color="primary" textAlign={'center'}>
                  Герои
                </Typography>

                <InputList
                  limitLenght={2}
                  oneField={false}
                  data={slideHeroes}
                  createItem={props.h_createItem}
                  itemDelete={props.h_itemDelete}
                  nameChange={props.h_nameChange}
                  descriptionChange={props.h_descriptionChange}
                />

                <Divider orientation="horizontal" flexItem />
                <Typography color="secondary" textAlign={'center'}>
                  Варианты
                </Typography>

                <Stack direction={'column'} gap={2} height={320}>
                  <ListItems data={heroes} itemSelect={props.h_itemSelect} />
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </Grow>
      </Modal>
    </>
  );
};

interface IInputList {
  limitLenght: number;
  oneField?: boolean;
  data?: { id: string; description: string; name?: string }[];
  itemDelete?: (v: string) => void;
  descriptionChange?: (v: string, value: string) => void;
  nameChange?: (v: string, value: string) => void;
  createItem?: (item: { description: string; name: string | null }) => boolean;
}
const InputList: React.FC<IInputList> = (props) => {
  const { limitLenght, data = [], oneField = true, itemDelete, descriptionChange, nameChange, createItem } = props;
  const isFilled = data?.length >= limitLenght;
  return (
    <Stack direction={'column'} gap={2}>
      {!isFilled && <NewInputItem oneField={oneField} createItem={createItem} />}
      {data.map((item, index) => {
        return (
          <InputItem
            key={index}
            item={item}
            itemDelete={itemDelete}
            descriptionChange={descriptionChange}
            nameChange={nameChange}
          />
        );
      })}
    </Stack>
  );
};

const NAME_MAX = 80;
const DESCRIPTION_MAX = 160;

interface INewInputItem {
  oneField: boolean;
  createItem?: (item: { description: string; name: string | null }) => boolean;
}
const NewInputItem: React.FC<INewInputItem> = ({ oneField, createItem }) => {
  const [field1, setField1] = useState('');
  const [field2, setField2] = useState('');

  const constChangeF1 = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newText = e.target.value.slice(0, NAME_MAX);
    setField1(newText);
  };

  const onBur = () => {
    const item = {
      description: field2,
      name: oneField ? null : field1,
    };
    const res = createItem?.(item);
    if (res) {
      setField1('');
      setField2('');
    }
  };

  const constChangeF2 = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newText = e.target.value.slice(0, DESCRIPTION_MAX);
    setField2(newText);
  };

  return (
    <Stack direction={'row'} alignItems={'center'}>
      <Stack width={'100%'}>
        {!oneField && (
          <TextField
            value={field1}
            onChange={constChangeF1}
            onBlur={onBur}
            placeholder="Имя героя"
            fullWidth
            variant="standard"
            size="small"
            sx={{}}
          />
        )}
        <TextField
          value={field2}
          onChange={constChangeF2}
          onBlur={onBur}
          placeholder="Описание"
          fullWidth
          variant="standard"
          size="small"
          multiline
          sx={{}}
        />
      </Stack>
    </Stack>
  );
};

interface IInputItem {
  item: { id: string; description: string; name?: string };
  descriptionChange?: (v: string, value: string) => void;
  nameChange?: (v: string, value: string) => void;
  itemDelete?: (v: string) => void;
}
const InputItem: React.FC<IInputItem> = ({ item, descriptionChange, nameChange, itemDelete }) => {
  const [field1, setField1] = useState(item?.name ?? '');
  const [field2, setField2] = useState(item?.description ?? '');

  const constChangeF1 = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newText = e.target.value.slice(0, NAME_MAX);
    setField1(newText);
  };

  const onBurF1 = () => {
    nameChange?.(item.id, field1);
  };

  const constChangeF2 = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newText = e.target.value.slice(0, DESCRIPTION_MAX);
    setField2(newText);
  };

  const onBurF2 = () => {
    descriptionChange?.(item.id, field2);
  };

  return (
    <Stack direction={'row'} alignItems={'center'}>
      <Stack width={'100%'}>
        {!isUndefined(item?.name) && (
          <TextField
            value={field1}
            onChange={constChangeF1}
            onBlur={onBurF1}
            placeholder="Имя героя"
            fullWidth
            variant="standard"
            size="small"
            sx={{}}
          />
        )}
        <TextField
          value={field2}
          onChange={constChangeF2}
          onBlur={onBurF2}
          placeholder="Описание"
          fullWidth
          variant="standard"
          size="small"
          multiline
          sx={{}}
        />
      </Stack>
      <Tooltip title="Удалить">
        <IconButton sx={{ height: 40, width: 40 }} onClick={() => itemDelete?.(item.id)}>
          <HighlightOffRoundedIcon />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};

interface IFrames {
  data: {
    onClick?: (v: string) => void;
    source: { id: string; description: string; name?: string }[];
  };

  index: number;
  style: React.CSSProperties;
}

const ListItems: React.FC<{ data?: { id: string; description: string; name?: string }[]; itemSelect?: (v: string) => void }> = ({
  data = [],
  itemSelect,
}) => {
  const { classes: toolsClasses } = useToolsStyles();

  const renderItems = (props: IFrames) => {
    const { data, index, style } = props;
    const { onClick, source } = data;
    const item = source[index];

    return (
      <Stack direction={'row'} style={style}>
        <ButtonBase sx={{ width: '100%' }} onClick={() => onClick?.(item.id)}>
          <Stack width={'100%'}>
            {!isUndefined(item?.name) && (
              <Typography textAlign={'left'} fontWeight={'600'}>
                {item?.name}:
              </Typography>
            )}
            <TextField
              value={item?.description}
              placeholder="Герой"
              fullWidth
              variant="standard"
              size="small"
              multiline
              sx={{
                pointerEvents: 'none',
              }}
            />
          </Stack>
        </ButtonBase>
      </Stack>
    );
  };

  const itemClick = (id: string) => {
    itemSelect?.(id);
  };

  return (
    <AutoSizer>
      {({ height, width }) => (
        <FixedSizeList
          layout="vertical"
          //ref={listRef}
          className={`${toolsClasses.list}`}
          height={height}
          width={width}
          itemCount={data.length}
          itemSize={160}
          itemData={{
            onClick: itemClick,
            source: data,
          }}
        >
          {renderItems}
        </FixedSizeList>
      )}
    </AutoSizer>
  );
};
