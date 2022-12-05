import {
  collection,
  doc,
  getDoc,
  increment,
  updateDoc,
} from 'firebase/firestore';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { db } from '../../firebase';
import { idb } from '../../idb';
import { MapState, Stamp } from '../../types';
import NavigationButton from '../parts/NavigationButton';
import Header from '../templates/Header';

const StampDetail = (props: {
  setMapState: Dispatch<SetStateAction<MapState>>;
}) => {
  const { setMapState } = props;
  const navigate = useNavigate();
  const { id } = useParams();
  if (!id) {
    console.warn(`No stamp id`);
    return null;
  }

  const location = useLocation();
  useEffect(() => {
    if (location.state?.from === 'Home') {
      const { mapState } = location.state;
      setMapState(mapState);
    }
  }, []);

  const [stamp, setStamp] = useState<Stamp>();

  useEffect(() => {
    (async () => {
      const stampsCollectionRef = collection(db, 'stamps');
      const stampDocRef = doc(stampsCollectionRef, id);
      const docSnap = await getDoc(stampDocRef);
      if (docSnap.exists()) {
        setStamp({
          id: docSnap.id,
          name: docSnap.data().name,
          coordinates: docSnap.data().coordinates,
          address: docSnap.data().address,
          imageUrl: docSnap.data().imageUrl,
          createdBy: docSnap.data().createdBy,
          createdAt: docSnap.data().createdAt,
          stampedCount: docSnap.data().stampedCount,
          isStamped: !!(await idb.stamps.get(id)),
        });
      } else {
        console.warn(`Not found stamp (id:${id})`);
      }
    })();
  }, []);

  async function getStamp() {
    if (!stamp || stamp.isStamped) return;
    try {
      const stampRef = doc(db, 'stamps', stamp.id);
      await updateDoc(stampRef, {
        stampedCount: increment(1),
      });
      await idb.stamps.add({
        id: stamp.id,
        name: stamp.name,
        imageUrl: stamp.imageUrl,
        stampedAt: new Date(),
      });
      setStamp({
        ...stamp,
        stampedCount: stamp.stampedCount + 1,
        isStamped: true,
      });
    } catch (error) {
      console.warn(`Failed to add ${id}: ${error}`);
    }
  }

  return (
    <>
      <Header className='ml-2 mt-2' />
      <div className='ml-2'>
        <NavigationButton
          className='my-1'
          onClick={() => {
            if (location.state?.from === 'Home') {
              navigate(`/home`, {
                state: { from: 'StampDetail' },
                replace: true,
              });
            } else if (location.state?.from === 'Collection') {
              navigate(`/collection`, {
                state: { from: 'StampDetail' },
                replace: true,
              });
            } else {
              navigate(`/`, { state: { from: 'StampDetail' }, replace: true });
            }
          }}
        >
          戻る
        </NavigationButton>
        <h2 className='mt-2 text-2xl font-bold'>スタンプ詳細</h2>
        {stamp && (
          <div>
            <ul>
              <li>id: {stamp.id}</li>
              <li>name: {stamp.name}</li>
              <li>address: {stamp.address}</li>
              <li>createdBy: {stamp.createdBy}</li>
              <li>createdAt: {stamp.createdAt.toDate().toString()}</li>
              <li>stampedCount: {stamp.stampedCount}</li>
              <li>isStamped: {String(stamp.isStamped)}</li>
            </ul>
            <img
              className={stamp.isStamped ? '' : 'filter grayscale opacity-70'}
              src={stamp.imageUrl}
              onClick={getStamp}
            ></img>
          </div>
        )}
      </div>
    </>
  );
};

export default StampDetail;
