import { Dispatch, SetStateAction, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useModal from '../../hooks/useModal';
import { MapState } from '../../types';
import NavigationButton from '../parts/NavigationButton';
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
      <NavigationButton className='my-2' onClick={onClick}>
        作成する
      </NavigationButton>
    );
  };

  return (
    <>
      <Header className='ml-2 mt-2' />
      <div className='ml-2'>
        <NavigationButton
          className='my-1'
          onClick={() => {
            navigate(`/home`, { state: { from: 'Create' }, replace: true });
          }}
        >
          戻る
        </NavigationButton>
        <h2>スタンプを作成</h2>
        <NavigationButton className='my-1' onClick={openModal}>
          次へ
        </NavigationButton>
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
            <NavigationButton className='my-1 mr-2' onClick={closeModal}>
              戻る
            </NavigationButton>
            <CreateStampButton />
          </div>
        </Modal>
      </div>
    </>
  );
};

export default Create;
