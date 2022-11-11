import Home from './components/Home';

const App = () => {
  return (
    <div className='App'>
      <h2 id='title'>minsta ({import.meta.env.MODE})</h2>
      <Home />
    </div>
  );
};

export default App;
