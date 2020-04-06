const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    payments: {
        amount: { type: Number },
        seller: {
            amount: { type: Number },
            status: { type: String }, // [paid, pending]
        },
        brokage: { type: Number },
        gateway: {
            status: { type: String }, // [paid, pending]
            orderId: { type: String },
            paymentId: { type: String },
            signature: { type: String }
        }
    },
},
    { timestamps: true }
);

module.exports = Payment = mongoose.model('Payment', PaymentSchema);
