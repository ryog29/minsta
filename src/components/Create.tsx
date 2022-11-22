import { Dispatch, SetStateAction, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useModal from '../hooks/useModal';
import { MapState } from '../types';

const Create = (props: { setMapState: Dispatch<SetStateAction<MapState>> }) => {
  const { setMapState } = props;
  const navigate = useNavigate();

  const { Modal, openModal, closeModal } = useModal();

  const location = useLocation();
  useEffect(() => {
    if (location.state?.from === 'Home') {
      const { mapState } = location.state;
      setMapState(mapState);
    }
  }, []);

  const CreateStampButton = () => {
    const onClick = useCallback(async () => {
      // TODO: firestore と storage に書き込む(完了を待つ)
      console.log('upload firestore and storage...');
      // TODO: 作成したスタンプの位置を表示位置に設定
      // setMapState();
      navigate(`/`, { state: { from: 'CreateLocation' }, replace: true });
    }, []);

    return <button onClick={onClick}>作成する</button>;
  };

  return (
    <div className='create'>
      <button
        onClick={() => {
          navigate(`/`, { state: { from: 'Create' }, replace: true });
        }}
      >
        閉じる
      </button>
      <h2>スタンプを作成</h2>
      <button onClick={openModal}>次へ</button>
      <Modal>
        <div
          style={{
            backgroundColor: 'white',
            width: '300px',
            height: '600px',
            padding: '1em',
            borderRadius: '15px',
          }}
        >
          <button onClick={closeModal}>閉じる</button>
          <CreateStampButton />
        </div>
      </Modal>
    </div>
  );
};

export default Create;
