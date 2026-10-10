import { useSnackbar } from 'notistack';
import { useDispatch } from 'react-redux';
import { removeItemsFromCart, updateCartItemQuantity } from '../../actions/cartAction';
import { getDeliveryDate, getDiscount } from '../../utils/functions';
import { saveForLater } from '../../actions/saveForLaterAction';
import { Link } from 'react-router-dom';

const CartItem = ({ product, name, seller, price, cuttedPrice, image, stock, quantity, variant, inCart }) => {

    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();

    const increaseQuantity = (id, quantity, stock) => {
        const newQty = quantity + 1;
        if (quantity >= stock) {
            enqueueSnackbar("Maximum Order Quantity", { variant: "warning" });
            return;
        };
        dispatch(updateCartItemQuantity({ product: id, variant: productVariant }, newQty));
    }

    const decreaseQuantity = (id, quantity) => {
        const newQty = quantity - 1;
        if (quantity <= 1) return;
        dispatch(updateCartItemQuantity({ product: id, variant: productVariant }, newQty));
    }
    
    const removeCartItem = () => {
        dispatch(removeItemsFromCart({ product, variant: productVariant }));
        enqueueSnackbar("Product Removed From Cart", { variant: "success" });
    }

    const saveForLaterHandler = (id) => {
        dispatch(saveForLater(id));
        removeCartItem();
        enqueueSnackbar("Saved For Later", { variant: "success" });
    }

    const productVariant = variant;
    const hasOriginalPrice = Number.isFinite(Number(cuttedPrice)) && Number(cuttedPrice) > Number(price);

    return (
        <div className="flex flex-col gap-3 border-b px-3 py-4 sm:px-6" key={`${product}:${JSON.stringify(productVariant ?? null)}`}>

            <Link to={`/product/${product}`} className="group flex min-w-0 items-center gap-3 sm:gap-5">
                {/* <!-- product image --> */}
                <div className="h-24 w-24 flex-shrink-0 sm:h-28 sm:w-1/6">
                    <img draggable="false" className="h-full w-full object-contain" src={image} alt={name} />
                </div>
                {/* <!-- product image --> */}

                {/* <!-- description --> */}
                <div className="flex min-w-0 flex-1 flex-col sm:gap-5">
                    {/* <!-- product title --> */}
                    <div className="flex flex-col items-stretch justify-between gap-1 sm:flex-row sm:items-start sm:gap-0">
                        <div className="flex min-w-0 flex-col gap-0.5 sm:w-3/5">
                            <p className="truncate group-hover:text-primary-blue" title={name}>{name}</p>
                            <span className="text-sm text-gray-500">Seller: {seller}</span>
                        </div>

                        <div className="flex flex-col sm:gap-2">
                            <p className="text-sm">Delivery by {getDeliveryDate()} | <span className="text-primary-green">Free</span></p>
                            <span className="text-xs text-gray-500">7 Days Replacement Policy</span>
                        </div>

                    </div>
                    {/* <!-- product title --> */}

                    {/* <!-- price desc --> */}
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
                        <span>Unit price: ₹{Number(price).toLocaleString('en-IN')}</span>
                        <span className="font-medium">Subtotal: ₹{(Number(price) * Number(quantity)).toLocaleString('en-IN')}</span>
                        {hasOriginalPrice && (
                            <>
                                <span className="text-gray-500 line-through">₹{(Number(cuttedPrice) * Number(quantity)).toLocaleString('en-IN')}</span>
                                <span className="text-primary-green">{getDiscount(price, cuttedPrice)}% off</span>
                            </>
                        )}
                    </div>
                    {/* <!-- price desc --> */}

                </div>
                {/* <!-- description --> */}
            </Link>

            {/* <!-- save for later --> */}
            <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-start sm:gap-6">
                {/* <!-- quantity --> */}
                {inCart && <div className="flex items-center gap-1">
                    <button type="button" aria-label="Decrease quantity" onClick={() => decreaseQuantity(product, quantity)} className="w-11 h-11 text-3xl font-light bg-gray-50 rounded-full border flex items-center justify-center cursor-pointer">-</button>
                    <input aria-label="Quantity" className="w-11 border outline-none text-center rounded-sm py-0.5 text-gray-700 font-medium text-sm qtyInput" value={quantity} disabled />
                    <button type="button" aria-label="Increase quantity" onClick={() => increaseQuantity(product, quantity, stock)} className="w-11 h-11 text-xl font-light bg-gray-50 rounded-full border flex items-center justify-center cursor-pointer">+</button>
                </div>}
                {/* <!-- quantity --> */}
                {inCart && (
                    <>
                    <button type="button" onClick={() => saveForLaterHandler(product)} className="min-h-11 font-medium hover:text-primary-blue">SAVE FOR LATER</button>
                    <button type="button" onClick={removeCartItem} aria-label="Remove product" className="min-h-11 px-2 font-medium text-red-700 hover:text-red-800">Remove</button>
                    </>
                )}
            </div>
            {/* <!-- save for later --> */}

        </div>
    );
};

export default CartItem;
