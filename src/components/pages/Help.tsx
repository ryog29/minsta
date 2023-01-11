import { Dispatch, SetStateAction, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapState } from '../../types';
import BackButton from '../parts/BackButton';
import Header from '../templates/Header';

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
    <>
      <Header className='ml-4 mt-4' />
      <div>
        <BackButton
          className='ml-12 mt-4'
          onClick={() => {
            navigate(`/home`, { state: { from: 'Help' }, replace: true });
          }}
        />
        <h2 className='text-xl font-bold text-center'>ヘルプ</h2>
      </div>
    </>
  );
};

export default Help;
