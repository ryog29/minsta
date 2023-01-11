import { Dispatch, SetStateAction, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapState } from '../../types';
import NavigationButton from '../parts/NavigationButton';
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
      <div className='ml-2'>
        <NavigationButton
          className='my-1'
          onClick={() => {
            navigate(`/home`, { state: { from: 'Help' }, replace: true });
          }}
        >
          戻る
        </NavigationButton>
        <h2>ヘルプ</h2>
      </div>
    </>
  );
};

export default Help;
