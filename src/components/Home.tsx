import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { Stamp } from '../types';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

  // [TODO] 現在地座標に置き換える
  const curLoc = new LatLng(35.681512, 139.765253);

  return (
    <div className='map-display'>
      <MapContainer center={curLoc} zoom={13} zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        {stamps.map((stamp) => (
          <Marker
            key={stamp.id}
            position={
              new LatLng(
                stamp.coordinates.latitude,
                stamp.coordinates.longitude
              )
            }
          >
            <Popup>
              <ul>
                <li>id: {stamp.id}</li>
                <li>name: {stamp.name}</li>
                <li>address: {stamp.address}</li>
                <li>createdBy: {stamp.createdBy}</li>
                <li>createdAt: {stamp.createdAt.toDate().toString()}</li>
                <li>stampedCount: {stamp.stampedCount}</li>
              </ul>
              <img className='stamp-image' src={stamp.imageUrl}></img>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Home;
