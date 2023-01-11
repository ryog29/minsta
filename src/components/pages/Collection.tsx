import { useLiveQuery } from 'dexie-react-hooks';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { idb } from '../../idb';
import { MapState } from '../../types';
import BackButton from '../parts/BackButton';
import Header from '../templates/Header';

const Collection = (props: {
  setMapState: Dispatch<SetStateAction<MapState>>;
}) => {
  const { setMapState } = props;
  const navigate = useNavigate();
  const stamps = useLiveQuery(() =>
    idb.stamps
      .filter((stamp) => stamp.isStamped)
      .reverse()
      .sortBy('stampedAt')
  );

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
            navigate(`/home`, { state: { from: 'Collection' }, replace: true });
          }}
        />
        <h2 className='text-xl font-bold text-center'>
          集めたスタンプ: {stamps?.length}個
        </h2>
        <div className='mt-2 mx-12 grid grid-cols-3'>
          {stamps?.map((stamp) => (
            <div key={stamp.id} className='mx-1 my-1'>
              <Link
                to={`/stamps/${stamp.id}`}
                state={{ from: 'Collection' }}
                replace={true}
              >
                <img src={stamp.imageUrl}></img>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Collection;
