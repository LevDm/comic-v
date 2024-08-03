//import Watermark from '../../public/watermark.svg';

export const backgroundWatermark = () => {
  const ground = '#111111';

  return {
    backgroundImage: `url('${'/watermark.svg'}')`,
    backgroundRepeat: 'repeat',
    backgroundSize: '60px 60px',
    backgroundPosition: 'center',
    backgroundColor: ground,
  };
};
