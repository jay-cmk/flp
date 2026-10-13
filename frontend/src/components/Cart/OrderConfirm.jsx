import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import { useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getDeliveryDate, getDiscount } from '../../utils/functions';
import states from '../../utils/states';
import MetaData from '../Layouts/MetaData';
import PriceSidebar from './PriceSidebar';
import Stepper from './Stepper';

const formatAmount = (amount) => Number(amount || 0).toLocaleString('en-IN');

const OrderConfirm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cartItems, shippingInfo } = useSelector((state) => state.cart);
    const checkoutItems = location.state?.checkoutItems || cartItems;
    const stateName = states.find((item) => item.code === shippingInfo?.state)?.name || shippingInfo?.state;
    const deliveryAddress = shippingInfo?.name
        ? `${shippingInfo.address}, ${shippingInfo.city}, ${stateName} - ${shippingInfo.pincode}`
        : '';

    return (
        <>
            <MetaData title="Flipkart: Confirm Order Details" />
            <main className="mx-auto w-full max-w-6xl px-3 pb-28 pt-16 sm:px-5 md:pb-8">
                <header className="mb-3 flex items-center gap-2 rounded-xl bg-white px-2 py-2 shadow-sm sm:px-4">
                    <Link to="/shipping" state={{ checkoutItems }} aria-label="Back to delivery address" className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100">
                        <ArrowBackIcon />
                    </Link>
                    <div>
                        <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">Checkout</p>
                        <h1 className="text-base font-semibold text-gray-900 sm:text-lg">Confirm details</h1>
                    </div>
                </header>

                {checkoutItems.length === 0 ? (
                    <section className="rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm">
                        <p className="font-medium text-gray-800">Your cart is empty.</p>
                        <Link to="/products" className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-primary-blue px-5 font-medium text-white">Browse products</Link>
                    </section>
                ) : (
                    <div className="flex flex-col gap-3 md:flex-row">
                        <div className="min-w-0 flex-1">
                            <Stepper activeStep={2} items={checkoutItems}>
                                <div className="space-y-3 p-3 sm:p-4">
                                    <section className="rounded-lg border border-gray-100 bg-gray-50 p-3 sm:p-4" aria-labelledby="delivery-address-title">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <h3 id="delivery-address-title" className="text-xs font-semibold uppercase tracking-wide text-gray-500">Delivering to</h3>
                                                {shippingInfo?.name ? (
                                                    <>
                                                        <p className="mt-2 text-sm font-semibold text-gray-900">{shippingInfo.name}</p>
                                                        <p className="mt-1 break-words text-sm leading-relaxed text-gray-700">{deliveryAddress}</p>
                                                        <p className="mt-1 text-sm text-gray-700">+91 {shippingInfo.phoneNo}</p>
                                                    </>
                                                ) : (
                                                    <p className="mt-2 text-sm text-red-700">Delivery address is missing. Add an address before continuing.</p>
                                                )}
                                            </div>
                                            <Link to="/shipping" state={{ checkoutItems }} className="flex min-h-10 flex-shrink-0 items-center rounded-md border border-primary-blue px-3 text-xs font-semibold uppercase text-primary-blue hover:bg-blue-50">Change</Link>
                                        </div>
                                    </section>

                                    <section aria-labelledby="items-heading" className="divide-y divide-gray-100">
                                        <h3 id="items-heading" className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Order items · {checkoutItems.reduce((count, item) => count + Number(item.quantity || 0), 0)}
                                        </h3>
                                        {checkoutItems.map((item, index) => {
                                            const price = Number(item.price) || 0;
                                            const quantity = Number(item.quantity) || 0;
                                            const originalPrice = Number(item.cuttedPrice);
                                            const hasDiscount = Number.isFinite(originalPrice) && originalPrice > price;
                                            const variant = typeof item.variant === 'string'
                                                ? item.variant
                                                : item.variant?.name || item.variant?.label;

                                            return (
                                                <article key={`${item.product}:${JSON.stringify(item.variant ?? null)}:${index}`} className="flex min-w-0 gap-3 py-3">
                                                    <Link to={`/product/${item.product}`} aria-label={`View ${item.name}`} className="flex h-[76px] w-[76px] flex-shrink-0 items-center justify-center rounded-lg bg-gray-50 p-2">
                                                        <img src={item.image} alt={item.name} className="h-full w-full object-contain" />
                                                    </Link>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium leading-5 text-gray-900" title={item.name}>{item.name}</p>
                                                        {variant && <p className="mt-1 truncate text-xs text-gray-500">Variant: {variant}</p>}
                                                        <p className="mt-1 text-xs text-gray-600">Qty: {quantity} · Delivery by {getDeliveryDate()}</p>
                                                        <p className="mt-1 text-xs text-gray-500">7 Days Replacement Policy</p>
                                                    </div>
                                                    <div className="flex-shrink-0 text-right">
                                                        <p className="text-sm font-semibold text-gray-900">₹{formatAmount(price * quantity)}</p>
                                                        {hasDiscount && (
                                                            <>
                                                                <p className="mt-1 text-xs text-gray-500 line-through">₹{formatAmount(originalPrice * quantity)}</p>
                                                                <p className="text-[11px] font-medium text-primary-green">{getDiscount(price, originalPrice)}% off</p>
                                                            </>
                                                        )}
                                                    </div>
                                                </article>
                                            );
                                        })}
                                    </section>

                                    <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2.5 text-xs text-gray-700">
                                        <LocalShippingOutlinedIcon className="text-primary-blue" sx={{ fontSize: 18 }} />
                                        <span>Free delivery · Expected by {getDeliveryDate()}</span>
                                    </div>
                                    <p className="text-xs text-gray-600">
                                        Order updates will be shared to <span className="font-medium text-gray-800">{shippingInfo?.email || 'your account'}</span>.
                                    </p>
                                    <button
                                        type="button"
                                        disabled={!shippingInfo?.name}
                                        onClick={() => navigate('/process/payment', { state: { checkoutItems } })}
                                        className="hidden min-h-12 w-full rounded-lg bg-primary-orange px-5 text-sm font-semibold uppercase text-white shadow-sm hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 md:block"
                                    >
                                        Continue to payment
                                    </button>
                                </div>
                            </Stepper>
                        </div>
                        <PriceSidebar cartItems={checkoutItems} />
                    </div>
                )}
            </main>

            {checkoutItems.length > 0 && (
                <div className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white/95 px-3 pt-3 shadow-[0_-4px_14px_rgba(0,0,0,0.08)] backdrop-blur md:hidden">
                    <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
                        <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-wide text-gray-500">Total amount</p>
                            <p className="text-base font-bold text-gray-900">₹{formatAmount(checkoutItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0))}</p>
                        </div>
                        <button
                            type="button"
                            disabled={!shippingInfo?.name}
                            onClick={() => navigate('/process/payment', { state: { checkoutItems } })}
                            className="min-h-12 flex-1 rounded-lg bg-primary-orange px-4 text-sm font-semibold uppercase text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Continue to payment
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default OrderConfirm;
