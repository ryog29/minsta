import * as geofire from 'geofire-common';
import { db } from '../firebase';
import {
  collection,
  doc,
  GeoPoint,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

const geoPointList = [
  new GeoPoint(43.06417, 141.34694),
  new GeoPoint(40.82444, 140.74),
  new GeoPoint(39.70361, 141.1525),
  new GeoPoint(38.26889, 140.87194),
  new GeoPoint(39.71861, 140.1025),
  new GeoPoint(38.24056, 140.36333),
  new GeoPoint(37.75, 140.46778),
  new GeoPoint(36.34139, 140.44667),
  new GeoPoint(36.56583, 139.88361),
  new GeoPoint(36.39111, 139.06083),
  new GeoPoint(35.60472, 140.12333),
  new GeoPoint(35.68944, 139.69167),
  new GeoPoint(35.44778, 139.6425),
  new GeoPoint(37.90222, 139.02361),
  new GeoPoint(36.69528, 137.21139),
  new GeoPoint(36.59444, 136.62556),
  new GeoPoint(36.06528, 136.22194),
  new GeoPoint(35.66389, 138.56833),
  new GeoPoint(36.65139, 138.18111),
  new GeoPoint(35.39111, 136.72222),
  new GeoPoint(34.97694, 138.38306),
  new GeoPoint(35.18028, 136.90667),
  new GeoPoint(34.73028, 136.50861),
  new GeoPoint(35.00444, 135.86833),
  new GeoPoint(35.02139, 135.75556),
  new GeoPoint(34.68639, 135.52),
  new GeoPoint(34.69139, 135.18306),
  new GeoPoint(34.68528, 135.83278),
  new GeoPoint(34.22611, 135.1675),
  new GeoPoint(35.50361, 134.23833),
  new GeoPoint(35.47222, 133.05056),
  new GeoPoint(34.66167, 133.935),
  new GeoPoint(34.39639, 132.45944),
  new GeoPoint(34.18583, 131.47139),
  new GeoPoint(34.06583, 134.55944),
  new GeoPoint(34.34028, 134.04333),
  new GeoPoint(33.84167, 132.76611),
  new GeoPoint(33.55972, 133.53111),
  new GeoPoint(33.60639, 130.41806),
  new GeoPoint(33.24944, 130.29889),
  new GeoPoint(32.74472, 129.87361),
  new GeoPoint(32.78972, 130.74167),
  new GeoPoint(33.23806, 131.6125),
  new GeoPoint(31.91111, 131.42389),
  new GeoPoint(31.56028, 130.55806),
  new GeoPoint(26.2125, 127.68111),
];

export const setMockData = async () => {
  try {
    for (let i = 0; i < geoPointList.length; i++) {
      const stampsCollectionRef = doc(collection(db, 'stamps'));
      await setDoc(stampsCollectionRef, {
        name: 'テスト',
        coordinates: geoPointList[i],
        geohash: geofire.geohashForLocation([
          geoPointList[i].latitude,
          geoPointList[i].longitude,
        ]),
        address: 'テスト県テスト市テスト1-1-1',
        imageUrl:
          'https://firebasestorage.googleapis.com/v0/b/minsta-dev.appspot.com/o/stamp-images%2FWjzVeUcntolnRs4moqLO.png?alt=media&token=3e5846a2-2b5f-4859-8873-c204657b4429',
        createdBy: '太郎',
        createdAt: serverTimestamp(),
        stampedCount: 0,
      });
    }
  } catch (error) {
    console.warn(error);
  }
};
