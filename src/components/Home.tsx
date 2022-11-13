import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { Stamp } from '../types';
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet';
import { Icon, LatLng, LatLngLiteral } from 'leaflet';
import 'leaflet/dist/leaflet.css';

const Home = (props: { initLoc: LatLngLiteral }) => {
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [location, setLocation] = useState<LatLngLiteral>(props.initLoc);

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

  const LocationMarker = () => {
    const map = useMap();
    useEffect(() => {
      map.locate({ watch: true }).on('locationfound', function (e) {
        map.setView(e.latlng, map.getZoom());
        setLocation(e.latlng);
      });
    }, [map]);
    return (
      <Marker position={location}>
        <Circle
          center={location}
          radius={500}
          pathOptions={{ weight: 2, color: '#0072BC' }}
        />
      </Marker>
    );
  };

  return (
    <div className='map-display'>
      <MapContainer
        center={location}
        zoom={16}
        maxZoom={18}
        minZoom={6}
        zoomControl={false}
      >
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
            icon={
              new Icon({
                iconUrl: stamp.imageUrl,
                iconSize: [50, 50],
              })
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
        <LocationMarker />
      </MapContainer>
    </div>
  );
};

export default Home;
