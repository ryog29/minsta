import { useLiveQuery } from 'dexie-react-hooks';
import { Link, useNavigate } from 'react-router-dom';
import { idb } from '../idb';

const Collection = () => {
  const navigate = useNavigate();
  const stamps = useLiveQuery(() => idb.stamps.toArray());

  // TODO: 押した日時順でソートして表示
  return (
    <div className='collection'>
      <button
        onClick={() => {
          navigate(`/`, { replace: true });
        }}
      >
        閉じる
      </button>
      <h2>集めたスタンプ数: {stamps?.length}</h2>
      {stamps?.map((stamp) => (
        <div key={stamp.id}>
          <p>スタンプ名: {stamp.name}</p>
          <p>押した日時: {stamp.stampedAt.toISOString()}</p>
          <Link to={`/stamps/${stamp.id}`} replace={true}>
            <img src={stamp.imageUrl} className='stamp-image'></img>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default Collection;
