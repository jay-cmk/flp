import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const formatAmount = (amount) => Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const PaymentQrDialog = ({ open, onClose, order }) => {
    const dialogRef = useRef(null);
    const [paymentQr, setPaymentQr] = useState(null);
    const [loading, setLoading] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return undefined;

        if (!open) {
            if (dialog.open) dialog.close();
            return undefined;
        }

        if (!dialog.open) dialog.showModal();
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        let mounted = true;

        setPaymentQr(null);
        setImageLoaded(false);
        setError('');
        setLoading(true);
        axios.get('/api/v1/payment/qr')
            .then(({ data }) => {
                if (mounted) setPaymentQr(data.paymentQr);
            })
            .catch((requestError) => {
                if (mounted) {
                    setError(requestError?.response?.data?.message || 'Unable to load the payment QR. Please try again.');
                }
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });

        return () => {
            mounted = false;
            document.body.style.overflow = previousOverflow;
            if (dialog.open) dialog.close();
        };
    }, [open]);

    const closeOnBackdrop = (event) => {
        if (event.target === dialogRef.current) onClose();
    };

    const closeOnEscape = (event) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            onClose();
        }
    };

    return (
        <dialog
            ref={dialogRef}
            onCancel={(event) => {
                event.preventDefault();
                onClose();
            }}
            onClose={onClose}
            onClick={closeOnBackdrop}
            onKeyDown={closeOnEscape}
            aria-labelledby="payment-qr-title"
            aria-describedby="payment-qr-instructions"
            className="m-auto max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-md overflow-y-auto rounded-lg p-0 backdrop:bg-black/60"
        >
            <section className="p-4 text-center sm:p-6">
                <div className="flex items-start justify-between gap-4 text-left">
                    <div>
                        <h2 id="payment-qr-title" className="text-lg font-semibold">Scan to pay</h2>
                        <p id="payment-qr-instructions" className="mt-1 text-sm text-gray-600">
                            Scan this QR using your UPI app to make payment.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="min-h-11 min-w-11 rounded text-2xl text-gray-600 hover:bg-gray-100"
                        aria-label="Close payment QR"
                    >
                        &times;
                    </button>
                </div>

                <div className="relative mx-auto my-5 flex min-h-56 w-full max-w-[min(72vw,18rem)] items-center justify-center overflow-hidden rounded border border-gray-200 bg-gray-50 p-3">
                    {paymentQr?.url && !error && (
                        <img
                            src={paymentQr.url}
                            alt="Store-provided payment QR code"
                            onLoad={() => setImageLoaded(true)}
                            onError={() => {
                                setImageLoaded(false);
                                setError('The configured payment QR image could not be loaded. Please choose another payment method.');
                            }}
                            className={`max-h-[min(55vh,18rem)] max-w-full object-contain ${imageLoaded ? '' : 'invisible absolute'}`}
                        />
                    )}
                    {loading && <p className="text-sm text-gray-600" role="status">Loading payment QR...</p>}
                    {!loading && !error && !paymentQr && (
                        <p className="px-2 text-sm text-gray-700">
                            QR payment is currently unavailable. Please choose another payment method.
                        </p>
                    )}
                    {!loading && !error && paymentQr && !imageLoaded && (
                        <p className="text-sm text-gray-600" role="status">Loading QR image...</p>
                    )}
                    {!loading && error && <p className="px-2 text-sm text-red-700" role="alert">{error}</p>}
                </div>

                {order && (
                    <>
                        <p className="font-semibold">
                            Amount: ₹{formatAmount(order.totalPrice)}
                        </p>
                        <p className="mt-1 break-all text-xs text-gray-600">Order: {order._id}</p>
                    </>
                )}
               
            </section>
        </dialog>
    );
};

export default PaymentQrDialog;
