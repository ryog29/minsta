import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { StampIDB } from '../types';

export const getAllStamps = async () => {
  const stampsCollectionRef = collection(db, 'stamps');
  const querySnapshot = await getDocs(stampsCollectionRef);
  const res: StampIDB[] = await Promise.all(
    querySnapshot.docs.map(async (doc) => {
      return {
        id: doc.id,
        latLng: {
          lat: doc.data().coordinates.latitude,
          lng: doc.data().coordinates.longitude,
        },
        imageUrl: doc.data().imageUrl,
        isStamped: false,
        fetchedAt: new Date(),
      };
    })
  );
  return res;
};
