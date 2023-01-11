import Header from '../templates/Header';

const NotFound = () => {
  return (
    <>
      <Header className='ml-4 mt-4' />
      <div className='text-center mt-20'>
        <h2 className='text-xl font-bold'>404 NOT FOUND</h2>
        <p> ページが見つかりません。</p>
      </div>
    </>
  );
};

export default NotFound;
