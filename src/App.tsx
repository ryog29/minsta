import Home from './components/Home';

const App = () => {
  return (
    <div className='App'>
      <h1>env: {import.meta.env.MODE}</h1>
      <Home />
    </div>
  );
};

export default App;
