import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { newOrder } from '../../actions/orderAction';
import { getDeliveryDate, getDiscount } from '../../utils/functions';
import states from '../../utils/states';
import MetaData from '../Layouts/MetaData';
import Stepper from './Stepper';

const formatAmount = (amount) => Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const makeCheckoutKey = () => {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    const values = new Uint8Array(16);
    window.crypto.getRandomValues(values);
    return Array.from(values, (value) => value.toString(16).padStart(2, '0')).join('');
};

const getCheckoutContext = (shippingInfo, items) => JSON.stringify({
    shippingInfo,
    items: items.map((item) => ({ product: item.product, quantity: item.quantity, variant: item.variant || null })),
});

const getCheckoutKey = (context) => {
    const saved = window.sessionStorage.getItem('upiCheckout');
    if (saved) {
        try {
            const checkout = JSON.parse(saved);
            if (checkout.context === context && checkout.key) return checkout.key;
        } catch {
            window.sessionStorage.removeItem('upiCheckout');
        }
    }

    const key = makeCheckoutKey();
    window.sessionStorage.setItem('upiCheckout', JSON.stringify({ context, key }));
    return key;
};

const saveCheckoutOrder = (context, key, orderId) => {
    window.sessionStorage.setItem('upiCheckout', JSON.stringify({ context, key, orderId }));
};

const copyToClipboard = async (text) => {
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
    }

    const input = document.createElement('textarea');
    input.value = text;
    input.setAttribute('readonly', '');
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(input);
    if (!copied) throw new Error('Clipboard access is not available in this browser.');
};

