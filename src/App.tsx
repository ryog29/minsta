import { useEffect, useState } from 'react';
import Home from './components/Home';
import { LatLngLiteral } from 'leaflet';
import { Link, Route, Routes } from 'react-router-dom';
import { DEFAULT_POS, DEFAULT_ZOOM } from './constants';
import { MapState } from './types';
import StampDetail from './components/StampDetail';
import Collection from './components/Collection';
import Create from './components/Create';
import Help from './components/Help';
import Top from './components/Top';
import NotFound from './components/NotFound';

const App = () => {
  // 位置情報の取得が完了したかどうか
  const [isReady, setIsReady] = useState(false);
  // 現在地の座標
  const [currentPos, setCurrentPos] = useState<LatLngLiteral>(DEFAULT_POS);
  // 地図の表示状態
  const [mapState, setMapState] = useState<MapState>({
    center: DEFAULT_POS,
    zoom: DEFAULT_ZOOM,
  });

  // 現在地を取得
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      console.warn(`Geolocation API is not supported`);
      setIsReady(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentPos({ lat: latitude, lng: longitude });
        setMapState({
          center: { lat: latitude, lng: longitude },
          zoom: DEFAULT_ZOOM,
        });
        setIsReady(true);
      },
      (err) => {
        console.warn(`ERROR(${err.code}): ${err.message}`);
        setIsReady(true);
      }
    );
  }, []);

  return (
    <>
      {isReady && (
        <div className='App'>
          <Link to={'/'} replace={true}>
            <h2 id='title'>minsta ({import.meta.env.MODE})</h2>
          </Link>
          <Routes>
            <Route path='/' element={<Top />} />
            <Route
              path='/home'
              element={<Home currentPos={currentPos} mapState={mapState} />}
            />
            <Route
              path='/stamps/:id'
              element={<StampDetail setMapState={setMapState} />}
            />
            <Route
              path='/collection'
              element={<Collection setMapState={setMapState} />}
            />
            <Route
              path='/create'
              element={<Create setMapState={setMapState} />}
            />
            <Route path='/help' element={<Help setMapState={setMapState} />} />
            <Route path='*' element={<NotFound />} />
          </Routes>
        </div>
      )}
    </>
  );
};

export default App;
