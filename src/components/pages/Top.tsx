import { useNavigate } from 'react-router-dom';
import NavigationButton from '../parts/NavigationButton';
import Header from '../templates/Header';

const Top = () => {
  const navigate = useNavigate();
  return (
    <>
      <Header className='ml-4 mt-4' />
      <div>
        <NavigationButton
          className='mt-20 text-center'
          onClick={() => {
            navigate(`/home`, { state: { from: 'Top' }, replace: true });
          }}
        >
          ホームへ
        </NavigationButton>
      </div>
    </>
  );
};

export default Top;
