import { useNavigate } from 'react-router-dom';
import Header from '../templates/Header';

const Top = () => {
  const navigate = useNavigate();
  return (
    <>
      <Header className='ml-2 mt-2' />
      <div className='ml-2'>
        <h2>トップ</h2>
        <button
          onClick={() => {
            navigate(`/home`, { state: { from: 'Top' }, replace: true });
          }}
          className='my-2 bg-gray-400 text-white rounded px-2 py-2 font-bold'
        >
          ホームへ
        </button>
      </div>
    </>
  );
};

export default Top;
