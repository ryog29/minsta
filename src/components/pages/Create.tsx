import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  DEFAULT_THRESHOLD,
  MAX_CREATOR_NAME_LENGTH,
  MAX_STAMP_NAME_LENGTH,
  STAMP_IMAGE_SIZE,
} from '../../constants';
import useModal from '../../hooks/useModal';
import { MapState } from '../../types';
import NavigationButton from '../parts/NavigationButton';
import CropperModal from '../templates/CropperModal';
import Header from '../templates/Header';
import { useForm } from 'react-hook-form';

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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: 'onChange', criteriaMode: 'all' });

  const onSubmit = handleSubmit((data) => {
    const { stampName, creatorName } = data;
    console.log(stampName, creatorName);
  });

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
  const [croppedImgUrl, setCroppedImgUrl] = useState<string>('');
  const [srcCtx, setSrcCtx] = useState<CanvasRenderingContext2D>();
  const [dstCtx, setDstCtx] = useState<CanvasRenderingContext2D>();

  const convertImg = (threshold: number) => {
    if (srcCtx && dstCtx) {
      console.log(threshold);
      const src = srcCtx.getImageData(0, 0, STAMP_IMAGE_SIZE, STAMP_IMAGE_SIZE);
      const dst = srcCtx.createImageData(STAMP_IMAGE_SIZE, STAMP_IMAGE_SIZE);

      for (let i = 0; i < src.data.length; i = i + 4) {
        const y = ~~(
          0.299 * src.data[i] +
          0.587 * src.data[i + 1] +
          0.114 * src.data[i + 2]
        );
        const ret = y > threshold ? 255 : 0;
        dst.data[i] = 255;
        dst.data[i + 1] = dst.data[i + 2] = ret;
        dst.data[i + 3] = src.data[i + 3];
      }

      dstCtx.putImageData(dst, 0, 0);
    }
  };

  useEffect(() => {
    const srcCanvas: HTMLCanvasElement = document.createElement('canvas');
    srcCanvas.width = STAMP_IMAGE_SIZE;
    srcCanvas.height = STAMP_IMAGE_SIZE;
    const srcCtx = srcCanvas.getContext('2d') as CanvasRenderingContext2D;
    setSrcCtx(srcCtx);

    const dstCanvas: HTMLCanvasElement = document.getElementById(
      'dstCanvas'
    ) as HTMLCanvasElement;
    const dstCtx = dstCanvas.getContext('2d') as CanvasRenderingContext2D;
    setDstCtx(dstCtx);
  }, []);

  useEffect(() => {
    if (srcCtx && dstCtx) {
      const img = new Image();
      img.src = croppedImgUrl;
      img.onload = () => {
        srcCtx.drawImage(img, 0, 0, STAMP_IMAGE_SIZE, STAMP_IMAGE_SIZE);
        dstCtx.drawImage(img, 0, 0, STAMP_IMAGE_SIZE, STAMP_IMAGE_SIZE);
        convertImg(DEFAULT_THRESHOLD);
      };
    }
  }, [srcCtx, dstCtx, croppedImgUrl]);

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
        <Modal>
          <CropperModal
            imgUrl={imgUrl}
            setCroppedImgUrl={setCroppedImgUrl}
            closeModal={closeModal}
          />
        </Modal>
        <canvas
          id='dstCanvas'
          width={STAMP_IMAGE_SIZE}
          height={STAMP_IMAGE_SIZE}
          className='my-10 mx-auto'
        ></canvas>
        <input
          type='range'
          min='0'
          max='254'
          step='1'
          defaultValue={DEFAULT_THRESHOLD}
          onChange={(e) => {
            convertImg(Number(e.target.value));
          }}
        ></input>
        <form onSubmit={onSubmit}>
          <div>
            <label>スタンプ名</label>
            <input
              {...register('stampName', {
                required: true,
                maxLength: MAX_STAMP_NAME_LENGTH,
              })}
              className='block px-3 py-1.5 m-0 border border-solid border-gray-300 rounded'
            />
            {errors.stampName?.type === 'required' && (
              <div className='text-red-500'>入力必須の項目です。</div>
            )}
            {errors.stampName?.type === 'maxLength' && (
              <div className='text-red-500'>
                {MAX_STAMP_NAME_LENGTH}文字以内で入力してください。
              </div>
            )}
          </div>
          <div>
            <label>作者</label>
            <input
              {...register('creatorName', {
                required: true,
                maxLength: MAX_CREATOR_NAME_LENGTH,
              })}
              className='block px-3 py-1.5 m-0 border border-solid border-gray-300 rounded'
            />
            {errors.creatorName?.type === 'required' && (
              <div className='text-red-500'>入力必須の項目です。</div>
            )}
            {errors.creatorName?.type === 'maxLength' && (
              <div className='text-red-500'>
                {MAX_CREATOR_NAME_LENGTH}文字以内で入力してください。
              </div>
            )}
          </div>
          <button
            type='submit'
            className='bg-gray-400 text-white rounded px-2 py-2 font-bold mt-2'
          >
            ログイン
          </button>
        </form>
        <CreateStampButton />
      </div>
    </>
  );
};

export default Create;
