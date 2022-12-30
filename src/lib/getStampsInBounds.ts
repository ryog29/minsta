import * as geofire from 'geofire-common';
import { db } from '../firebase';
import {
  collection,
  endAt,
  getDocs,
  orderBy,
  query,
  startAt,
} from 'firebase/firestore';
import { Stamp } from '../types';
import { idb } from '../idb';

export const getStampsInBounds = async (
  center: [number, number],
  radius: number
) => {
  const bounds = geofire.geohashQueryBounds(center, radius);
  const result: Stamp[] = [];

  for (const b of bounds) {
    const q = query(
      collection(db, 'stamps'),
      orderBy('geohash'),
      startAt(b[0]),
      endAt(b[1])
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => {
      result.push({
        id: doc.id,
        name: doc.data().name,
        coordinates: doc.data().coordinates,
        geohash: doc.data().geohash,
        address: doc.data().address,
        imageUrl: doc.data().imageUrl,
        createdBy: doc.data().createdBy,
        createdAt: doc.data().createdAt,
        stampedCount: doc.data().stampedCount,
        isStamped: !!(await idb.stamps.get(doc.id)),
      });
    });
  }

  return result;
};
