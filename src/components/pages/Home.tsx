/* eslint-disable react/prop-types */
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { MapState } from '../../types';
import { Circle, MapContainer, Marker, TileLayer } from 'react-leaflet';
import { Icon, LatLngLiteral, LocationEvent, Map } from 'leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import {
  AVAILABLE_AREA_RADIUS,
  DEFAULT_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
} from '../../constants';
import Header from '../templates/Header';
import Menu from '../templates/Menu';
import useSupercluster from 'use-supercluster';
import useFetchStamps from '../../hooks/useFetchStamps';

const fetchIcon = (count: number, size: number) => {
  return L.divIcon({
    html: `<div style=
      "width: ${size}px; height: ${size}px; color: #fff; background: #1978c8; border-radius: 50%;
      padding: 10px; display: flex; justify-content: center; align-items: center;"> ${count}
      </div>`,
    className: '',
  });
};

const Home = (props: {
  currentPos: LatLngLiteral;
  setCurrentPos: Dispatch<SetStateAction<LatLngLiteral>>;
  mapState: MapState;
}) => {
  const { currentPos, setCurrentPos, mapState } = props;
  const [map, setMap] = useState<Map | null>(null);
  const [bounds, setBounds] = useState<[number, number, number, number]>();
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  const navigate = useNavigate();

  const stamps = useFetchStamps();

  const CurrentPositionMarker = (props: { map: Map | null }) => {
    const { map } = props;
    if (!map) return <></>;

    const locationfoundCb = useCallback(
      (e: LocationEvent) => {
        // TODO: 位置情報の変更に追従させる
        // map.setView(e.latlng, map.getZoom());
        setCurrentPos(e.latlng);
      },
      [map, setCurrentPos]
    );

    useEffect(() => {
      map.locate({ watch: true }).on('locationfound', locationfoundCb);
      return () => {
        map.off('locationfound', locationfoundCb);
      };
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

  const updateMap = useCallback(() => {
    if (map) {
      const b = map.getBounds();
      setBounds([
        b.getSouthWest().lng,
        b.getSouthWest().lat,
        b.getNorthEast().lng,
        b.getNorthEast().lat,
      ]);
      setZoom(map.getZoom());
    }
  }, [map]);

  useEffect(() => {
    if (map) {
      // 最初の表示で bounds をセットするために一度実行する
      updateMap();
      map.on('moveend', updateMap);
      return () => {
        map.off('moveend', updateMap);
      };
    }
  }, [map, updateMap]);

  const points = stamps.map((stamp) => ({
    type: 'Feature',
    properties: { cluster: false, ...stamp },
    geometry: {
      type: 'Point',
      coordinates: [stamp.latLng.lng, stamp.latLng.lat],
    },
  }));

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,
    zoom,
    options: { radius: 150, maxZoom: MAX_ZOOM },
  });

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
        {clusters.map((cluster) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const { cluster: isCluster, point_count: pointCount } =
            cluster.properties;
          if (isCluster) {
            return (
              <Marker
                key={cluster.id}
                position={[latitude, longitude]}
                icon={fetchIcon(
                  pointCount,
                  30 + (pointCount / points.length) * 50
                )}
                eventHandlers={{
                  click: () => {
                    const expansionZoom = Math.min(
                      supercluster.getClusterExpansionZoom(cluster.id),
                      14
                    );
                    map?.setView([latitude, longitude], expansionZoom, {
                      animate: true,
                    });
                  },
                }}
              ></Marker>
            );
          }
          return (
            <Marker
              key={cluster.properties.id}
              position={[latitude, longitude]}
              icon={
                new Icon({
                  iconUrl: cluster.properties.imageUrl,
                  iconSize: [70, 70],
                  className: cluster.properties.isStamped
                    ? ''
                    : 'filter grayscale opacity-70',
                })
              }
              eventHandlers={{
                click: () => {
                  navigate(`/stamps/${cluster.properties.id}`, {
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
            />
          );
        })}
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
