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
    <header className="bg-primary-blue fixed top-0 py-2.5 w-full z-10">
      <div className="w-full sm:w-9/12 px-2 sm:px-4 m-auto flex justify-between items-center relative gap-2">
        <div className="flex items-center flex-1 min-w-0">
          <Link className="h-7 w-12 flex-shrink-0 mr-1 sm:mr-4" to="/" aria-label="Flipkart home">
            <img draggable="false" className="h-full w-full object-contain" src={logo} alt="Flipkart Logo" />
          </Link>
          <Searchbar />
        </div>

        <div className="flex flex-shrink-0 items-center justify-between ml-1 sm:ml-0 gap-1 sm:gap-7 relative">
          {isAuthenticated ? (
            <button type="button" className="userDropDown flex items-center text-white font-medium gap-1 cursor-pointer max-w-20 sm:max-w-none truncate" onClick={() => setTogglePrimaryDropDown(!togglePrimaryDropDown)} aria-expanded={togglePrimaryDropDown}>{user.name && user.name.split(' ', 1)}
              <span>{togglePrimaryDropDown ? <ExpandLessIcon sx={{ fontSize: '16px' }} /> : <ExpandMoreIcon sx={{ fontSize: '16px' }} />}</span>
            </button>
          ) : null}

          {togglePrimaryDropDown && <PrimaryDropDownMenu setTogglePrimaryDropDown={setTogglePrimaryDropDown} user={user} />}

          <span className="moreDropDown hidden sm:flex items-center text-white font-medium gap-1 cursor-pointer" onClick={() => setToggleSecondaryDropDown(!toggleSecondaryDropDown)}>More
            <span>{toggleSecondaryDropDown ? <ExpandLessIcon sx={{ fontSize: '16px' }} /> : <ExpandMoreIcon sx={{ fontSize: '16px' }} />}</span>
          </span>

          {toggleSecondaryDropDown && <SecondaryDropDownMenu />}

          <Link to="/cart" className="flex items-center text-white font-medium gap-1 sm:gap-2 relative" aria-label={`Cart${cartItemCount ? `, ${cartItemCount} items` : ''}`}>
            <span><ShoppingCartIcon /></span>
            {cartItemCount > 0 &&
              <div className="min-w-5 h-5 px-1 bg-red-500 text-xs rounded-full absolute -top-2 left-3 flex justify-center items-center border">
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
