import { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form';

const StampImageInput = (props: {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  register: UseFormRegister<FieldValues>;
  errors: Partial<
    FieldErrorsImpl<{
      [x: string]: unknown;
    }>
  >;
  className: string;
}) => {
  const { onFileChange, register, errors, className } = props;

  return (
    <div className={className}>
      <input
        {...register('stampImage', {
          required: true,
        })}
        type='file'
        accept='image/*'
        onChange={onFileChange}
        className='w-64 text-sm text-gray-900 border border-gray-300 rounded cursor-pointer bg-gray-50'
      />
      {errors.stampImage?.type === 'required' && (
        <div className='text-red-500 text-xs text-center'>
          ファイルを選択してください。
        </div>
      )}
    </div>
  );
};

export default StampImageInput;
