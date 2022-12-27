import {
  collection,
  doc,
  GeoPoint,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { LatLng } from 'leaflet';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  MAX_CREATOR_NAME_LENGTH,
  MAX_STAMP_NAME_LENGTH,
} from '../../constants';
import { db, storage } from '../../firebase';
import { canvasToBlob } from '../../lib/canvasToBlob';
import * as geofire from 'geofire-common';

const StampInputForm = (props: {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  position: LatLng;
}) => {
  const { onFileChange, position } = props;

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: 'onChange', criteriaMode: 'all' });

  const onSubmit = handleSubmit(async (data) => {
    const { stampName, creatorName } = data;
    const { lat, lng } = position;
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

  return (
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
  );
};

export default StampInputForm;
