import {
  collection,
  doc,
  getDoc,
  increment,
  updateDoc,
} from 'firebase/firestore';
import { LatLng, LatLngLiteral } from 'leaflet';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AVAILABLE_AREA_RADIUS } from '../../constants';
import { db } from '../../firebase';
import { idb } from '../../idb';
import { formatDate } from '../../lib/formatDate';
import { MapState, Stamp } from '../../types';
import BackButton from '../parts/BackButton';
import TapButton from '../parts/TapButton';
import Header from '../templates/Header';

const StampDetail = (props: {
  currentPos: LatLngLiteral;
  setMapState: Dispatch<SetStateAction<MapState>>;
}) => {
  const { currentPos, setMapState } = props;
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
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [distanceFromStamp, setDistanceFromStamp] = useState<number>();

  useEffect(() => {
    (async () => {
      const stampsCollectionRef = collection(db, 'stamps');
      const stampDocRef = doc(stampsCollectionRef, id);
      const docSnap = await getDoc(stampDocRef);
      if (docSnap.exists()) {
        const idbStamp = await idb.stamps.get(id);
        setStamp({
          id: docSnap.id,
          name: docSnap.data().name,
          coordinates: docSnap.data().coordinates,
          geohash: docSnap.data().geohash,
          address: docSnap.data().address,
          imageUrl: docSnap.data().imageUrl,
          createdBy: docSnap.data().createdBy,
          createdAt: docSnap.data().createdAt,
          stampedCount: docSnap.data().stampedCount,
          isStamped: idbStamp ? idbStamp.isStamped : false,
          stampedAt: idbStamp?.stampedAt,
        });
      } else {
        console.warn(`Not found stamp (id:${id})`);
      }
    })();
  }, []);

  useEffect(() => {
    // 現在地からスタンプまでの距離を計算し押印可能かチェック
    if (currentPos && stamp) {
      const stampLatLng = new LatLng(
        stamp.coordinates.latitude,
        stamp.coordinates.longitude
      );
      const distance = Math.ceil(stampLatLng.distanceTo(currentPos));
      setDistanceFromStamp(distance - AVAILABLE_AREA_RADIUS);
      if (distance <= AVAILABLE_AREA_RADIUS) {
        setIsAvailable(true);
      }
    }
  }, [currentPos, stamp]);

  async function getStamp() {
    if (!stamp) return;
    try {
      const stampRef = doc(db, 'stamps', stamp.id);
      await updateDoc(stampRef, {
        stampedCount: increment(1),
      });
      const stampedAt = new Date();
      await idb.stamps.update(stamp.id, {
        isStamped: true,
        stampedAt: stampedAt,
      });
      setStamp({
        ...stamp,
        stampedCount: stamp.stampedCount + 1,
        isStamped: true,
        stampedAt: stampedAt,
      });
    } catch (error) {
      console.warn(`Failed to add ${id}: ${error}`);
    }
  }

  return (
    <>
      <Header className='ml-4 mt-4' />
      <div>
        <BackButton
          className='ml-12 mt-4'
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
        />
        {stamp && (
          <div className='flex flex-col items-center'>
            <h2 className='text-xl font-bold'>{stamp.name}</h2>
            {stamp.isStamped ? (
              <img className='my-2 w-64 h-64' src={stamp.imageUrl}></img>
            ) : isAvailable ? (
              <TapButton className='my-2' onClick={getStamp} />
            ) : (
              <p className='my-24 font-bold text-red-600'>
                スタンプから離れすぎています。
                <br />
                このスタンプを押すにはあと
                <br />
                {distanceFromStamp}m以上近づいてください。
              </p>
            )}
            <ul className='font-bold'>
              <li>場所: {stamp.address}</li>
              <li>作成者: {stamp.createdBy}</li>
              <li>押された回数: {stamp.stampedCount}</li>
              <li>
                押した日時: {stamp.stampedAt && formatDate(stamp.stampedAt)}
              </li>
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default StampDetail;
