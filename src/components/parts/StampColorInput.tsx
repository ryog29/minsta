import { Dispatch, SetStateAction } from 'react';
import { DEFAULT_STAMP_COLOR } from '../../constants';
import { splitColorCode } from '../../lib/splitColorCode';

const StampColorInput = (props: {
  stampColor: string;
  setStampColor: Dispatch<SetStateAction<string>>;
  setErrorMsg: Dispatch<SetStateAction<string>>;
  className: string;
}) => {
  const { stampColor, setStampColor, setErrorMsg, className } = props;

  return (
    <div className={className}>
      <label className='mr-2'>スタンプカラー</label>
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
            setErrorMsg(
              'その色は選択できません。可視性が高い色を選択してください。'
            );
            e.target.value = stampColor;
          }
        }}
      />
    </div>
  );
};

export default StampColorInput;
