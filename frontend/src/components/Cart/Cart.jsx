import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import MetaData from '../Layouts/MetaData';
import CartItem from './CartItem';
import EmptyCart from './EmptyCart';
import PriceSidebar from './PriceSidebar';
import SaveForLaterItem from './SaveForLaterItem';

const Cart = () => {

    const navigate = useNavigate();
    const { cartItems } = useSelector((state) => state.cart);
    const { saveForLaterItems } = useSelector((state) => state.saveForLater);

    const placeOrderHandler = () => {
        navigate('/shipping');
    }

    return (
        <>
            <MetaData title="Shopping Cart | Flipkart" />
            <main className="w-full mt-20">

                {/* <!-- row --> */}
                <div className="flex flex-col md:flex-row gap-3.5 w-full md:w-11/12 mt-0 md:mt-4 m-auto md:mb-7 px-2 sm:px-0">

                    {/* <!-- cart column --> */}
                    <div className="flex-1">

                        {/* <!-- cart items container --> */}
                        <div className="flex flex-col shadow bg-white">
                            <span className="font-medium text-lg px-2 sm:px-8 py-4 border-b">
                                My Cart ({cartItems.reduce((count, item) => count + Number(item.quantity || 0), 0)})
                            </span>

                            {cartItems && cartItems.length === 0 && (
                                <EmptyCart />
                            )}

                            {cartItems && cartItems.map((item, index) => (
                                <CartItem
                                    {...item}
                                    inCart={true}
                                    key={`${item.product}:${JSON.stringify(item.variant ?? null)}:${index}`}
                                />
                            ))}

                            {/* <!-- place order btn --> */}
                            <div className="flex justify-end">
                                <button onClick={placeOrderHandler} disabled={cartItems.length < 1 ? true : false} className={`${cartItems.length < 1 ? "bg-primary-grey cursor-not-allowed" : "bg-primary-orange"} w-full sm:w-1/3 mx-2 sm:mx-6 my-4 py-3 font-medium text-white shadow hover:shadow-lg rounded-sm`}>PLACE ORDER</button>
                            </div>
                            {/* <!-- place order btn --> */}

                        </div>
                        {/* <!-- cart items container --> */}

                        {/* <!-- saved for later items container --> */}
                        <div className="flex flex-col mt-5 shadow bg-white">
                            <span className="font-medium text-lg px-2 sm:px-8 py-4 border-b">Saved For Later ({saveForLaterItems.length})</span>
                            {saveForLaterItems && saveForLaterItems.map((item) => (
                                <SaveForLaterItem {...item} />
                            )
                            )}
                        </div>
                        {/* <!-- saved for later container --> */}

                    </div>
                    {/* <!-- cart column --> */}

                    <PriceSidebar cartItems={cartItems} />

                </div>
                {/* <!-- row --> */}

            </main>
        </>
    );
};

export default Cart;
