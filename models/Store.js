const mongoose = require("mongoose");

const StoreSchema = new mongoose.Schema(
  {
    forSeller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    tshirtType: { type: Array },
    fabric: { type: Array },
    phone: { type: String },
    location: { type: String },
    state: { type: String, required: true },
    approved: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = Store = mongoose.model("Store", StoreSchema);
