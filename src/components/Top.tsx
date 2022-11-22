import { useNavigate } from 'react-router-dom';

const Top = () => {
  const navigate = useNavigate();
  return (
    <div className='top'>
      <h2>トップ</h2>
      <button
        onClick={() => {
          navigate(`/home`, { state: { from: 'Top' }, replace: true });
        }}
      >
        ホームへ
      </button>
    </div>
  );
};

export default Top;
