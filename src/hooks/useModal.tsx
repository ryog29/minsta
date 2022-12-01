import { useState } from 'react';

const useModal = () => {
  const [show, setShow] = useState(false);

  const openModal = () => {
    setShow(true);
  };

  const closeModal = () => {
    setShow(false);
  };

  const Modal = (props: { children: JSX.Element }) => {
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
        <div className='absolute bg-white w-3/4 h-3/4'>
          <div>{props.children}</div>
        </div>
      </div>
    );
  };

  return { Modal, openModal, closeModal };
};

export default useModal;
