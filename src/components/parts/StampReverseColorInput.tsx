import { Dispatch, SetStateAction } from 'react';

const StampReverseColorInput = (props: {
  setIsReverseColor: Dispatch<SetStateAction<boolean>>;
  className: string;
}) => {
  const { setIsReverseColor, className } = props;

  return (
    <div className={className}>
      <label className='mr-1'>色反転</label>
      <input
        type='checkbox'
        onChange={(e) => {
          setIsReverseColor(e.target.checked);
        }}
      />
    </div>
  );
};

export default StampReverseColorInput;
