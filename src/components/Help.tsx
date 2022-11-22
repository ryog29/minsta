import { Dispatch, SetStateAction, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapState } from '../types';

const Help = (props: { setMapState: Dispatch<SetStateAction<MapState>> }) => {
  const { setMapState } = props;
  const navigate = useNavigate();

  const location = useLocation();
  useEffect(() => {
    if (location.state?.from === 'Home') {
      const { mapState } = location.state;
      setMapState(mapState);
    }
  }, []);

  return (
    <div className='help'>
      <button
        onClick={() => {
          navigate(`/`, { state: { from: 'Help' }, replace: true });
        }}
      >
        閉じる
      </button>
      <h2>ヘルプ</h2>
    </div>
  );
};

export default Help;
