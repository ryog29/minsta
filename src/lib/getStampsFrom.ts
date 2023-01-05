import { db } from '../firebase';
import {
  collection,
  getDocs,
  orderBy,
  query,
  startAt,
  Timestamp,
} from 'firebase/firestore';
import { StampIDB } from '../types';

export const getStampsFrom = async (from: Timestamp) => {
  const stampsCollectionRef = collection(db, 'stamps');
  const q = query(stampsCollectionRef, orderBy('createdAt'), startAt(from));
  const querySnapshot = await getDocs(q);
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
