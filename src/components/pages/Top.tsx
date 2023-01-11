import { useNavigate } from 'react-router-dom';
import NavigationButton from '../parts/NavigationButton';
import Header from '../templates/Header';

const Top = () => {
  const navigate = useNavigate();
  return (
    <>
      <Header className='ml-4 mt-4' />
      <div className='ml-2'>
        <h2 className='mt-2 text-2xl font-bold'>トップ</h2>
        <NavigationButton
          className='my-1'
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
