import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { newOrder } from '../../actions/orderAction';
import { getDeliveryDate } from '../../utils/functions';
import states from '../../utils/states';
import MetaData from '../Layouts/MetaData';
import PaymentQrDialog from './PaymentQrDialog';
import Stepper from './Stepper';

const formatAmount = (amount) => Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
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

const methods = [
    { id: 'PHONEPE', label: 'PhonePe', description: 'Pay by any UPI app', Icon: PhoneAndroidIcon },
    { id: 'GOOGLE_PAY', label: 'Google Pay', description: 'Pay by any UPI app', Icon: AccountBalanceWalletIcon },
    { id: 'SCAN_QR', label: 'Scan QR Code', description: 'Pay by any UPI app', Icon: QrCode2Icon },
];

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
    const [qrDialogOpen, setQrDialogOpen] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState('PHONEPE');
    const [paymentStatus, setPaymentStatus] = useState('PENDING_PAYMENT');
    const [qrAvailable, setQrAvailable] = useState(false);
    const [checkingQr, setCheckingQr] = useState(true);
    const [qrCheckError, setQrCheckError] = useState(false);
    const checkoutContext = getCheckoutContext(shippingInfo, checkoutItems);
    const stateName = states.find((item) => item.code === shippingInfo?.state)?.name || shippingInfo?.state;

    useEffect(() => {
        let active = true;
        axios.get('/api/v1/payment/qr')
            .then(({ data }) => {
                if (active) setQrAvailable(Boolean(data.paymentQr?.url));
            })
            .catch(() => {
                if (active) setQrCheckError(true);
            })
            .finally(() => {
                if (active) setCheckingQr(false);
            });
        return () => {
            active = false;
        };
    }, []);

    const displayItems = pendingOrder?.orderItems?.map((orderItem) => {
        const checkoutItem = checkoutItems.find((item) => String(item.product) === String(orderItem.product));
        return { ...checkoutItem, ...orderItem, cuttedPrice: checkoutItem?.cuttedPrice };
    }) || checkoutItems;
    const totalPrice = pendingOrder?.totalPrice ?? checkoutItems.reduce(
        (sum, item) => sum + (Number(item.price) * Number(item.quantity)),
        0
    );

    const startPayment = async (method) => {
        if (processing) return;
        if (!shippingInfo?.name || checkoutItems.length === 0) {
            enqueueSnackbar('Delivery details and checkout items are required before payment.', { variant: 'error' });
            navigate('/cart');
            return;
        }

        setProcessing(true);
        setSelectedMethod(method);
        setPaymentIntent(null);
        try {
            const checkoutKey = getCheckoutKey(checkoutContext);
            const result = await dispatch(newOrder({
                shippingInfo,
                orderItems: checkoutItems.map((item) => ({
                    product: item.product,
                    quantity: item.quantity,
                })),
                paymentMethod: method,
            }, checkoutKey));
            const order = result?.order;
            if (!order?._id) throw new Error('The server did not return a pending order.');

            const saved = JSON.parse(window.sessionStorage.getItem('upiCheckout'));
            window.sessionStorage.setItem('upiCheckout', JSON.stringify({ ...saved, orderId: order._id }));
            setPendingOrder(order);
            setPaymentStatus(order.paymentInfo?.status || 'PENDING_PAYMENT');

            if (method === 'SCAN_QR') {
                setQrDialogOpen(true);
            } else {
                const { data } = await axios.post('/api/v1/payment/intent', {
                    orderId: order._id,
                    paymentMethod: method,
                });
                setPaymentStatus(data.paymentIntent.paymentStatus);
                setPaymentIntent(data.paymentIntent);
                if (/Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent)) {
                    window.location.href = data.paymentIntent.uri;
                }
            }
        } catch (error) {
            enqueueSnackbar(error?.response?.data?.message || error.message || 'Unable to start UPI payment.', { variant: 'error' });
        } finally {
            setProcessing(false);
        }
    };

    const continuePayment = () => {
        if (selectedMethod === 'SCAN_QR' && pendingOrder) {
            setQrDialogOpen(true);
            return;
        }
        startPayment(selectedMethod);
    };

    const checkPaymentStatus = async () => {
        if (!pendingOrder?._id) return;
        setProcessing(true);
        try {
            const { data } = await axios.get(`/api/v1/payment/status/${pendingOrder._id}`);
            setPaymentStatus(data.paymentStatus);
            if (data.paymentStatus === 'PAID') {
                enqueueSnackbar('Payment was verified by the server.', { variant: 'success' });
                navigate(`/order/${pendingOrder._id}`);
            } else {
                enqueueSnackbar('Payment is still pending. This checkout has no automatic UPI verification.', { variant: 'info' });
            }
        } catch (error) {
            enqueueSnackbar(error?.response?.data?.message || 'Unable to check payment status.', { variant: 'error' });
        } finally {
            setProcessing(false);
        }
    };

    const actionLabel = selectedMethod === 'SCAN_QR'
        ? 'View QR Code'
        : `Continue with ${selectedMethod === 'GOOGLE_PAY' ? 'Google Pay' : 'PhonePe'}`;

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
                        <h1 className="text-base font-semibold text-gray-900 sm:text-lg">Payment</h1>
                    </div>
                </header>

                {checkoutItems.length === 0 || !shippingInfo?.name ? (
                    <section className="rounded bg-white p-6 text-center shadow-sm">
                        <p className="font-medium text-gray-800">
                            {checkoutItems.length === 0 ? 'There are no items to pay for.' : 'Add a delivery address before payment.'}
                        </p>
                        <Link
                            to={checkoutItems.length === 0 ? '/cart' : '/shipping'}
                            state={{ checkoutItems }}
                            className="mt-4 inline-flex min-h-11 items-center rounded bg-primary-blue px-5 text-white"
                        >
                            {checkoutItems.length === 0 ? 'Return to cart' : 'Add delivery address'}
                        </Link>
                    </section>
                ) : (
                    <>
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
                                    const price = Number(item.price);
                                    const quantity = Number(item.quantity);
                                    const originalPrice = Number(item.cuttedPrice);
                                    const hasOriginalPrice = Number.isFinite(originalPrice) && originalPrice > price;
                                    const itemKey = `${item.product || item._id || index}:${JSON.stringify(item.variant ?? null)}:${index}`;
                                    return (
                                        <li key={itemKey} className="flex min-w-0 items-center gap-3 py-3">
                                            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded bg-white">
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name || 'Product'}
                                                        className="h-full w-full object-contain"
                                                        onError={(event) => { event.currentTarget.hidden = true; }}
                                                    />
                                                ) : <span className="px-1 text-center text-xs text-gray-500">No image</span>}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-gray-900" title={item.name}>{item.name}</p>
                                                {item.variant && (
                                                    <p className="mt-1 truncate text-xs text-gray-600">
                                                        Variant: {typeof item.variant === 'string' ? item.variant : item.variant.name || item.variant.label || ''}
                                                    </p>
                                                )}
                                                <p className="mt-1 text-xs text-gray-600">Qty: {quantity}</p>
                                            </div>
                                            <div className="flex-shrink-0 text-right">
                                                <p className="text-sm font-semibold text-blue-700">₹{formatAmount(price * quantity)}</p>
                                                {hasOriginalPrice && (
                                                    <p className="text-xs text-gray-500 line-through">₹{formatAmount(originalPrice * quantity)}</p>
                                                )}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                            <div className="mt-2 flex justify-between border-t border-gray-200 pt-3 text-sm font-semibold text-gray-900">
                                <span>Total Amount</span>
                                <span className="text-blue-700">₹{formatAmount(totalPrice)}</span>
                            </div>
                        </section>

                        <section className="bg-white p-3 sm:p-5" aria-labelledby="payment-method-heading">
                            <h2 id="payment-method-heading" className="text-base font-semibold text-gray-900">UPI</h2>
                            <p className="mt-1 text-xs text-gray-600">Choose an available UPI option. Payment is complete only after server verification.</p>
                            <div role="radiogroup" aria-label="UPI payment method" className="mt-4 flex flex-col gap-3">
                                {methods.filter(({ id }) => id !== 'SCAN_QR' || qrAvailable).map(({ id, label, description, Icon }) => (
                                    <button
                                        key={id}
                                        type="button"
                                        role="radio"
                                        aria-checked={selectedMethod === id}
                                        onClick={() => setSelectedMethod(id)}
                                        disabled={processing}
                                        className={`flex min-h-[4.5rem] w-full items-center gap-4 rounded-lg border p-4 text-left transition-colors ${
                                            selectedMethod === id
                                                ? 'border-2 border-primary-blue bg-blue-50'
                                                : 'border-gray-200 bg-white hover:border-blue-300'
                                        } ${processing ? 'cursor-wait opacity-60' : ''}`}
                                    >
                                        <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                                            selectedMethod === id ? 'bg-white text-primary-blue' : 'bg-gray-50 text-gray-600'
                                        }`}>
                                            <Icon aria-hidden="true" />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block font-medium text-gray-900">{label}</span>
                                            <span className="mt-1 block text-sm text-gray-600">{description}</span>
                                        </span>
                                        <span aria-hidden="true" className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border ${
                                            selectedMethod === id ? 'border-primary-blue' : 'border-gray-400'
                                        }`}>
                                            {selectedMethod === id && <span className="h-2.5 w-2.5 rounded-full bg-primary-blue" />}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            {checkingQr && <p className="mt-3 text-xs text-gray-500" role="status">Checking if QR payment is configured…</p>}
                            {!checkingQr && qrCheckError && (
                                <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800" role="status">
                                    QR payment options could not be checked. PhonePe and Google Pay remain available if merchant UPI details are configured.
                                </p>
                            )}
                            {!checkingQr && !qrCheckError && !qrAvailable && (
                                <p className="mt-3 text-xs text-gray-500">Cash on Delivery and QR payment are not configured for this store.</p>
                            )}

                            {pendingOrder && (
                                <section className={`mt-5 rounded-lg border p-4 ${
                                    paymentStatus === 'PAID'
                                        ? 'border-green-200 bg-green-50'
                                        : ['PAYMENT_FAILED', 'CANCELLED'].includes(paymentStatus)
                                            ? 'border-red-200 bg-red-50'
                                            : 'border-amber-200 bg-amber-50'
                                }`} aria-live="polite">
                                    <h3 className="font-semibold text-gray-900">
                                        {paymentStatus === 'PAID'
                                            ? 'Payment verified'
                                            : ['PAYMENT_FAILED', 'CANCELLED'].includes(paymentStatus)
                                                ? 'Payment not completed'
                                                : 'Payment awaiting verification'}
                                    </h3>
                                    <p className="mt-2 break-all text-sm text-gray-700">
                                        Order reference: <strong>{paymentIntent?.reference || pendingOrder._id}</strong>
                                    </p>
                                    <p className="mt-1 text-sm text-gray-700">
                                        {paymentStatus === 'PAID'
                                            ? 'The server has verified this payment.'
                                            : 'Returning from a UPI app or closing the QR does not confirm payment. This order remains pending until the server verifies it.'}
                                    </p>
                                    {paymentIntent && (
                                        <a
                                            href={paymentIntent.uri}
                                            className="mt-3 inline-flex min-h-11 items-center rounded bg-primary-orange px-4 py-2 font-medium text-white"
                                        >
                                            Open {selectedMethod === 'GOOGLE_PAY' ? 'Google Pay' : 'PhonePe / UPI app'}
                                        </a>
                                    )}
                                    <button
                                        type="button"
                                        onClick={checkPaymentStatus}
                                        disabled={processing}
                                        className="mt-3 block min-h-11 rounded border border-primary-blue px-4 py-2 text-primary-blue disabled:opacity-50"
                                    >
                                        Check payment status
                                    </button>
                                    {paymentStatus !== 'PAID' && (
                                        <p className="mt-2 text-xs text-gray-600">If you cancelled in your UPI app, you can retry once you are ready. Do not pay again while your bank app shows a completed transaction.</p>
                                    )}
                                </section>
                            )}
                        </section>
                        </Stepper>
                    </>
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
                            onClick={continuePayment}
                            disabled={processing}
                            className="min-h-12 min-w-0 flex-1 rounded-lg bg-primary-orange px-4 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:cursor-wait disabled:opacity-60 sm:flex-none sm:px-8"
                        >
                            {processing ? 'Preparing payment...' : actionLabel}
                        </button>
                    </div>
                </div>
            )}
            <PaymentQrDialog
                open={qrDialogOpen}
                onClose={() => setQrDialogOpen(false)}
                order={pendingOrder}
            />
        </>
    );
};

export default Payment;
