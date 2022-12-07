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
  STAMP_COLOR_RED,
  STAMP_COLOR_BLUE,
  STAMP_COLOR_LIME,
  STAMP_COLOR_YELLOW,
  STAMP_COLOR_AQUA,
  STAMP_COLOR_FUCHSIA,
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

  const [imgUrl, setImgUrl] = useState<string>('');
  const [croppedImgUrl, setCroppedImgUrl] = useState<string>('');
  const [srcCtx, setSrcCtx] = useState<CanvasRenderingContext2D>();
  const [dstCtx, setDstCtx] = useState<CanvasRenderingContext2D>();
  const [stampColor, setStampColor] = useState<string>(STAMP_COLOR_RED);
  const [stampThreshold, setStampThreshold] =
    useState<number>(DEFAULT_THRESHOLD);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

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
        // 画像を円形に切り抜き
        srcCtx.beginPath();
        srcCtx.arc(
          STAMP_IMAGE_SIZE / 2,
          STAMP_IMAGE_SIZE / 2,
          STAMP_IMAGE_SIZE / 2,
          0,
          Math.PI * 2,
          false
        );
        srcCtx.clip();
        srcCtx.drawImage(img, 0, 0, STAMP_IMAGE_SIZE, STAMP_IMAGE_SIZE);
        setIsLoaded(true);
      }
    })();
  }, [srcCtx, dstCtx, croppedImgUrl]);

  const splitColorCode = (colorCode: string) => {
    const res = [];
    res[0] = parseInt(colorCode.slice(1, 3), 16);
    res[1] = parseInt(colorCode.slice(3, 5), 16);
    res[2] = parseInt(colorCode.slice(5, 7), 16);
    return res;
  };

  useEffect(() => {
    if (isLoaded && srcCtx && dstCtx) {
      const src = srcCtx.getImageData(0, 0, STAMP_IMAGE_SIZE, STAMP_IMAGE_SIZE);
      const dst = srcCtx.createImageData(STAMP_IMAGE_SIZE, STAMP_IMAGE_SIZE);
      const colorCode = splitColorCode(stampColor);

      for (let i = 0; i < src.data.length; i = i + 4) {
        const y = ~~(
          0.299 * src.data[i] +
          0.587 * src.data[i + 1] +
          0.114 * src.data[i + 2]
        );
        const ret = y > stampThreshold ? 255 : 0;
        dst.data[i] = colorCode[0] || ret;
        dst.data[i + 1] = colorCode[1] || ret;
        dst.data[i + 2] = colorCode[2] || ret;
        dst.data[i + 3] = src.data[i + 3];
      }

      dstCtx.putImageData(dst, 0, 0);

      // 枠線を描画
      dstCtx.beginPath();
      dstCtx.arc(
        STAMP_IMAGE_SIZE / 2,
        STAMP_IMAGE_SIZE / 2,
        (STAMP_IMAGE_SIZE - 4) / 2,
        0,
        Math.PI * 2,
        false
      );
      dstCtx.strokeStyle = stampColor;
      dstCtx.lineWidth = 4;
      dstCtx.stroke();
    }
  }, [isLoaded, srcCtx, dstCtx, stampThreshold, stampColor]);

  const onFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
          if (reader.result) {
            setIsLoaded(false);
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
            setStampThreshold(Number(e.target.value));
          }}
        ></input>
        <div>
          <input
            type='radio'
            name='stampColor'
            value={STAMP_COLOR_RED}
            onChange={(e) => {
              setStampColor(e.target.value);
            }}
            defaultChecked={true}
          />
          <label className='mr-1'>RED</label>
          <input
            type='radio'
            name='stampColor'
            value={STAMP_COLOR_LIME}
            onChange={(e) => {
              setStampColor(e.target.value);
            }}
          />
          <label className='mr-1'>LIME</label>
          <input
            type='radio'
            name='stampColor'
            value={STAMP_COLOR_BLUE}
            onChange={(e) => {
              setStampColor(e.target.value);
            }}
          />
          <label className='mr-1'>BLUE</label>
          <input
            type='radio'
            name='stampColor'
            value={STAMP_COLOR_YELLOW}
            onChange={(e) => {
              setStampColor(e.target.value);
            }}
          />
          <label className='mr-1'>YELLOW</label>
          <input
            type='radio'
            name='stampColor'
            value={STAMP_COLOR_AQUA}
            onChange={(e) => {
              setStampColor(e.target.value);
            }}
          />
          <label className='mr-1'>AQUA</label>
          <input
            type='radio'
            name='stampColor'
            value={STAMP_COLOR_FUCHSIA}
            onChange={(e) => {
              setStampColor(e.target.value);
            }}
          />
          <label className='mr-1'>FUCHSIA</label>
        </div>
        <form onSubmit={onSubmit}>
          <div>
            <input
              {...register('stampImage', {
                required: true,
              })}
              type='file'
              accept='image/*'
              onChange={onFileChange}
            ></input>
            {errors.stampImage?.type === 'required' && (
              <div className='text-red-500'>ファイルを選択してください。</div>
            )}
          </div>
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
