const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const ErrorHandler = require('../utils/errorHandler');
const Order = require('../models/orderModel');
const PaymentSettings = require('../models/paymentSettingsModel');
const cloudinary = require('cloudinary');

const MAX_QR_IMAGE_SIZE = 5 * 1024 * 1024;

const getPublicQr = (settings) => {
    if (!settings?.isActive || !settings.qrImage?.url) return null;
    return {
        url: settings.qrImage.url,
        updatedAt: settings.updatedAt,
    };
};

const hasValidImageSignature = (file) => {
    const data = file.data;
    if (!Buffer.isBuffer(data)) return false;

    if (file.mimetype === 'image/png') {
        return data.length >= 8 && data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    }
    if (file.mimetype === 'image/jpeg') {
        return data.length >= 3 && data[0] === 255 && data[1] === 216 && data[2] === 255;
    }
    if (file.mimetype === 'image/webp') {
        return data.length >= 12 && data.toString('ascii', 0, 4) === 'RIFF' && data.toString('ascii', 8, 12) === 'WEBP';
    }
    return false;
};

const deleteQrAsset = async (publicId) => {
    if (!publicId) return null;
    try {
        const result = await cloudinary.v2.uploader.destroy(publicId, { resource_type: 'image' });
        return result.result === 'ok' || result.result === 'not found'
            ? null
            : 'The QR was updated, but the previous image could not be removed from storage.';
    } catch (error) {
        console.error('Unable to remove replaced payment QR from Cloudinary:', error.message);
        return 'The QR was updated, but the previous image could not be removed from storage.';
    }
};

exports.createPaymentIntent = asyncErrorHandler(async (req, res, next) => {
    const { orderId, paymentMethod } = req.body;
    if (!['PHONEPE', 'GOOGLE_PAY'].includes(paymentMethod)) {
        return next(new ErrorHandler('Select PhonePe or Google Pay for a UPI payment intent', 400));
    }
    if (!orderId || !/^[a-fA-F0-9]{24}$/.test(orderId)) {
        return next(new ErrorHandler('A valid order reference is required', 400));
    }

    const order = await Order.findById(orderId);
    if (!order) {
        return next(new ErrorHandler('Order Not Found', 404));
    }
    if (order.paymentInfo.status !== 'PENDING_PAYMENT') {
        return next(new ErrorHandler('This order is not awaiting payment', 400));
    }

    const upiId = process.env.PAYMENT_UPI_ID;
    const receiverName = process.env.PAYMENT_RECEIVER_NAME;
    if (!upiId || !receiverName) {
        return next(new ErrorHandler('UPI merchant details are not configured', 503));
    }
    if (!Number.isFinite(order.totalPrice) || order.totalPrice <= 0) {
        return next(new ErrorHandler('The validated order amount is invalid', 400));
    }

    order.paymentInfo.method = paymentMethod;
    await order.save();

    const params = new URLSearchParams({
        pa: upiId,
        pn: receiverName,
        tr: order._id.toString(),
        tn: `Order ${order._id}`,
        am: order.totalPrice.toFixed(2),
        cu: 'INR',
    });

    res.status(200).json({
        success: true,
        paymentIntent: {
            uri: `upi://pay?${params.toString()}`,
            reference: order._id.toString(),
            amount: order.totalPrice,
            currency: 'INR',
            paymentMethod,
            paymentStatus: order.paymentInfo.status,
            receiverName,
            receiverUpiId: upiId,
        },
    });
});

exports.getPaymentStatus = asyncErrorHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler('Order Not Found', 404));
    }

    res.status(200).json({
        success: true,
        paymentStatus: order.paymentInfo?.status || 'PENDING_PAYMENT',
        paymentMethod: order.paymentInfo?.method || 'PHONEPE',
        amount: order.totalPrice,
        reference: order._id.toString(),
        verificationAvailable: false,
    });
});

exports.getActivePaymentQr = asyncErrorHandler(async (req, res) => {
    const settings = await PaymentSettings.findById('active');
    res.status(200).json({
        success: true,
        paymentQr: getPublicQr(settings),
    });
});

exports.updatePaymentQr = asyncErrorHandler(async (req, res, next) => {
    const file = req.files?.qrImage;
    if (!file || Array.isArray(file)) {
        return next(new ErrorHandler('Select one QR image to upload', 400));
    }
    if (file.truncated || file.size > MAX_QR_IMAGE_SIZE) {
        return next(new ErrorHandler('QR image must be 5 MB or smaller', 413));
    }
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.mimetype) || !hasValidImageSignature(file)) {
        return next(new ErrorHandler('Upload a valid PNG, JPEG, or WebP image', 400));
    }

    const previousSettings = await PaymentSettings.findById('active');
    const settings = await PaymentSettings.findOneAndUpdate(
        { _id: 'active' },
        {
            $set: {
                qrImage: {
                    url: `data:${file.mimetype};base64,${file.data.toString('base64')}`,
                },
                isActive: true,
                updatedAt: new Date(),
            },
        },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    const cleanupWarning = await deleteQrAsset(previousSettings?.qrImage?.publicId);
    res.status(200).json({
        success: true,
        paymentQr: getPublicQr(settings),
        cleanupWarning,
    });
});

exports.removePaymentQr = asyncErrorHandler(async (req, res) => {
    const settings = await PaymentSettings.findByIdAndDelete('active');
    const cleanupWarning = await deleteQrAsset(settings?.qrImage?.publicId);
    res.status(200).json({
        success: true,
        paymentQr: null,
        cleanupWarning,
    });
});
