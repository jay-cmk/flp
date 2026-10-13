import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Searchbar from './Searchbar';
import logo from '../../../assets/images/logo.png';
import PrimaryDropDownMenu from './PrimaryDropDownMenu';
import SecondaryDropDownMenu from './SecondaryDropDownMenu';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const Header = () => {

  const { isAuthenticated, user } = useSelector((state) => state.user);
  const { cartItems } = useSelector(state => state.cart);
  const cartItemCount = cartItems.reduce((count, item) => count + Number(item.quantity || 0), 0);

  const [togglePrimaryDropDown, setTogglePrimaryDropDown] = useState(false);
  const [toggleSecondaryDropDown, setToggleSecondaryDropDown] = useState(false);

  return (
    <header className="fixed top-0 z-30 w-full bg-primary-blue shadow-sm">
      <div className="mx-auto flex w-full max-w-[1280px] items-center gap-2 px-2 py-2 sm:px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Link className="mr-1 flex h-7 w-12 flex-shrink-0 sm:mr-3" to="/" aria-label="Flipkart home">
            <img draggable="false" className="h-full w-full object-contain" src={logo} alt="Flipkart Logo" />
          </Link>
          <Searchbar />
        </div>

        <div className="relative flex flex-shrink-0 items-center justify-between gap-1 sm:gap-5">
          {isAuthenticated ? (
            <button type="button" className="userDropDown flex max-w-[84px] items-center gap-1 truncate text-sm font-medium text-white sm:max-w-none" onClick={() => setTogglePrimaryDropDown(!togglePrimaryDropDown)} aria-expanded={togglePrimaryDropDown}>{user.name && user.name.split(' ', 1)}
              <span>{togglePrimaryDropDown ? <ExpandLessIcon sx={{ fontSize: '16px' }} /> : <ExpandMoreIcon sx={{ fontSize: '16px' }} />}</span>
            </button>
          ) : null}

          {togglePrimaryDropDown && <PrimaryDropDownMenu setTogglePrimaryDropDown={setTogglePrimaryDropDown} user={user} />}

          <span className="moreDropDown hidden items-center gap-1 text-sm font-medium text-white md:flex" onClick={() => setToggleSecondaryDropDown(!toggleSecondaryDropDown)}>More
            <span>{toggleSecondaryDropDown ? <ExpandLessIcon sx={{ fontSize: '16px' }} /> : <ExpandMoreIcon sx={{ fontSize: '16px' }} />}</span>
          </span>

          {toggleSecondaryDropDown && <SecondaryDropDownMenu />}

          <Link to="/cart" className="relative flex items-center gap-1 text-sm font-medium text-white sm:gap-2" aria-label={`Cart${cartItemCount ? `, ${cartItemCount} items` : ''}`}>
            <span className="flex h-7 w-7 items-center justify-center"><ShoppingCartIcon sx={{ fontSize: 20 }} /></span>
            {cartItemCount > 0 &&
              <div className="absolute -top-1 left-4 flex h-4 min-w-[16px] items-center justify-center rounded-full border border-white bg-red-500 px-1 text-[10px] font-bold text-white">
                {cartItemCount}
              </div>
            }
            <span className="hidden sm:inline">Cart</span>
          </Link>
        </div>
      </div>
    </header>
  )
};

export default Header;
