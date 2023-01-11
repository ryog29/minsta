import { Dispatch, SetStateAction, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { idb } from '../../idb';
import { setMockData } from '../../lib/setMockData';
import { MapState } from '../../types';
import BackButton from '../parts/BackButton';
import NavigationButton from '../parts/NavigationButton';
import Header from '../templates/Header';

const Admin = (props: { setMapState: Dispatch<SetStateAction<MapState>> }) => {
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
            navigate(`/home`, { state: { from: 'Admin' }, replace: true });
          }}
        />
        <h2 className='text-xl font-bold text-center'>管理者ページ</h2>
        <div className='mt-4 text-center'>
          <NavigationButton
            className='my-4'
            onClick={async () => {
              await setMockData();
              navigate(`/home`, { state: { from: 'Admin' }, replace: true });
            }}
          >
            モックデータ作成
          </NavigationButton>
          <NavigationButton
            className='my-4'
            onClick={async () => {
              await idb.stamps.clear();
              navigate(`/home`, { state: { from: 'Admin' }, replace: true });
            }}
          >
            IDBクリア
          </NavigationButton>
        </div>
      </div>
    </>
  );
};

export default Admin;
