const TapButton = (props: { className: string; onClick: () => void }) => {
  const { className, onClick } = props;

  return (
    <div className={className}>
      <button
        onClick={onClick}
        className='w-64 h-64 bg-blue-400 text-3xl text-white font-bold rounded-full'
      >
        Tap!
      </button>
    </div>
  );
};

export default TapButton;
