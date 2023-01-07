import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DEFAULT_STAMP_COLOR,
  DEFAULT_THRESHOLD,
  DEFAULT_ZOOM,
  MIN_LOCATABLE_DISTANCE,
  STAMP_IMAGE_SIZE,
} from '../../constants';
import useModal from '../../hooks/useModal';
import { MapState } from '../../types';
import NavigationButton from '../parts/NavigationButton';
import CropperModal from '../templates/CropperModal';
import Header from '../templates/Header';
import { createImage } from '../../lib/createImage';
import StampInputForm from '../templates/StampInputForm';
import { LatLng, LatLngLiteral } from 'leaflet';
import { getStampsInBounds } from '../../lib/getStampsInBounds';

const Create = (props: {
  currentPos: LatLngLiteral;
  setMapState: Dispatch<SetStateAction<MapState>>;
}) => {
  const { currentPos, setMapState } = props;
  const navigate = useNavigate();

  const { Modal, openModal, closeModal } = useModal();

  const [isDisplayMsg, setIsDisplayMsg] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      setMapState({
        center: currentPos,
        zoom: DEFAULT_ZOOM,
      });

      // 現在地から近い位置に既にスタンプがある場合はエラーメッセージを表示
      // TODO:メッセージはモーダル表示にして作成不可の時はホーム画面に戻すようにする
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
        setIsDisplayMsg(true);
      }
    })();
  }, []);

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
        {isDisplayMsg && (
          <p className='text-red-600'>
            近くにスタンプがあるためスタンプを作成できません。新しいスタンプを作成するには既存のスタンプから十分に離れてください。
          </p>
        )}
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
        <div>
          <input
            type='range'
            min='0'
            max='254'
            step='1'
            defaultValue={DEFAULT_THRESHOLD}
            onChange={(e) => {
              setStampThreshold(Number(e.target.value));
            }}
          />
        </div>
        <div>
          <input
            type='checkbox'
            onChange={(e) => {
              setIsReverseColor(e.target.checked);
            }}
          />
          <label>色反転</label>
        </div>
        <div>
          <input
            type='color'
            defaultValue={DEFAULT_STAMP_COLOR}
            onBlur={(e) => {
              setStampColor(e.target.value);
            }}
          />
        </div>
        <StampInputForm
          onFileChange={onFileChange}
          position={new LatLng(currentPos.lat, currentPos.lng)}
        ></StampInputForm>
      </div>
    </>
  );
};

export default Create;
