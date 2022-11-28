import Header from '../templates/Header';

const NotFound = () => {
  return (
    <>
      <Header className='ml-2 mt-2' />
      <div className='ml-2'>
        <h2 className='mt-2 text-2xl font-bold'>404 NOT FOUND</h2>
        <p>ページが見つかりません。</p>
      </div>
    </>
  );
};

export default NotFound;
