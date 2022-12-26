/* eslint-disable react/prop-types */
import { collection, getDocs } from 'firebase/firestore';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { db } from '../../firebase';
import { MapState, Stamp } from '../../types';
import { Circle, MapContainer, Marker, TileLayer } from 'react-leaflet';
import { Icon, LatLng, LatLngLiteral, Map } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { idb } from '../../idb';
import {
  AVAILABLE_AREA_RADIUS,
  DEFAULT_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
} from '../../constants';
import Header from '../templates/Header';
import Menu from '../templates/Menu';

const Home = (props: {
  currentPos: LatLngLiteral;
  setCurrentPos: Dispatch<SetStateAction<LatLngLiteral>>;
  mapState: MapState;
}) => {
  const { currentPos, setCurrentPos, mapState } = props;
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [map, setMap] = useState<Map | null>(null);

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
          radius={AVAILABLE_AREA_RADIUS}
          pathOptions={{ weight: 2, color: '#0072BC' }}
        />
      </Marker>
    );
  };

  return (
    <div>
      <Header className={'absolute z-10 ml-2 mt-2'} />
      <MapContainer
        center={mapState.center}
        zoom={mapState.zoom}
        maxZoom={MAX_ZOOM}
        minZoom={MIN_ZOOM}
        zoomControl={false}
        ref={setMap}
        className={'absolute z-0 w-full h-screen'}
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
                className: stamp.isStamped ? '' : 'filter grayscale opacity-70',
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
      <Menu
        buttons={[
          {
            name: 'ヘルプ',
            icon: '❓',
            onClick: () => {
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
            },
          },
          {
            name: 'スタンプを作成',
            icon: '➕',
            onClick: () => {
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
            },
          },
          {
            name: '集めたスタンプ',
            icon: '📖',
            onClick: () => {
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
            },
          },
          {
            name: '現在地',
            icon: '📍',
            onClick: () => {
              map?.setView(currentPos, DEFAULT_ZOOM);
            },
          },
        ]}
        className='absolute right-2 bottom-4'
      />
    </div>
  );
};

export default Home;
