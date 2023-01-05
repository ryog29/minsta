import Dexie, { Table } from 'dexie';
import { StampIDB } from './types';

export class StampDexie extends Dexie {
  stamps!: Table<StampIDB>;

  constructor() {
    super('StampDB');
    this.version(1).stores({
      stamps: '&id, latLng, imageUrl, isStamped, fetchedAt, stampedAt',
    });
  }
}

export const idb = new StampDexie();
