const mongoose = require('mongoose');

const paymentSettingsSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: 'active',
    },
    qrImage: {
        url: {
            type: String,
            required: true,
        },
        publicId: {
            type: String,
        },
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('PaymentSettings', paymentSettingsSchema);
