import iconBackButton from '../../assets/icon_back_button.svg';

const BackButton = (props: { className: string; onClick: () => void }) => {
  const { className, onClick } = props;

  return (
    <div className={className}>
      <img width={20} height={20} src={iconBackButton} onClick={onClick} />
    </div>
  );
};

export default BackButton;
