import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';
import getCroppedImg from '../../lib/getCroppedImg';

const CropperModal = (props: {
  imgUrl: string;
  setCroppedImgUrl: Dispatch<SetStateAction<string>>;
  closeModal: () => void;
}) => {
  const { imgUrl, setCroppedImgUrl, closeModal } = props;
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area>();

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      console.log(croppedArea, croppedAreaPixels);
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const showCroppedImage = useCallback(async () => {
    if (!croppedAreaPixels) return;
    try {
      const croppedImage = await getCroppedImg(imgUrl, croppedAreaPixels);
      setCroppedImgUrl(croppedImage);
      closeModal();
    } catch (e) {
      console.error(e);
    }
  }, [croppedAreaPixels, imgUrl]);

  return (
    <>
      <div className='absolute w-full h-full'>
        <Cropper
          image={imgUrl}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
        />
      </div>
      <button
        className='absolute inset-x-0 bottom-0 bg-gray-400 text-white px-2 py-2 font-bold'
        onClick={showCroppedImage}
      >
        決定
      </button>
    </>
  );
};

export default CropperModal;
