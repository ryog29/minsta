const StampSubmitButton = (props: { className: string }) => {
  const { className } = props;

  return (
    <div className={className}>
      <button
        type='submit'
        className='bg-gray-400 text-white rounded px-2 py-2 font-bold'
      >
        作成する
      </button>
    </div>
  );
};

export default StampSubmitButton;
