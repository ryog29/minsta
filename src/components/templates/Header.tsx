import { Link } from 'react-router-dom';

const Header = (props: { className: string }) => {
  return (
    <div className={props.className}>
      <Link to={'/'} replace={true}>
        <h1 className='text-2xl text-black font-bold'>minsta</h1>
      </Link>
    </div>
  );
};

export default Header;
