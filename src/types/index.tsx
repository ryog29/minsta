import { GeoPoint, Timestamp } from 'firebase/firestore';

export type Stamp = {
  id: string;
  name: string;
  coordinates: GeoPoint;
  address: string;
  imageUrl: string;
  createdBy: string;
  createdAt: Timestamp;
  stampedCount: number;
  isStamped: boolean;
};
