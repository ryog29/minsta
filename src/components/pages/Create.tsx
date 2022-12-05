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
import {
  collection,
  doc,
  GeoPoint,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db, storage } from '../../firebase';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { canvasToBlob } from '../../lib/canvasToBlob';
import { createImage } from '../../lib/createImage';

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

  // TODO: 画像のバリデーションをする
  const onSubmit = handleSubmit(async (data) => {
    const { stampName, creatorName } = data;
    const { lat, lng } = location.state.mapState.center;
    const stampsCollectionRef = doc(collection(db, 'stamps'));
    const fileName = `${stampsCollectionRef.id}.png`;
    const storageRef = ref(storage, `stamp-images/${fileName}`);
    const dstCanvas: HTMLCanvasElement = document.getElementById(
      'dstCanvas'
    ) as HTMLCanvasElement;
    const blob = await canvasToBlob(dstCanvas);
    const uploadTask = uploadBytesResumable(storageRef, blob, {
      contentType: 'image/png',
    });

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
          case 'paused':
            console.log('Upload is paused');
            break;
          case 'running':
            console.log('Upload is running');
            break;
        }
      },
      (error) => {
        console.warn(error);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          await setDoc(stampsCollectionRef, {
            name: stampName,
            coordinates: new GeoPoint(lat, lng),
            address: 'テスト県テスト市テスト1-1-1',
            imageUrl: downloadUrl,
            createdBy: creatorName,
            createdAt: serverTimestamp(),
            stampedCount: 0,
          });
          navigate(`/home`, {
            state: { from: 'CreateLocation' },
            replace: true,
          });
        } catch (error) {
          console.warn(error);
        }
      }
    );
  });

  const [imgUrl, setImgUrl] = useState<string>('');
  const [croppedImgUrl, setCroppedImgUrl] = useState<string>('');
  const [srcCtx, setSrcCtx] = useState<CanvasRenderingContext2D>();
  const [dstCtx, setDstCtx] = useState<CanvasRenderingContext2D>();

  const convertImg = (threshold: number) => {
    if (srcCtx && dstCtx) {
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
    (async () => {
      if (srcCtx && dstCtx && croppedImgUrl) {
        const img = await createImage(croppedImgUrl);
        srcCtx.drawImage(img, 0, 0, STAMP_IMAGE_SIZE, STAMP_IMAGE_SIZE);
        dstCtx.drawImage(img, 0, 0, STAMP_IMAGE_SIZE, STAMP_IMAGE_SIZE);
        convertImg(DEFAULT_THRESHOLD);
      }
    })();
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
        <input type='file' accept='image/*' onChange={onFileChange}></input>
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
            作成する
          </button>
        </form>
      </div>
    </>
  );
};

export default Create;
