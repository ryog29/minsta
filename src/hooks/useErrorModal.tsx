import { useState } from 'react';

const useErrorModal = (navigateFn: () => void) => {
  const [show, setShow] = useState(false);

  const openErrorModal = () => {
    setShow(true);
  };

  const ErrorModal = (props: { children: JSX.Element }) => {
    if (!show) return null;
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            position: 'fixed',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'gray',
            opacity: '0.5',
          }}
        ></div>
        <div className='absolute bg-white w-3/4 h-1/4 rounded-lg'>
          <div>{props.children}</div>
          <button
            type='button'
            onClick={() => {
              setShow(false);
              navigateFn();
            }}
            className='absolute inset-x-0 bottom-0 bg-gray-400 text-white px-2 py-2 font-bold rounded-b-lg'
          >
            OK
          </button>
        </div>
      </div>
    );
  };

  return { ErrorModal, openErrorModal };
};

export default useErrorModal;
