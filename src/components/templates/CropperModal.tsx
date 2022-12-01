import { useCallback, useState } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';

const CropperModal = (props: { imgUrl: string }) => {
  const { imgUrl } = props;
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      console.log(croppedArea, croppedAreaPixels);
    },
    []
  );
  return (
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
  );
};

export default CropperModal;
