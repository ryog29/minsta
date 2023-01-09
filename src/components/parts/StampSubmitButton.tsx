const StampSubmitButton = (props: {
  isSubmitDisable: boolean;
  className: string;
}) => {
  const { isSubmitDisable, className } = props;

  return (
    <div className={className}>
      <button
        type='submit'
        disabled={isSubmitDisable}
        className='bg-gray-400 text-white rounded px-2 py-2 font-bold disabled:opacity-25'
      >
        作成する
      </button>
    </div>
  );
};

export default StampSubmitButton;
