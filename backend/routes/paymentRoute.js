const express = require('express');
const {
    createPaymentIntent,
    getPaymentStatus,
    getActivePaymentQr,
    updatePaymentQr,
    removePaymentQr,
} = require('../controllers/paymentController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

router.route('/payment/intent').post(createPaymentIntent);
router.route('/payment/status/:id').get(getPaymentStatus);
router.route('/payment/qr').get(getActivePaymentQr);
router.route('/admin/payment/qr')
    .get(isAuthenticatedUser, authorizeRoles('admin'), getActivePaymentQr)
    .put(isAuthenticatedUser, authorizeRoles('admin'), updatePaymentQr)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), removePaymentQr);

module.exports = router;
