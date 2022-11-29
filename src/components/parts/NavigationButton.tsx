const NavigationButton = (props: {
  className: string;
  onClick: () => void;
  children?: React.ReactNode;
}) => {
  const { className, onClick, children } = props;

  return (
    <div className={className}>
      <button
        onClick={onClick}
        className='bg-gray-400 text-white rounded px-2 py-2 font-bold'
      >
        {children}
      </button>
    </div>
  );
};

export default NavigationButton;
