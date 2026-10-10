import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import Loader from '../Layouts/Loader';
import MetaData from '../Layouts/MetaData';
import PaymentQrDialog from './PaymentQrDialog';

const paymentMethods = [
    { id: 'PHONEPE', label: 'PhonePe', Icon: PhoneAndroidIcon },
    { id: 'GOOGLE_PAY', label: 'Google Pay', Icon: AccountBalanceWalletIcon },
    { id: 'SCAN_QR', label: 'Scan QR', Icon: QrCode2Icon },
];

const OrderStatus = () => {
    const { id } = useParams();
    const { enqueueSnackbar } = useSnackbar();
    const [status, setStatus] = useState(null);
    const [intent, setIntent] = useState(null);
    const [qrDialogOpen, setQrDialogOpen] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState('PHONEPE');
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const refreshStatus = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`/api/v1/payment/status/${id}`);
            setStatus(data);
        } catch (error) {
            enqueueSnackbar(error?.response?.data?.message || 'Unable to load payment status.', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    }, [enqueueSnackbar, id]);

    useEffect(() => {
        refreshStatus();
    }, [refreshStatus]);

    const retryPayment = async (method) => {
        setSelectedMethod(method);
        setProcessing(true);
        setIntent(null);
        setQrDialogOpen(false);
        try {
            if (method === 'SCAN_QR') {
                setQrDialogOpen(true);
            } else {
                const { data } = await axios.post('/api/v1/payment/intent', {
                    orderId: id,
                    paymentMethod: method,
                });
                setIntent(data.paymentIntent);
                if (/Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent)) {
                    window.location.href = data.paymentIntent.uri;
                }
            }
        } catch (error) {
            enqueueSnackbar(error?.response?.data?.message || 'Unable to retry UPI payment.', { variant: 'error' });
        } finally {
            setProcessing(false);
        }
    };

    if (loading && !status) return <Loader />;

    return (
        <>
            <MetaData title="Flipkart: Payment Status" />
            <main className="w-full mt-20 px-4 mb-12">
                <section className="mx-auto max-w-2xl rounded bg-white p-5 sm:p-8 shadow" aria-labelledby="payment-status-heading">
                    <h1 id="payment-status-heading" className="text-2xl font-semibold text-gray-900">Payment status</h1>
                    {status && (
                        <>
                            <p className="mt-4 text-lg font-medium">{status.paymentStatus.replace(/_/g, ' ')}</p>
                            <p className="mt-2 text-sm text-gray-700">Order reference: <strong>{status.reference}</strong></p>
                            <p className="mt-1 text-sm text-gray-700">Validated amount: <strong>₹{Number(status.amount).toLocaleString()}</strong></p>
                            <p className="mt-4 rounded border border-amber-300 bg-amber-50 p-4 text-sm text-gray-700">
                                This website starts a standard UPI payment intent but has no merchant gateway or secure payment verification callback. Returning from PhonePe or Google Pay does not confirm payment. The order will remain pending until server-side verification is configured.
                            </p>
                            <p className="mt-2 text-sm text-gray-700">
                                App launching depends on the device and browser. If the payment app does not open, use a compatible mobile device or continue with your UPI app on another device.
                            </p>
                        </>
                    )}

                    <div className="mt-5 flex flex-col sm:flex-row gap-3">
                        <button
                            type="button"
                            onClick={refreshStatus}
                            disabled={loading}
                            className="min-h-12 rounded border border-primary-blue px-4 py-3 text-primary-blue disabled:opacity-50"
                        >
                            Check payment status
                        </button>
                    </div>

                    {status?.paymentStatus === 'PENDING_PAYMENT' && (
                        <div className="mt-6">
                            <h2 className="font-semibold">Retry payment</h2>
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {paymentMethods.map(({ id: method, label, Icon }) => (
                                    <button
                                        type="button"
                                        key={method}
                                        onClick={() => retryPayment(method)}
                                        disabled={processing}
                                        className={`min-h-12 rounded border p-3 flex items-center justify-center gap-2 font-medium disabled:opacity-50 ${
                                            selectedMethod === method ? 'border-primary-blue text-primary-blue' : 'border-gray-300 text-gray-800'
                                        }`}
                                    >
                                        <Icon aria-hidden="true" /> Pay with {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {intent && (
                        <>
                            <a
                                href={intent.uri}
                                className="mt-4 inline-flex min-h-12 w-full sm:w-auto items-center justify-center rounded bg-primary-orange px-6 py-3 font-medium text-white shadow hover:shadow-lg"
                            >
                                Open {selectedMethod === 'GOOGLE_PAY' ? 'Google Pay / UPI app' : 'PhonePe / UPI app'}
                            </a>
                        </>
                    )}
                    {status?.paymentStatus === 'PENDING_PAYMENT' && selectedMethod === 'SCAN_QR' && (
                        <button
                            type="button"
                            onClick={() => setQrDialogOpen(true)}
                            className="mt-4 inline-flex min-h-12 w-full sm:w-auto items-center justify-center rounded border border-primary-blue px-6 py-3 font-medium text-primary-blue"
                        >
                            Show active payment QR
                        </button>
                    )}
                </section>
            </main>
            <PaymentQrDialog
                open={qrDialogOpen}
                onClose={() => setQrDialogOpen(false)}
                order={status ? { _id: status.reference, totalPrice: status.amount } : null}
            />
        </>
    );
};

export default OrderStatus;
