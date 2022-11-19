import { collection, doc, getDoc } from 'firebase/firestore';
import { LatLngLiteral } from 'leaflet';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../firebase';
import { idb } from '../idb';
import { Stamp } from '../types';

const StampDetail = (props: {
  setDisplayLoc: Dispatch<SetStateAction<LatLngLiteral>>;
}) => {
  const { setDisplayLoc } = props;
  const navigate = useNavigate();
  const { id } = useParams();
  if (!id) {
    console.warn(`No stamp id`);
    return null;
  }

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
        // 地図の表示座標を更新する
        setDisplayLoc({
          lat: docSnap.data().coordinates.latitude,
          lng: docSnap.data().coordinates.longitude,
        });
      } else {
        console.warn(`Not found stamp (id:${id})`);
      }
    })();
  }, []);

  async function getStamp() {
    if (!stamp) return;
    try {
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
      // TODO: firestore の stampedCount を更新
    } catch (error) {
      console.warn(`Failed to add ${id}: ${error}`);
    }
  }

  return (
    <div className='stamp-detail'>
      <button
        onClick={() => {
          navigate(`/`, { replace: true });
        }}
      >
        戻る
      </button>
      <h2>スタンプ詳細</h2>
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
            className={`${
              stamp.isStamped ? 'stamped-icon' : 'not-stamped-icon'
            } stamp-image`}
            src={stamp.imageUrl}
          ></img>
        </div>
      )}
      <button onClick={getStamp} disabled={stamp?.isStamped}>
        スタンプを押す
      </button>
    </div>
  );
};

export default StampDetail;
