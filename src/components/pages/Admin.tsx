import { Dispatch, SetStateAction, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { idb } from '../../idb';
import { setMockData } from '../../lib/setMockData';
import { MapState } from '../../types';
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
      <Header className='ml-2 mt-2' />
      <div className='ml-2'>
        <NavigationButton
          className='my-1'
          onClick={() => {
            navigate(`/home`, { state: { from: 'Help' }, replace: true });
          }}
        >
          戻る
        </NavigationButton>
        <h2>管理者ページ</h2>
        <NavigationButton
          className='my-1'
          onClick={async () => {
            await setMockData();
            navigate(`/home`, { state: { from: 'Help' }, replace: true });
          }}
        >
          モックデータ作成
        </NavigationButton>
        <NavigationButton
          className='my-1'
          onClick={async () => {
            await idb.stamps.clear();
            navigate(`/home`, { state: { from: 'Help' }, replace: true });
          }}
        >
          IDBクリア
        </NavigationButton>
      </div>
    </>
  );
};

export default Admin;
