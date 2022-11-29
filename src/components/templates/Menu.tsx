import MenuButton from '../parts/MenuButton';

const Menu = (props: {
  buttons: { name: string; icon: string; onClick: () => void }[];
  className: string;
}) => {
  const { buttons, className } = props;
  return (
    <div className={className}>
      {buttons.map((button) => (
        <MenuButton className='mb-2' onClick={button.onClick} key={button.name}>
          {button.icon}
        </MenuButton>
      ))}
    </div>
  );
};

export default Menu;
