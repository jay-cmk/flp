const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    shippingInfo: {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            default: ''
        },
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true,
            default: 'IN'
        },
        pincode: {
            type: Number,
            required: true
        },
        phoneNo: {
            type: Number,
            required: true
        },
    },
    orderItems: [{
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        image: {
            type: String,
            required: true
        },
        product: {
            type: mongoose.Schema.ObjectId,
            ref: 'Product',
            required: true
        },
    }],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        default: null
    },
    paymentInfo: {
        id: {
            type: String,
            default: ''
        },
        status: {
            type: String,
            enum: ['PENDING_PAYMENT', 'PAID', 'PAYMENT_FAILED', 'CANCELLED'],
            default: 'PENDING_PAYMENT'
        },
        method: {
            type: String,
            default: 'PHONEPE'
        },
    },
    checkoutKey: {
        type: String,
        unique: true,
        sparse: true,
    },
    paidAt: {
        type: Date,
        default: null
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0
    },
    orderStatus: {
        type: String,
        required: true,
        default: 'Pending Payment',
    },
    deliveredAt: Date,
    shippedAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Order', orderSchema);
