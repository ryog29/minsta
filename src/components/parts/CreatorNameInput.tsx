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
      <input
        placeholder='作者名'
        {...register('creatorName', {
          required: true,
          maxLength: MAX_CREATOR_NAME_LENGTH,
        })}
        className='px-2 py-2 border border-solid border-gray-300 rounded'
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
