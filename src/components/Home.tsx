/* eslint-disable react/prop-types */
import { collection, getDocs } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { db } from '../firebase';
import { MapState, Stamp } from '../types';
import { Circle, MapContainer, Marker, TileLayer } from 'react-leaflet';
import { Icon, LatLng, LatLngLiteral, Map } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { idb } from '../idb';
import { DEFAULT_ZOOM, MAX_ZOOM, MIN_ZOOM } from '../constants';

const Home = (props: { currentPos: LatLngLiteral; mapState: MapState }) => {
  const { mapState } = props;
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [map, setMap] = useState<Map | null>(null);
  const [currentPos, setCurrentPos] = useState<LatLngLiteral>(props.currentPos);

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const stampsCollectionRef = collection(db, 'stamps');
      const querySnapshot = await getDocs(stampsCollectionRef);
      setStamps(
        await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            return {
              id: doc.id,
              name: doc.data().name,
              coordinates: doc.data().coordinates,
              address: doc.data().address,
              imageUrl: doc.data().imageUrl,
              createdBy: doc.data().createdBy,
              createdAt: doc.data().createdAt,
              stampedCount: doc.data().stampedCount,
              isStamped: !!(await idb.stamps.get(doc.id)),
            };
          })
        )
      );
    })();
  }, []);

  const CurrentPositionMarker = (props: { map: Map | null }) => {
    const { map } = props;
    if (!map) return <></>;

    useEffect(() => {
      map.locate({ watch: true }).on('locationfound', function (e) {
        // TODO: 位置情報の変更に追従させる
        // map.setView(e.latlng, map.getZoom());
        setCurrentPos(e.latlng);
      });
    }, [map]);

    return (
      <Marker position={currentPos}>
        <Circle
          center={currentPos}
          radius={500}
          pathOptions={{ weight: 2, color: '#0072BC' }}
        />
      </Marker>
    );
  };

  const CurrentPositionButton = (props: { map: Map | null }) => {
    const { map } = props;
    if (!map) return <></>;

    const onClick = useCallback(() => {
      map.setView(currentPos, DEFAULT_ZOOM);
    }, [map]);

    return (
      <button onClick={onClick} className='current-position-button'>
        現在地
      </button>
    );
  };

  return (
    <div>
      <MapContainer
        center={mapState.center}
        zoom={mapState.zoom}
        maxZoom={MAX_ZOOM}
        minZoom={MIN_ZOOM}
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
                navigate(`/stamps/${stamp.id}`, {
                  state: {
                    from: 'Home',
                    mapState: {
                      center: map?.getCenter(),
                      zoom: map?.getZoom(),
                    },
                  },
                  replace: true,
                });
              },
            }}
          ></Marker>
        ))}
        <CurrentPositionMarker map={map} />
      </MapContainer>
      <CurrentPositionButton map={map} />
      <button
        onClick={() => {
          navigate(`/collection`, {
            state: {
              from: 'Home',
              mapState: {
                center: map?.getCenter(),
                zoom: map?.getZoom(),
              },
            },
            replace: true,
          });
        }}
        className='collection-button'
      >
        集めたスタンプ
      </button>
      <button
        onClick={() => {
          navigate(`/create`, {
            state: {
              from: 'Home',
              mapState: {
                center: map?.getCenter(),
                zoom: map?.getZoom(),
              },
            },
            replace: true,
          });
        }}
        className='create-stamp-button'
      >
        スタンプを作成
      </button>
      <button
        onClick={() => {
          navigate(`/help`, {
            state: {
              from: 'Home',
              mapState: {
                center: map?.getCenter(),
                zoom: map?.getZoom(),
              },
            },
            replace: true,
          });
        }}
        className='help-button'
      >
        ヘルプ
      </button>
    </div>
  );
};

export default Home;
