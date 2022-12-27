import { GeoPoint, Timestamp } from 'firebase/firestore';
import { LatLngLiteral } from 'leaflet';

export type Stamp = {
  id: string;
  name: string;
  coordinates: GeoPoint;
  geohash: string;
  address: string;
  imageUrl: string;
  createdBy: string;
  createdAt: Timestamp;
  stampedCount: number;
  isStamped: boolean;
};

export type StampIDB = {
  id: string;
  name: string;
  imageUrl: string;
  stampedAt: Date;
};

export type MapState = {
  center: LatLngLiteral;
  zoom: number;
};
