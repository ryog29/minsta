import { useEffect, useState } from 'react';
import Home from './components/Home';
import { LatLngLiteral } from 'leaflet';
import { Route, Routes } from 'react-router-dom';
import StampDetail from './components/StampDetail';
import Collection from './components/Collection';

// 座標の初期値(東京駅)
const initPos: LatLngLiteral = {
  lat: 35.6810848,
  lng: 139.7650003,
};

const App = () => {
  // 位置情報の取得が完了したかどうか
  const [isReady, setIsReady] = useState(false);
  // 表示中の座標
  const [displayPos, setDisplayPos] = useState<LatLngLiteral>(initPos);
  // 現在地の座標
  const [currentPos, setCurrentPos] = useState<LatLngLiteral>(initPos);

  // 現在地を取得
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      console.warn(`Geolocation API is not supported`);
      setIsReady(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setDisplayPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
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
          <h2 id='title'>minsta ({import.meta.env.MODE})</h2>
          <Routes>
            <Route
              path='/'
              element={<Home displayPos={displayPos} currentPos={currentPos} />}
            />
            <Route
              path='/stamps/:id'
              element={<StampDetail setDisplayPos={setDisplayPos} />}
            />
            <Route
              path='/collection'
              element={<Collection setDisplayPos={setDisplayPos} />}
            />
          </Routes>
        </div>
      )}
    </>
  );
};

export default App;
