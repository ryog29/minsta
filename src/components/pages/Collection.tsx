import { useLiveQuery } from 'dexie-react-hooks';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { idb } from '../../idb';
import { MapState } from '../../types';
import NavigationButton from '../parts/NavigationButton';
import Header from '../templates/Header';

const Collection = (props: {
  setMapState: Dispatch<SetStateAction<MapState>>;
}) => {
  const { setMapState } = props;
  const navigate = useNavigate();
  const stamps = useLiveQuery(() => idb.stamps.toArray());

  const location = useLocation();
  useEffect(() => {
    if (location.state?.from === 'Home') {
      const { mapState } = location.state;
      setMapState(mapState);
    }
  }, []);

  // TODO: 押した日時順でソートして表示
  return (
    <>
      <Header className='ml-2 mt-2' />
      <div className='ml-2'>
        <NavigationButton
          className='my-1'
          onClick={() => {
            navigate(`/home`, { state: { from: 'Collection' }, replace: true });
          }}
        >
          戻る
        </NavigationButton>
        <h2 className='mt-2 text-2xl font-bold'>
          集めたスタンプ数: {stamps?.length}
        </h2>
        {stamps?.map((stamp) => (
          <div key={stamp.id} className='mt-2'>
            <p>スタンプ名: {stamp.name}</p>
            <p>押した日時: {stamp.stampedAt.toISOString()}</p>
            <Link
              to={`/stamps/${stamp.id}`}
              state={{ from: 'Collection' }}
              replace={true}
            >
              <img src={stamp.imageUrl} className='w-52 h-52'></img>
            </Link>
          </div>
        ))}
      </div>
    </>
  );
};

export default Collection;
