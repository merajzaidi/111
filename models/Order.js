const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    item: {
      referenceImg: { type: String, required: true },
      type: { type: String, required: true },
      fabric: { type: String, required: true },
      quantity: { type: Number, required: true },
      color: { type: String, required: true },
      sizeDetails: {
        xs: { type: Number, default: 0 },
        s: { type: Number, default: 0 },
        m: { type: Number, default: 0 },
        l: { type: Number, default: 0 },
        xl: { type: Number, default: 0 },
        xxl: { type: Number, default: 0 }
      }
    },
    info: {
      rate: { type: Number },
      charges: { type: Number },
      amount: { type: Number },
      deliveryChg: { type: Number },
      expTime: { type: Number },
      subtot: { type: Number }
    },
    status: {
      current: { type: String, default: "requested" }, // [requested,responded,ordered, processing, shipped, delivered, cancelled,replacement,replacement-accepted,replacement-declined-seller,replacement-declined-admin]
      requested: {
        time: { type: String },
        comment: { type: String }
      },
      responded: {
        time: { type: String },
        comment: { type: String }
      },
      ordered: {
        time: { type: String },
        comment: { type: String }
      },
      processing: {
        time: { type: String },
        comment: { type: String }
      },
      shipped: {
        time: { type: String },
        comment: { type: String }
      },
      delivered: {
        time: { type: String },
        comment: { type: String }
      },
      cancelled: {
        time: { type: String },
        comment: { type: String },
        message: { type: String }
      },
      replacement: {
        time: { type: String },
        comment: { type: String },
        message: { type: String },
        quantity: { type: Number },
        status: { type: String }, // [requested, accepted, atAdmin, rejected]
        newOrderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Order"
        }
      }
    },
    type: { type: String, default: "enquiry" }, // [enquiry, order, replacement]
    payment: { type: String, default: "pending" }, // [pending, paid]
    // city: { type: String, required: true }
    state: { type: String, required: true }

  },
  { timestamps: true }
);

module.exports = Order = mongoose.model("Order", OrderSchema);
