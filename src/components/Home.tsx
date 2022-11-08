import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { Stamp } from '../types';

const Home = () => {
  const [stamps, setStamps] = useState<Stamp[]>([]);

  useEffect(() => {
    const stampsCollectionRef = collection(db, 'stamps');
    getDocs(stampsCollectionRef).then((querySnapshot) => {
      setStamps(
        querySnapshot.docs.map((doc): Stamp => {
          return {
            id: doc.id,
            name: doc.data().name,
            coordinates: doc.data().coordinates,
            address: doc.data().address,
            imageUrl: doc.data().imageUrl,
            createdBy: doc.data().createdBy,
            createdAt: doc.data().createdAt,
            stampedCount: doc.data().stampedCount,
          };
        })
      );
    });
  }, []);

  return (
    <div>
      {stamps.map((stamp) => (
        <div key={stamp.id}>
          <p>---------------------------------------</p>
          <p>id: {stamp.id}</p>
          <p>name: {stamp.name}</p>
          <p>
            coordinates: {stamp.coordinates.latitude},
            {stamp.coordinates.longitude}
          </p>
          <p>address: {stamp.address}</p>
          <p>imageUrl: {stamp.imageUrl}</p>
          <p>createdBy: {stamp.createdBy}</p>
          <p>createdAt: {stamp.createdAt.toString()}</p>
          <p>stampedCount: {stamp.stampedCount}</p>
        </div>
      ))}
    </div>
  );
};

export default Home;
