import { useEffect, useState } from 'react';
import Home from './components/Home';
import { LatLngLiteral } from 'leaflet';
import { Route, Routes } from 'react-router-dom';
import StampDetail from './components/StampDetail';
import Collection from './components/Collection';

const App = () => {
  // 位置情報の結果が取得できるまでレンダリングしない
  const [isReady, setIsReady] = useState(false);
  // 位置情報が取得できない場合は東京駅を表示
  const [location, setLocation] = useState<LatLngLiteral>({
    lat: 35.6810848,
    lng: 139.7650003,
  });

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      console.warn(`Geolocation API is not supported`);
      setIsReady(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
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
            <Route path='/' element={<Home initLoc={location} />} />
            <Route path='/stamps/:id' element={<StampDetail />} />
            <Route path='/collection' element={<Collection />} />
          </Routes>
        </div>
      )}
    </>
  );
};

export default App;
