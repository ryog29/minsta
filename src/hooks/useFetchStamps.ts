import { Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { idb } from '../idb';
import { getAllStamps } from '../lib/getAllStamps';
import { getStampsFrom } from '../lib/getStampsFrom';
import { StampIDB } from '../types';

const useFetchStamps = () => {
  const [stamps, setStamps] = useState<StampIDB[]>([]);

  useEffect(() => {
    (async () => {
      // IDBから読み出し
      const idbStamps = await idb.stamps.toArray();
      if (idbStamps.length === 0) {
        // IDB内にデータがなければ全てのデータをフェッチしてStateとIDBに書き込む
        const allStamps = await getAllStamps();
        await idb.stamps.bulkAdd(allStamps);
        setStamps(allStamps);
      } else {
        // IDB内に既存のデータがあり、IDB内の最後にフェッチしたスタンプの時刻より後に作成されたスタンプが
        // ある: フェッチしてStateとIDBに書き込む
        // ない: IDBから読み出したデータをそのままStateにセットする
        const lastFetchedStamp = idbStamps.reduce((a, b) => {
          return a.fetchedAt > b.fetchedAt ? a : b;
        });
        const stampsFromLastFetch = await getStampsFrom(
          Timestamp.fromDate(lastFetchedStamp.fetchedAt)
        );
        if (stampsFromLastFetch.length === 0) {
          setStamps(idbStamps);
        } else {
          await idb.stamps.bulkAdd(stampsFromLastFetch);
          setStamps([...stampsFromLastFetch, ...idbStamps]);
        }
      }
    })();
  }, []);

  return stamps;
};

export default useFetchStamps;
