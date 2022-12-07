import { Dispatch, SetStateAction } from 'react';
import {
  STAMP_COLOR_AQUA,
  STAMP_COLOR_BLUE,
  STAMP_COLOR_FUCHSIA,
  STAMP_COLOR_LIME,
  STAMP_COLOR_RED,
  STAMP_COLOR_YELLOW,
} from '../../constants';

const ColorSelector = (props: {
  setStampColor: Dispatch<SetStateAction<string>>;
}) => {
  const { setStampColor } = props;
  return (
    <div>
      <input
        type='radio'
        name='stampColor'
        value={STAMP_COLOR_RED}
        onChange={(e) => {
          setStampColor(e.target.value);
        }}
        defaultChecked={true}
      />
      <label className='mr-1'>RED</label>
      <input
        type='radio'
        name='stampColor'
        value={STAMP_COLOR_LIME}
        onChange={(e) => {
          setStampColor(e.target.value);
        }}
      />
      <label className='mr-1'>LIME</label>
      <input
        type='radio'
        name='stampColor'
        value={STAMP_COLOR_BLUE}
        onChange={(e) => {
          setStampColor(e.target.value);
        }}
      />
      <label className='mr-1'>BLUE</label>
      <input
        type='radio'
        name='stampColor'
        value={STAMP_COLOR_YELLOW}
        onChange={(e) => {
          setStampColor(e.target.value);
        }}
      />
      <label className='mr-1'>YELLOW</label>
      <input
        type='radio'
        name='stampColor'
        value={STAMP_COLOR_AQUA}
        onChange={(e) => {
          setStampColor(e.target.value);
        }}
      />
      <label className='mr-1'>AQUA</label>
      <input
        type='radio'
        name='stampColor'
        value={STAMP_COLOR_FUCHSIA}
        onChange={(e) => {
          setStampColor(e.target.value);
        }}
      />
      <label className='mr-1'>FUCHSIA</label>
    </div>
  );
};

export default ColorSelector;
