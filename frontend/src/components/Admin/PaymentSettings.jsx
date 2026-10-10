import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import MetaData from '../Layouts/MetaData';

const PaymentSettings = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [paymentQr, setPaymentQr] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [previewFailed, setPreviewFailed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let mounted = true;
        axios.get('/api/v1/admin/payment/qr')
            .then(({ data }) => {
                if (mounted) setPaymentQr(data.paymentQr);
            })
            .catch((error) => {
                if (mounted) {
                    enqueueSnackbar(error?.response?.data?.message || 'Unable to load payment QR settings.', { variant: 'error' });
                }
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });
        return () => {
            mounted = false;
        };
    }, [enqueueSnackbar]);

    useEffect(() => {
        if (!selectedFile) {
            setPreviewUrl('');
            return undefined;
        }
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedFile]);

    const handleFileChange = (event) => {
        const file = event.target.files?.[0] || null;
        setPreviewFailed(false);
        if (!file) {
            setSelectedFile(null);
            return;
        }
        if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
            enqueueSnackbar('Choose a PNG, JPEG, or WebP image.', { variant: 'error' });
            event.target.value = '';
            setSelectedFile(null);
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            enqueueSnackbar('QR image must be 5 MB or smaller.', { variant: 'error' });
            event.target.value = '';
            setSelectedFile(null);
            return;
        }
        setSelectedFile(file);
    };

    const savePaymentQr = async (event) => {
        event.preventDefault();
        if (!selectedFile || saving) return;

        const formData = new FormData();
        formData.append('qrImage', selectedFile);
        setSaving(true);
        try {
            const { data } = await axios.put('/api/v1/admin/payment/qr', formData);
            setPaymentQr(data.paymentQr);
            setSelectedFile(null);
            setPreviewFailed(false);
            enqueueSnackbar(data.cleanupWarning || 'Payment QR saved.', {
                variant: data.cleanupWarning ? 'warning' : 'success',
            });
        } catch (error) {
            enqueueSnackbar(error?.response?.data?.message || 'Unable to save payment QR.', { variant: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const removePaymentQr = async () => {
        if (!paymentQr || saving || !window.confirm('Remove the active payment QR?')) return;
        setSaving(true);
        try {
            const { data } = await axios.delete('/api/v1/admin/payment/qr');
            setPaymentQr(null);
            setSelectedFile(null);
            setPreviewFailed(false);
            enqueueSnackbar(data.cleanupWarning || 'Payment QR removed.', {
                variant: data.cleanupWarning ? 'warning' : 'success',
            });
        } catch (error) {
            enqueueSnackbar(error?.response?.data?.message || 'Unable to remove payment QR.', { variant: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const imageToPreview = previewUrl || paymentQr?.url;

    return (
        <>
            <MetaData title="Admin: Payment QR Settings" />
            <section className="w-full min-w-0 rounded-lg bg-white p-4 shadow sm:p-6" aria-labelledby="payment-qr-settings-title">
                <h1 id="payment-qr-settings-title" className="text-xl font-semibold text-gray-800">Payment QR</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Manage the QR image customers see when they choose Scan QR. Displaying or scanning it does not verify payment.
                </p>

                {loading ? (
                    <p className="mt-6 text-sm text-gray-600" role="status">Loading payment settings...</p>
                ) : (
                    <div className="mt-6 grid min-w-0 gap-6 md:grid-cols-2">
                        <div className="min-w-0">
                            <h2 className="font-medium text-gray-800">
                                {previewUrl ? 'Preview before saving' : 'Current customer QR'}
                            </h2>
                            {imageToPreview && !previewFailed ? (
                                <>
                                    <div className="mt-3 flex min-h-64 items-center justify-center rounded border border-gray-200 bg-gray-50 p-4">
                                        <img
                                            src={imageToPreview}
                                            alt={previewUrl ? 'Preview of selected payment QR' : 'Currently active customer payment QR'}
                                            className="max-h-80 max-w-full object-contain"
                                            onError={() => setPreviewFailed(true)}
                                        />
                                    </div>
                                    {previewUrl && (
                                        <p className="mt-2 text-xs text-gray-500">
                                            The current customer QR stays active until this preview is saved.
                                        </p>
                                    )}
                                </>
                            ) : (
                                <p className="mt-3 flex min-h-64 items-center justify-center rounded border border-dashed border-gray-300 bg-gray-50 p-5 text-center text-sm text-gray-500">
                                    {previewFailed ? 'The QR image could not be previewed.' : 'No payment QR is currently active.'}
                                </p>
                            )}
                            {paymentQr?.updatedAt && !previewUrl && (
                                <p className="mt-2 text-xs text-gray-500">
                                    Last updated: {new Date(paymentQr.updatedAt).toLocaleString()}
                                </p>
                            )}
                        </div>

                        <form onSubmit={savePaymentQr} className="flex min-w-0 flex-col items-start gap-4">
                            <h2 className="font-medium text-gray-800">{paymentQr ? 'Replace payment QR' : 'Upload payment QR'}</h2>
                            <label htmlFor="payment-qr-upload" className="text-sm text-gray-700">
                                Choose an image (PNG, JPEG, or WebP; up to 5 MB)
                            </label>
                            <input
                                id="payment-qr-upload"
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={handleFileChange}
                                disabled={saving}
                                className="block min-h-11 max-w-full text-sm text-gray-700 file:mr-3 file:min-h-11 file:rounded file:border-0 file:bg-gray-100 file:px-4 file:text-sm file:font-medium"
                            />
                            <div className="flex w-full flex-col gap-3 sm:flex-row">
                                <button
                                    type="submit"
                                    disabled={!selectedFile || saving}
                                    className="min-h-11 rounded bg-primary-orange px-5 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : paymentQr ? 'Save replacement' : 'Upload QR'}
                                </button>
                                {paymentQr && (
                                    <button
                                        type="button"
                                        onClick={removePaymentQr}
                                        disabled={saving}
                                        className="min-h-11 rounded border border-red-300 px-5 py-2 font-medium text-red-700 disabled:opacity-50"
                                    >
                                        Remove QR
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                )}
            </section>
        </>
    );
};

export default PaymentSettings;
