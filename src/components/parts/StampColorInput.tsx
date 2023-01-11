import { Dispatch, SetStateAction, useState } from 'react';
import { DEFAULT_STAMP_COLOR } from '../../constants';
import { splitColorCode } from '../../lib/splitColorCode';

const StampColorInput = (props: {
  stampColor: string;
  setStampColor: Dispatch<SetStateAction<string>>;
  className: string;
}) => {
  const { stampColor, setStampColor, className } = props;

  const [errorMsg, setErrorMsg] = useState<string>('');

  return (
    <div className={className}>
      <input
        type='color'
        defaultValue={DEFAULT_STAMP_COLOR}
        onBlur={(e) => {
          const colorCode = splitColorCode(e.target.value);
          // 色が薄すぎるスタンプを作成できないようにRGB全ての値が同時に200を超えないようチェック
          const isValid = !colorCode.every((c) => c > 200);
          if (isValid) {
            setStampColor(e.target.value);
            setErrorMsg('');
          } else {
            setErrorMsg('その色は選択できません。');
            e.target.value = stampColor;
          }
        }}
      />
      {errorMsg && (
        <div className='text-red-500 text-xs text-center'>{errorMsg}</div>
      )}
    </div>
  );
};

export default StampColorInput;
