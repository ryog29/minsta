import { collection, doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { Stamp } from '../types';

const StampDetail = () => {
  const { id } = useParams();
  if (!id) {
    console.warn(`No stamp id`);
    return null;
  }

  const [stamp, setStamp] = useState<Stamp>();

  useEffect(() => {
    const stampsCollectionRef = collection(db, 'stamps');
    const stampDocRef = doc(stampsCollectionRef, id);
    getDoc(stampDocRef).then((docSnap) => {
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
          isStamped: false, // TODO: indexedDB に問い合わせる
        });
      } else {
        console.warn(`Not found stamp (id:${id})`);
      }
    });
  }, []);

  return (
    <div className='stamp-detail'>
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
    </div>
  );
};

export default StampDetail;
