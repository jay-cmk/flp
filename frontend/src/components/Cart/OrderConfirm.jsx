import { useSelector } from 'react-redux';
import CartItem from './CartItem';
import PriceSidebar from './PriceSidebar';
import Stepper from './Stepper';
import { useLocation, useNavigate } from 'react-router-dom';
import MetaData from '../Layouts/MetaData';

const OrderConfirm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cartItems, shippingInfo } = useSelector((state) => state.cart);
    const checkoutItems = location.state?.checkoutItems || cartItems;

    const customerEmail = shippingInfo?.email || 'not provided';

    return (
        <>
            <MetaData title="Flipkart: Order Confirmation" />

            <main className="w-full mt-20">
                <div className="flex flex-col md:flex-row gap-3.5 w-full md:w-11/12 mt-0 md:mt-4 m-auto md:mb-7 px-2 sm:px-0">
                    <div className="flex-1">
                        <Stepper activeStep={2} items={checkoutItems}>
                            <div className="w-full bg-white">
                                {checkoutItems?.map((item, i) => (
                                    <CartItem {...item} inCart={false} key={`${item.product}:${JSON.stringify(item.variant ?? null)}:${i}`} />
                                ))}
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 bg-white px-4 sm:px-6 py-3 rounded-b-sm gap-3">
                                <p className="text-sm">Order details will be shared to <span className="font-medium">{customerEmail}</span></p>
                                <button onClick={() => navigate('/process/payment', { state: { checkoutItems } })} className="bg-primary-orange px-6 py-2 text-white font-medium rounded-sm shadow hover:shadow-lg uppercase">continue</button>
                            </div>
                        </Stepper>
                    </div>

                    <PriceSidebar cartItems={checkoutItems} />
                </div>
            </main>
        </>
    );
};

export default OrderConfirm;
