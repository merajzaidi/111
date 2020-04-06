const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
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
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    review: { type: String }, // one review per order per customer
    rating: { type: Number } // out of 5
},
    { timestamps: true }
);

module.exports = Review = mongoose.model('Review', ReviewSchema);