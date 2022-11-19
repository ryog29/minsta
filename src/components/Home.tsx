import { collection, getDocs } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { db } from '../firebase';
import { Stamp } from '../types';
import { Circle, MapContainer, Marker, TileLayer } from 'react-leaflet';
import { Icon, LatLng, LatLngLiteral, Map } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';

const Home = (props: {
  displayLoc: LatLngLiteral;
  currentLoc: LatLngLiteral;
}) => {
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [map, setMap] = useState<Map | null>(null);
  const [currentLoc, setCurrentLoc] = useState<LatLngLiteral>(props.currentLoc);

  const navigate = useNavigate();

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
            isStamped: false, // TODO: indexedDB に問い合わせる
          };
        })
      );
    });
  }, []);

  const LocationMarker = (props: { map: Map | null }) => {
    const { map } = props;
    if (!map) return <></>;

    useEffect(() => {
      map.locate({ watch: true }).on('locationfound', function (e) {
        // TODO: 位置情報の変更に追従させる
        // map.setView(e.latlng, map.getZoom());
        setCurrentLoc(e.latlng);
      });
    }, [map]);

    return (
      <Marker position={currentLoc}>
        <Circle
          center={currentLoc}
          radius={500}
          pathOptions={{ weight: 2, color: '#0072BC' }}
        />
      </Marker>
    );
  };

  const CurrentLocationButton = (props: { map: Map | null }) => {
    const { map } = props;
    if (!map) return <></>;

    const onClick = useCallback(() => {
      map.setView(currentLoc, map.getZoom());
    }, [map]);

    return (
      <button onClick={onClick} className='current-location-button'>
        現在地
      </button>
    );
  };

  return (
    <div>
      <MapContainer
        center={props.displayLoc}
        zoom={16}
        maxZoom={18}
        minZoom={6}
        zoomControl={false}
        ref={setMap}
        className='map-display'
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
                iconSize: [70, 70],
                className: stamp.isStamped
                  ? 'stamped-icon'
                  : 'not-stamped-icon',
              })
            }
            eventHandlers={{
              click: () => {
                navigate(`/stamps/${stamp.id}`, { replace: true });
              },
            }}
          ></Marker>
        ))}
        <LocationMarker map={map} />
      </MapContainer>
      <CurrentLocationButton map={map} />
      <button
        onClick={() => {
          navigate(`/collection`, { replace: true });
        }}
        className='collection-button'
      >
        集めたスタンプ
      </button>
    </div>
  );
};

export default Home;
