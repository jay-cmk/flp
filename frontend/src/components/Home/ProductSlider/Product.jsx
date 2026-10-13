import { getDiscount } from '../../../utils/functions';
import StarIcon from '@mui/icons-material/Star';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '../../../actions/wishlistAction';
import { useSnackbar } from 'notistack';

const Product = (props) => {

    const { _id, name, images, ratings, numOfReviews, price, cuttedPrice } = props;

    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();

    const { wishlistItems } = useSelector((state) => state.wishlist);

    const itemInWishlist = wishlistItems.some((i) => i.product === _id);

    const addToWishlistHandler = () => {
        if(itemInWishlist) {
            dispatch(removeFromWishlist(_id));
            enqueueSnackbar("Remove From Wishlist", { variant: "success" });
        } else {
            dispatch(addToWishlist(_id));
            enqueueSnackbar("Added To Wishlist", { variant: "success" });
        }
    }

    return (
        <div className="relative flex flex-col items-center gap-2 px-2 py-4">
            <Link to={`/product/${_id}`} className="group flex w-full flex-col items-center text-center">
                <div className="h-28 w-28 rounded-lg bg-gray-50 p-2 sm:h-32 sm:w-32">
                    <img draggable="false" className="h-full w-full object-contain" src={images[0].url} alt={name} />
                </div>
                <h2 className="mt-3 max-w-[150px] text-xs font-medium text-gray-800 transition-colors group-hover:text-primary-blue sm:text-sm">{name.length > 50 ? `${name.substring(0, 50)}...` : name}</h2>
            </Link>

            <div className="flex flex-col items-center gap-1.5">
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 sm:text-sm">
                    <span className="flex items-center gap-0.5 rounded-sm bg-primary-green px-1.5 py-0.5 text-[10px] font-semibold text-white sm:text-xs">{ratings.toFixed(1)} <StarIcon sx={{ fontSize: "12px" }} /></span>
                    <span>({numOfReviews.toLocaleString()})</span>
                </span>

                <div className="flex flex-wrap items-center justify-center gap-1 text-center text-[11px] font-medium sm:text-sm">
                    <span>₹{price.toLocaleString()}</span>
                    <span className="text-xs text-gray-500 line-through">₹{cuttedPrice.toLocaleString()}</span>
                    <span className="text-[10px] text-primary-green sm:text-xs">{getDiscount(price, cuttedPrice)}% off</span>
                </div>
            </div>

            <span onClick={addToWishlistHandler} className={`${itemInWishlist ? "text-red-500" : "text-gray-300 hover:text-red-500"} absolute right-2 top-4 cursor-pointer`}><FavoriteIcon sx={{ fontSize: "16px" }} /></span>
        </div>
    );
};

export default Product;
