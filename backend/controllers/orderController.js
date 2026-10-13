const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const mongoose = require('mongoose');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');

const SUPPORTED_PAYMENT_METHODS = ['UPI', 'PHONEPE', 'GOOGLE_PAY', 'SCAN_QR'];

exports.newOrder = asyncErrorHandler(async (req, res, next) => {
    const { shippingInfo, orderItems, paymentMethod } = req.body;
    const checkoutKey = req.get('Idempotency-Key');

    if (!shippingInfo || !Array.isArray(orderItems) || orderItems.length === 0) {
        return next(new ErrorHandler('Invalid order data', 400));
    }

    if (req.body.paymentInfo?.status && req.body.paymentInfo.status !== 'PENDING_PAYMENT') {
        return next(new ErrorHandler('Payment status is controlled by the server', 400));
    }

    if (!checkoutKey || !/^[a-zA-Z0-9-]{16,100}$/.test(checkoutKey)) {
        return next(new ErrorHandler('A valid checkout idempotency key is required', 400));
    }

    if (paymentMethod === 'COD' || paymentMethod === 'CASH_ON_DELIVERY') {
        return next(new ErrorHandler('Cash on Delivery is unavailable', 400));
    }

    if (!SUPPORTED_PAYMENT_METHODS.includes(paymentMethod)) {
        return next(new ErrorHandler('Select UPI, PhonePe, Google Pay, or Scan QR', 400));
    }

    const existingOrder = await Order.findOne({ checkoutKey });
    if (existingOrder) {
        if (existingOrder.paymentInfo.status === 'PENDING_PAYMENT' && existingOrder.paymentInfo.method !== paymentMethod) {
            existingOrder.paymentInfo.method = paymentMethod;
            await existingOrder.save();
        }
        return res.status(200).json({ success: true, order: existingOrder });
    }

    const requiredShippingFields = ['name', 'address', 'city', 'state', 'pincode', 'phoneNo'];
    for (const field of requiredShippingFields) {
        if (!shippingInfo[field]) {
            return next(new ErrorHandler(`Please provide a valid ${field}`, 400));
        }
    }

    if (!/^\d{6}$/.test(String(shippingInfo.pincode)) || !/^\d{10}$/.test(String(shippingInfo.phoneNo))) {
        return next(new ErrorHandler('Please provide a valid delivery pincode and 10-digit phone number', 400));
    }

    const normalizedItems = [];
    let calculatedTotal = 0;
    const quantitiesByProduct = new Map();

    for (const item of orderItems) {
        const quantity = Number(item.quantity);
        if (!item.product || !Number.isInteger(quantity) || quantity < 1) {
            return next(new ErrorHandler('Each cart item must include a valid product and quantity', 400));
        }

        quantitiesByProduct.set(
            String(item.product),
            (quantitiesByProduct.get(String(item.product)) || 0) + quantity
        );
    }

    for (const [productId, quantity] of quantitiesByProduct) {
        if (!mongoose.isValidObjectId(productId)) {
            return next(new ErrorHandler('Invalid product id in cart', 400));
        }
        const product = await Product.findById(productId);
        if (!product) {
            return next(new ErrorHandler(`Product not found for id: ${productId}`, 404));
        }

        const unitPrice = Number(product.price);
        if (!Number.isFinite(unitPrice) || unitPrice < 0) {
            return next(new ErrorHandler(`Invalid price for product: ${product.name}`, 400));
        }

        if (product.stock < quantity) {
            return next(new ErrorHandler(`Not enough stock for product: ${product.name}`, 400));
        }

        normalizedItems.push({
            name: product.name,
            price: unitPrice,
            quantity,
            image: product.images?.[0]?.url || '',
            product: product._id,
        });

        calculatedTotal += unitPrice * quantity;
    }

    if (!Number.isFinite(calculatedTotal)) {
        return next(new ErrorHandler('The calculated order total is invalid', 400));
    }

    let order;
    try {
        order = await Order.create({
            shippingInfo: {
                name: shippingInfo.name,
                email: shippingInfo.email || '',
                address: shippingInfo.address,
                city: shippingInfo.city,
                state: shippingInfo.state,
                country: shippingInfo.country || 'IN',
                pincode: Number(shippingInfo.pincode),
                phoneNo: Number(shippingInfo.phoneNo),
            },
            orderItems: normalizedItems,
            user: req.user ? req.user._id : undefined,
            paymentInfo: {
                id: '',
                status: 'PENDING_PAYMENT',
                method: paymentMethod,
            },
            checkoutKey,
            totalPrice: calculatedTotal,
            paidAt: null,
            orderStatus: 'Pending Payment',
        });
        order.paymentInfo.id = `upi-${order._id}`;
        await order.save();
    } catch (error) {
        if (error.code !== 11000) {
            throw error;
        }
        order = await Order.findOne({ checkoutKey });
        if (!order) {
            throw error;
        }
    }

    res.status(201).json({
        success: true,
        order,
    });
});

exports.getSingleOrderDetails = asyncErrorHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
        return next(new ErrorHandler('Order Not Found', 404));
    }

    res.status(200).json({
        success: true,
        order,
    });
});

exports.myOrders = asyncErrorHandler(async (req, res, next) => {
    if (!req.user) {
        return next(new ErrorHandler('Please login to view your orders', 401));
    }

    const orders = await Order.find({ user: req.user._id });

    if (!orders) {
        return next(new ErrorHandler('Order Not Found', 404));
    }

    res.status(200).json({
        success: true,
        orders,
    });
});

exports.getAllOrders = asyncErrorHandler(async (req, res, next) => {
    const orders = await Order.find();

    if (!orders) {
        return next(new ErrorHandler('Order Not Found', 404));
    }

    let totalAmount = 0;
    orders.forEach((order) => {
        totalAmount += order.totalPrice;
    });

    res.status(200).json({
        success: true,
        orders,
        totalAmount,
    });
});

exports.updateOrder = asyncErrorHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler('Order Not Found', 404));
    }

    if (order.orderStatus === 'Delivered') {
        return next(new ErrorHandler('Already Delivered', 400));
    }

    if (['Processing', 'Shipped', 'Delivered'].includes(req.body.status) && order.paymentInfo.status !== 'PAID') {
        return next(new ErrorHandler('Order cannot be fulfilled until payment is verified', 400));
    }

    if (!['Processing', 'Shipped', 'Delivered'].includes(req.body.status)) {
        return next(new ErrorHandler('Invalid order status', 400));
    }

    if (req.body.status === 'Shipped') {
        order.shippedAt = Date.now();
        order.orderItems.forEach(async (item) => {
            await updateStock(item.product, item.quantity);
        });
    }

    order.orderStatus = req.body.status;
    if (req.body.status === 'Delivered') {
        order.deliveredAt = Date.now();
    }

    await order.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
    });
});

async function updateStock(id, quantity) {
    const product = await Product.findById(id);
    product.stock -= quantity;
    await product.save({ validateBeforeSave: false });
}

exports.deleteOrder = asyncErrorHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler('Order Not Found', 404));
    }

    await order.remove();

    res.status(200).json({
        success: true,
    });
});
