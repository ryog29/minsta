import { useEffect, useState } from 'react';
import Home from './components/pages/Home';
import { LatLngLiteral } from 'leaflet';
import { Route, Routes } from 'react-router-dom';
import { DEFAULT_POS, DEFAULT_ZOOM } from './constants';
import { MapState } from './types';
import StampDetail from './components/pages/StampDetail';
import Collection from './components/pages/Collection';
import Create from './components/pages/Create';
import Help from './components/pages/Help';
import Top from './components/pages/Top';
import NotFound from './components/pages/NotFound';

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
          <Routes>
            <Route path='/' element={<Top />} />
            <Route
              path='/home'
              element={
                <Home
                  currentPos={currentPos}
                  setCurrentPos={setCurrentPos}
                  mapState={mapState}
                />
              }
            />
            <Route
              path='/stamps/:id'
              element={
                <StampDetail
                  currentPos={currentPos}
                  setMapState={setMapState}
                />
              }
            />
            <Route
              path='/collection'
              element={<Collection setMapState={setMapState} />}
            />
            <Route
              path='/create'
              element={
                <Create currentPos={currentPos} setMapState={setMapState} />
              }
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
