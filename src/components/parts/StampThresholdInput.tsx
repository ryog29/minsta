import { Dispatch, SetStateAction } from 'react';
import { DEFAULT_THRESHOLD } from '../../constants';

const StampThresholdInput = (props: {
  setStampThreshold: Dispatch<SetStateAction<number>>;
  className: string;
}) => {
  const { setStampThreshold, className } = props;

  return (
    <div className={className}>
      <label className='mr-2'>濃さ</label>
      <input
        type='range'
        min='0'
        max='254'
        step='1'
        defaultValue={DEFAULT_THRESHOLD}
        onChange={(e) => {
          setStampThreshold(Number(e.target.value));
        }}
      />
    </div>
  );
};

export default StampThresholdInput;
