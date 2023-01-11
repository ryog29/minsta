import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DEFAULT_CREATOR_NAME,
  DEFAULT_STAMP_COLOR,
  DEFAULT_THRESHOLD,
  DEFAULT_ZOOM,
  MIN_LOCATABLE_DISTANCE,
  STAMP_IMAGE_SIZE,
} from '../../constants';
import useModal from '../../hooks/useModal';
import { MapState } from '../../types';
import CropperModal from '../templates/CropperModal';
import Header from '../templates/Header';
import { createImage } from '../../lib/createImage';
import { LatLng, LatLngLiteral } from 'leaflet';
import { getStampsInBounds } from '../../lib/getStampsInBounds';
import { useForm } from 'react-hook-form';
import StampNameInput from '../parts/StampNameInput';
import CreatorNameInput from '../parts/CreatorNameInput';
import StampImageInput from '../parts/StampImageInput';
import { getAddress } from '../../lib/getAddress';
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
import * as geofire from 'geofire-common';
import StampThresholdInput from '../parts/StampThresholdInput';
import StampReverseColorInput from '../parts/StampReverseColorInput';
import { splitColorCode } from '../../lib/splitColorCode';
import StampColorInput from '../parts/StampColorInput';
import StampSubmitButton from '../parts/StampSubmitButton';
import BackButton from '../parts/BackButton';
import useErrorModal from '../../hooks/useErrorModal';

const Create = (props: {
  currentPos: LatLngLiteral;
  setMapState: Dispatch<SetStateAction<MapState>>;
}) => {
  const { currentPos, setMapState } = props;

  const navigate = useNavigate();
  const { Modal, openModal, closeModal } = useModal();
  const { ErrorModal, openErrorModal } = useErrorModal(() =>
    navigate(`/home`, { state: { from: 'Create' }, replace: true })
  );

  const [imgUrl, setImgUrl] = useState<string>('');
  const [croppedImgUrl, setCroppedImgUrl] = useState<string>('');
  const [srcCtx, setSrcCtx] = useState<CanvasRenderingContext2D>();
  const [dstCtx, setDstCtx] = useState<CanvasRenderingContext2D>();
  const [stampColor, setStampColor] = useState<string>(DEFAULT_STAMP_COLOR);
  const [isReverseColor, setIsReverseColor] = useState<boolean>(false);
  const [stampThreshold, setStampThreshold] =
    useState<number>(DEFAULT_THRESHOLD);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      setMapState({
        center: currentPos,
        zoom: DEFAULT_ZOOM,
      });

      const stampsInAvailableArea = await getStampsInBounds(
        [currentPos.lat, currentPos.lng],
        MIN_LOCATABLE_DISTANCE
      );
      // geohashによる検索で取得したデータに対して一つずつ厳密な距離チェック
      const res = stampsInAvailableArea.map((stamp) => {
        const stampLatLng = new LatLng(
          stamp.coordinates.latitude,
          stamp.coordinates.longitude
        );
        const distance = Math.ceil(stampLatLng.distanceTo(currentPos));
        if (distance < MIN_LOCATABLE_DISTANCE) {
          return stamp;
        }
      });
      if (res.length !== 0) {
        openErrorModal();
      }
    })();
  }, []);

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
        const ret = isReverseColor ? y <= stampThreshold : y > stampThreshold;
        dst.data[i] = ret ? 255 : colorCode[0];
        dst.data[i + 1] = ret ? 255 : colorCode[1];
        dst.data[i + 2] = ret ? 255 : colorCode[2];
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
  }, [isLoaded, srcCtx, dstCtx, stampThreshold, stampColor, isReverseColor]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: 'onChange', criteriaMode: 'all' });

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

  const onSubmit = handleSubmit(async (data) => {
    const { stampName, creatorName } = data;
    const { lat, lng } = currentPos;
    const address = await getAddress(lat, lng);
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
            geohash: geofire.geohashForLocation([lat, lng]),
            address: address,
            imageUrl: downloadUrl,
            createdBy: creatorName || DEFAULT_CREATOR_NAME,
            createdAt: serverTimestamp(),
            stampedCount: 0,
          });
          navigate(`/home`, {
            state: { from: 'Create' },
            replace: true,
          });
        } catch (error) {
          console.warn(error);
        }
      }
    );
  });

  return (
    <>
      <Header className='mt-4 ml-4' />
      <div>
        <BackButton
          className='ml-12 mt-4'
          onClick={() => {
            navigate(`/home`, { state: { from: 'Create' }, replace: true });
          }}
        />
        <h2 className='text-xl font-bold text-center'>スタンプ作成</h2>
        <form onSubmit={onSubmit} className='flex flex-col items-center'>
          <StampNameInput
            register={register}
            errors={errors}
            className='mt-2'
          />
          <canvas
            id='dstCanvas'
            width={STAMP_IMAGE_SIZE}
            height={STAMP_IMAGE_SIZE}
            className='my-2 mx-auto'
          ></canvas>
          <StampImageInput
            onFileChange={onFileChange}
            register={register}
            errors={errors}
            className=''
          />
          <StampThresholdInput
            setStampThreshold={setStampThreshold}
            className='mt-2'
          />
          <div className='mt-2 flex'>
            <StampColorInput
              stampColor={stampColor}
              setStampColor={setStampColor}
              className='mr-8'
            />
            <StampReverseColorInput
              setIsReverseColor={setIsReverseColor}
              className='mt-1'
            />
          </div>
          <CreatorNameInput
            register={register}
            errors={errors}
            className='mt-2'
          />
          <StampSubmitButton className='mt-2' />
        </form>
        <Modal>
          <CropperModal
            imgUrl={imgUrl}
            setCroppedImgUrl={setCroppedImgUrl}
            closeModal={closeModal}
          />
        </Modal>
        <ErrorModal>
          <div className='text-red-500 mx-4 my-4'>
            近くにスタンプがあるためスタンプを作成できません。
            <br />
            新しいスタンプを作成するには既存のスタンプから十分に離れてください。
          </div>
        </ErrorModal>
      </div>
    </>
  );
};

export default Create;
