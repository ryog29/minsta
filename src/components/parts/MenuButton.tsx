const MenuButton = (props: {
  className: string;
  onClick: () => void;
  children?: React.ReactNode;
}) => {
  const { className, onClick, children } = props;

  return (
    <div className={className}>
      <button
        onClick={onClick}
        className='bg-white text-white border-2 border-gray-400 rounded px-2 py-2'
      >
        {children}
      </button>
    </div>
  );
};

export default MenuButton;
