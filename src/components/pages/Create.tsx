import { Dispatch, SetStateAction, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useModal from '../../hooks/useModal';
import { MapState } from '../../types';
import Header from '../templates/Header';

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
      navigate(`/home`, { state: { from: 'CreateLocation' }, replace: true });
    }, []);

    return (
      <button
        onClick={onClick}
        className='my-2 bg-gray-400 text-white rounded px-2 py-2 font-bold'
      >
        作成する
      </button>
    );
  };

  return (
    <>
      <Header className='ml-2 mt-2' />
      <div className='ml-2'>
        <button
          onClick={() => {
            navigate(`/home`, { state: { from: 'Create' }, replace: true });
          }}
          className='my-2 bg-gray-400 text-white rounded px-2 py-2 font-bold'
        >
          閉じる
        </button>
        <h2>スタンプを作成</h2>
        <button
          onClick={openModal}
          className='my-2 bg-gray-400 text-white rounded px-2 py-2 font-bold'
        >
          次へ
        </button>
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
            <button
              onClick={closeModal}
              className='my-2 mr-2 bg-gray-400 text-white rounded px-2 py-2 font-bold'
            >
              閉じる
            </button>
            <CreateStampButton />
          </div>
        </Modal>
      </div>
    </>
  );
};

export default Create;
