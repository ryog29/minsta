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
        placeholder='作者名 (省略可)'
        {...register('creatorName', {
          maxLength: MAX_CREATOR_NAME_LENGTH,
        })}
        className='w-48 px-1 py-1 border border-solid border-gray-300 rounded text-sm text-center'
        maxLength={MAX_CREATOR_NAME_LENGTH}
      />
      {errors.creatorName?.type === 'maxLength' && (
        <div className='text-red-500 text-xs text-center'>
          {MAX_CREATOR_NAME_LENGTH}文字以内で入力してください。
        </div>
      )}
    </div>
  );
};

export default CreatorNameInput;
