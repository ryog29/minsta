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
  stampedAt?: Date;
};

export type StampIDB = {
  id: string;
  latLng: LatLngLiteral;
  imageUrl: string;
  isStamped: boolean;
  fetchedAt: Date;
  stampedAt?: Date;
};

export type MapState = {
  center: LatLngLiteral;
  zoom: number;
};
