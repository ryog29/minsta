import { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form';
import { MAX_CREATOR_NAME_LENGTH } from '../../constants';

const CreatorNameInput = (props: {
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
      <label className='mr-2'>作者名</label>
      <input
        {...register('creatorName', {
          required: true,
          maxLength: MAX_CREATOR_NAME_LENGTH,
        })}
        className='px-1 py-1 border border-solid border-gray-300 rounded text-sm'
      />
      {errors.creatorName?.type === 'required' && (
        <div className='text-red-500'>入力必須の項目です。</div>
      )}
      {errors.creatorName?.type === 'maxLength' && (
        <div className='text-red-500'>
          {MAX_CREATOR_NAME_LENGTH}文字以内で入力してください。
        </div>
      )}
    </div>
  );
};

export default CreatorNameInput;
