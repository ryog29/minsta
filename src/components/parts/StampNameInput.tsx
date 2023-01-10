import { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form';
import { MAX_STAMP_NAME_LENGTH } from '../../constants';

const StampNameInput = (props: {
  register: UseFormRegister<FieldValues>;
  errors: Partial<
    FieldErrorsImpl<{
      [x: string]: unknown;
    }>
  >;
  className: string;
}) => {
  const { register, errors, className } = props;

  return (
    <div className={className}>
      <input
        placeholder='スタンプ名'
        {...register('stampName', {
          required: true,
          maxLength: MAX_STAMP_NAME_LENGTH,
        })}
        className='px-2 py-2 border border-solid border-gray-300 rounded font-bold'
      />
      {errors.stampName?.type === 'required' && (
        <div className='text-red-500'>入力必須の項目です。</div>
      )}
      {errors.stampName?.type === 'maxLength' && (
        <div className='text-red-500'>
          {MAX_STAMP_NAME_LENGTH}文字以内で入力してください。
        </div>
      )}
    </div>
  );
};

export default StampNameInput;