const Payment = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { enqueueSnackbar } = useSnackbar();
    const { shippingInfo, cartItems } = useSelector((state) => state.cart);
    const checkoutItems = location.state?.checkoutItems?.length
        ? location.state.checkoutItems
        : cartItems;
    const [processing, setProcessing] = useState(false);
    const [pendingOrder, setPendingOrder] = useState(null);
    const [paymentIntent, setPaymentIntent] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState('PENDING_PAYMENT');
    const [returnedFromUpi, setReturnedFromUpi] = useState(false);
    const processingRef = useRef(false);
    const launchAttemptedRef = useRef(false);
    const checkoutContext = getCheckoutContext(shippingInfo, checkoutItems);
    const stateName = states.find((item) => item.code === shippingInfo?.state)?.name || shippingInfo?.state;

    useEffect(() => {
        let active = true;
        const saved = window.sessionStorage.getItem('upiCheckout');
        if (!saved) return undefined;

        try {
            const checkout = JSON.parse(saved);
            if (checkout.context !== checkoutContext || !checkout.orderId) return undefined;
            axios.get(`/api/v1/order/${checkout.orderId}`)
                .then(({ data }) => {
                    if (!active) return;
                    setPendingOrder(data.order);
                    setPaymentStatus(data.order.paymentInfo?.status || 'PENDING_PAYMENT');
                })
                .catch((error) => {
                    if (active) {
                        enqueueSnackbar(error?.response?.data?.message || 'Unable to restore your pending checkout.', { variant: 'error' });
                    }
                });
        } catch {
            window.sessionStorage.removeItem('upiCheckout');
        }

        return () => {
            active = false;
        };
    }, [checkoutContext, enqueueSnackbar]);

    const displayItems = pendingOrder?.orderItems?.map((orderItem) => {
        const checkoutItem = checkoutItems.find((item) => String(item.product) === String(orderItem.product));
        return { ...checkoutItem, ...orderItem, cuttedPrice: checkoutItem?.cuttedPrice };
    }) || checkoutItems;
    const totalPrice = pendingOrder?.totalPrice ?? checkoutItems.reduce(
        (sum, item) => sum + (Number(item.price) * Number(item.quantity)),
        0
    );

    const checkPaymentStatus = useCallback(async (orderId = pendingOrder?._id) => {
        if (!orderId) return;
        try {
            const { data } = await axios.get(`/api/v1/payment/status/${orderId}`);
            setPaymentStatus(data.paymentStatus);
            if (data.paymentStatus === 'PAID') {
                enqueueSnackbar('Payment was verified by the server.', { variant: 'success' });
                navigate(`/order/${orderId}`);
            } else {
                enqueueSnackbar('Payment is still pending. Returning from a UPI app does not confirm payment.', { variant: 'info' });
            }
        } catch (error) {
            enqueueSnackbar(error?.response?.data?.message || 'Unable to check payment status.', { variant: 'error' });
        }
    }, [enqueueSnackbar, navigate, pendingOrder?._id]);

    useEffect(() => {
        const handleReturn = () => {
            if (document.visibilityState !== 'visible' || !launchAttemptedRef.current) return;
            launchAttemptedRef.current = false;
            setReturnedFromUpi(true);
            checkPaymentStatus();
        };
        document.addEventListener('visibilitychange', handleReturn);
        return () => document.removeEventListener('visibilitychange', handleReturn);
    }, [checkPaymentStatus]);

    const startPayment = async () => {
        if (processingRef.current) return;
        if (!shippingInfo?.name || checkoutItems.length === 0) {
            enqueueSnackbar('Delivery details and checkout items are required before payment.', { variant: 'error' });
            navigate(checkoutItems.length === 0 ? '/cart' : '/shipping', { state: { checkoutItems } });
            return;
        }

        processingRef.current = true;
        setProcessing(true);
        try {
            let order = pendingOrder;
            const checkoutKey = getCheckoutKey(checkoutContext);
            if (!order?._id) {
                const result = await dispatch(newOrder({
                    shippingInfo,
                    orderItems: checkoutItems.map((item) => ({
                        product: item.product,
                        quantity: item.quantity,
                    })),
                    paymentMethod: 'UPI',
                }, checkoutKey));
                order = result?.order;
                if (!order?._id) throw new Error('The server did not return a pending order.');
                setPendingOrder(order);
            }

            saveCheckoutOrder(checkoutContext, checkoutKey, order._id);
            setPaymentStatus(order.paymentInfo?.status || 'PENDING_PAYMENT');

            const { data } = await axios.post('/api/v1/payment/intent', {
                orderId: order._id,
                paymentMethod: 'UPI',
            });
            const intent = data.paymentIntent;
            if (!intent?.uri || !intent.receiverUpiId || !Number.isFinite(Number(intent.amount))) {
                throw new Error('The server returned an incomplete UPI payment request.');
            }

            setPaymentIntent(intent);
            setPaymentStatus(intent.paymentStatus || 'PENDING_PAYMENT');
            setReturnedFromUpi(false);
            if (/Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent)) {
                launchAttemptedRef.current = true;
                window.location.assign(intent.uri);
            }
        } catch (error) {
            enqueueSnackbar(error?.response?.data?.message || error.message || 'Unable to prepare the UPI payment.', { variant: 'error' });
        } finally {
            processingRef.current = false;
            setProcessing(false);
        }
    };

    const openUpiApp = () => {
        if (!paymentIntent?.uri) return;
        launchAttemptedRef.current = true;
        window.location.assign(paymentIntent.uri);
    };

    const copyUpiId = async () => {
        if (!paymentIntent?.receiverUpiId) return;
        try {
            await copyToClipboard(paymentIntent.receiverUpiId);
            enqueueSnackbar('UPI ID copied.', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar(error.message || 'Unable to copy the UPI ID.', { variant: 'error' });
        }
    };

    return (
        <>
            <MetaData title="Flipkart: UPI Payment" />
            <main className="mx-auto w-full max-w-5xl px-3 pb-32 pt-16 sm:px-5 sm:pb-36">
                <header className="mb-3 flex items-center gap-2 rounded-xl bg-white px-2 py-2 shadow-sm sm:px-4">
                    <Link
                        to="/order/confirm"
                        state={{ checkoutItems }}
                        aria-label="Back to confirm details"
                        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100"
                    >
                        <ArrowBackIcon />
                    </Link>
                    <div>
                        <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">Checkout</p>
                        <h1 className="text-base font-semibold text-gray-900 sm:text-lg">Pay using UPI</h1>
                    </div>
                </header>

                {checkoutItems.length === 0 || !shippingInfo?.name ? (
                    <section className="rounded-xl bg-white p-6 text-center shadow-sm">
                        <p className="font-medium text-gray-800">
                            {checkoutItems.length === 0 ? 'There are no items to pay for.' : 'Add a delivery address before payment.'}
                        </p>
                        <Link
                            to={checkoutItems.length === 0 ? '/cart' : '/shipping'}
                            state={{ checkoutItems }}
                            className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-primary-blue px-5 text-white"
                        >
                            {checkoutItems.length === 0 ? 'Return to cart' : 'Add delivery address'}
                        </Link>
                    </section>
                ) : (
                    <Stepper activeStep={3} items={checkoutItems}>
                        <section className="border-b border-gray-100 bg-white px-3 py-3 sm:px-5" aria-labelledby="payment-delivery-title">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h2 id="payment-delivery-title" className="text-xs font-semibold uppercase tracking-wide text-gray-500">Delivering to</h2>
                                    <p className="mt-1 text-sm font-semibold text-gray-900">{shippingInfo.name} · +91 {shippingInfo.phoneNo}</p>
                                    <p className="mt-1 break-words text-xs leading-relaxed text-gray-600">
                                        {shippingInfo.address}, {shippingInfo.city}, {stateName} - {shippingInfo.pincode}
                                    </p>
                                </div>
                                <Link to="/shipping" state={{ checkoutItems }} className="min-h-9 flex-shrink-0 rounded-md border border-primary-blue px-3 py-2 text-[10px] font-semibold uppercase text-primary-blue">Change</Link>
                            </div>
                        </section>

                        <section className="border-b border-gray-100 bg-white p-3 sm:p-5" aria-labelledby="payment-order-title">
                            <div className="mb-3 flex items-start justify-between gap-3">
                                <div>
                                    <h2 id="payment-order-title" className="text-sm font-semibold text-gray-900 sm:text-base">Order summary</h2>
                                    <p className="mt-1 text-xs text-gray-500">Delivery by {getDeliveryDate()}</p>
                                </div>
                                <Link to="/cart" className="min-h-9 rounded-md border border-primary-blue px-3 py-2 text-[10px] font-semibold uppercase text-primary-blue">Edit cart</Link>
                            </div>
                            <ul className="mt-2 divide-y divide-gray-100">
                                {displayItems.map((item, index) => {
                                    const price = Number(item.price) || 0;
                                    const quantity = Number(item.quantity) || 0;
                                    const originalPrice = Number(item.cuttedPrice);
                                    const hasDiscount = Number.isFinite(originalPrice) && originalPrice > price;
                                    const itemKey = `${item.product || item._id || index}:${JSON.stringify(item.variant ?? null)}:${index}`;
                                    const variant = typeof item.variant === 'string'
                                        ? item.variant
                                        : item.variant?.name || item.variant?.label;
                                    return (
                                        <li key={itemKey} className="flex min-w-0 items-center gap-3 py-3">
                                            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded bg-gray-50 p-1">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name || 'Product'} className="h-full w-full object-contain" />
                                                ) : <span className="px-1 text-center text-[10px] text-gray-500">No image</span>}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-gray-900" title={item.name}>{item.name}</p>
                                                {variant && <p className="mt-1 truncate text-xs text-gray-600">Variant: {variant}</p>}
                                                <p className="mt-1 text-xs text-gray-600">Qty: {quantity}</p>
                                            </div>
                                            <div className="flex-shrink-0 text-right">
                                                <p className="text-sm font-semibold text-blue-700">₹{formatAmount(price * quantity)}</p>
                                                {hasDiscount && (
                                                    <>
                                                        <p className="text-xs text-gray-500 line-through">₹{formatAmount(originalPrice * quantity)}</p>
                                                        <p className="text-[11px] text-primary-green">{getDiscount(price, originalPrice)}% off</p>
                                                    </>
                                                )}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                            <div className="mt-2 flex justify-between border-t border-gray-200 pt-3 text-sm font-semibold text-gray-900">
                                <span>Total payable</span>
                                <span className="text-blue-700">₹{formatAmount(totalPrice)}</span>
                            </div>
                        </section>

                        <section className="bg-white p-3 sm:p-5" aria-labelledby="upi-payment-heading">
                            <div className="flex items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-primary-blue">
                                    <AccountBalanceWalletIcon />
                                </span>
                                <div>
                                    <h2 id="upi-payment-heading" className="text-sm font-semibold text-gray-900 sm:text-base">UPI payment</h2>
                                    <p className="mt-0.5 text-xs text-gray-600">Your UPI app chooser will list installed apps, including Google Pay if available.</p>
                                </div>
                            </div>

                            {pendingOrder && (
                                <section className={`mt-4 rounded-lg border p-3 ${
                                    paymentStatus === 'PAID'
                                        ? 'border-green-200 bg-green-50'
                                        : ['PAYMENT_FAILED', 'CANCELLED'].includes(paymentStatus)
                                            ? 'border-red-200 bg-red-50'
                                            : 'border-amber-200 bg-amber-50'
                                }`} aria-live="polite">
                                    <h3 className="text-sm font-semibold text-gray-900">
                                        {paymentStatus === 'PAID' ? 'Payment verified' : 'Order created · payment pending'}
                                    </h3>
                                    <p className="mt-1 break-all text-xs text-gray-700">Order reference: {pendingOrder._id}</p>
                                    {paymentStatus !== 'PAID' && (
                                        <p className="mt-2 text-xs leading-relaxed text-gray-700">
                                            This store does not receive payment confirmation from UPI apps. Returning from an app does not mean payment is verified. Do not pay again if your UPI app shows a completed transfer.
                                        </p>
                                    )}
                                    {returnedFromUpi && paymentStatus !== 'PAID' && (
                                        <p className="mt-2 text-xs font-medium text-amber-900">You returned from the UPI app. This order is still pending confirmation.</p>
                                    )}
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => checkPaymentStatus()}
                                            disabled={processing}
                                            className="min-h-10 rounded-md border border-primary-blue px-3 text-xs font-medium text-primary-blue disabled:opacity-50"
                                        >
                                            Check order status
                                        </button>
                                        <Link to={`/order/${pendingOrder._id}`} className="inline-flex min-h-10 items-center rounded-md border border-gray-300 px-3 text-xs font-medium text-gray-700">
                                            View pending order
                                        </Link>
                                    </div>
                                </section>
                            )}

                            {paymentIntent && (
                                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">If the UPI app did not open</p>
                                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="text-[11px] text-gray-500">Pay to UPI ID</p>
                                            <p className="break-all text-sm font-semibold text-gray-900">{paymentIntent.receiverUpiId}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={copyUpiId}
                                            className="inline-flex min-h-10 flex-shrink-0 items-center gap-1.5 rounded-md border border-primary-blue px-3 text-xs font-semibold text-primary-blue"
                                        >
                                            <ContentCopyIcon sx={{ fontSize: 15 }} /> Copy UPI ID
                                        </button>
                                    </div>
                                    <p className="mt-2 text-xs text-gray-700">Amount: <strong>₹{formatAmount(paymentIntent.amount)}</strong> · INR</p>
                                    <p className="mt-1 break-all text-[11px] text-gray-500">Order note: {pendingOrder?._id}</p>
                                    <a
                                        href={paymentIntent.uri}
                                        onClick={(event) => {
                                            event.preventDefault();
                                            openUpiApp();
                                        }}
                                        className="mt-3 inline-flex min-h-10 items-center gap-2 text-xs font-medium text-primary-blue underline"
                                    >
                                        <PhoneAndroidIcon sx={{ fontSize: 17 }} /> Open UPI app chooser again
                                    </a>
                                </div>
                            )}
                        </section>
                    </Stepper>
                )}
            </main>

            {checkoutItems.length > 0 && shippingInfo?.name && (
                <div className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white/95 px-3 pt-3 shadow-[0_-4px_14px_rgba(0,0,0,0.08)] backdrop-blur sm:px-5">
                    <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
                        <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-wide text-gray-500">Payable amount</p>
                            <p className="text-base font-bold text-gray-900">₹{formatAmount(totalPrice)}</p>
                        </div>
                        <button
                            type="button"
                            onClick={startPayment}
                            disabled={processing || paymentStatus === 'PAID'}
                            className="inline-flex min-h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg bg-primary-orange px-4 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:cursor-wait disabled:opacity-60 sm:flex-none sm:px-8"
                        >
                            <AccountBalanceWalletIcon sx={{ fontSize: 18 }} />
                            {processing ? 'Preparing UPI...' : 'Pay Now using UPI'}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Payment;
