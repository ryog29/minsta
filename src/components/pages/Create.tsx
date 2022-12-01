import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useModal from '../../hooks/useModal';
import { MapState } from '../../types';
import NavigationButton from '../parts/NavigationButton';
import CropperModal from '../templates/CropperModal';
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

  const [imgUrl, setImgUrl] = useState<string>('');

  const onFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
          if (reader.result) {
            setImgUrl(reader.result.toString());
            openModal();
          }
        });
        reader.readAsDataURL(e.target.files[0]);
      }
    },
    []
  );

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
        <input
          type='file'
          capture='environment'
          accept='image/*'
          onChange={onFileChange}
        ></input>
        <CreateStampButton />
        <Modal>
          <div>
            <CropperModal imgUrl={imgUrl} />
            <button
              className='absolute inset-x-0 bottom-0 bg-gray-400 text-white px-2 py-2 font-bold'
              onClick={closeModal}
            >
              決定
            </button>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default Create;
