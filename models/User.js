const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: {
      first: { type: String, required: true },
      last: { type: String, required: true }
    },
    orgName: { type: String },
    contact: { type: String },
    address: {
      fullAddress: { type: String },
      city: { type: String, default: "" },
      state: { type: String },
      pincode: { type: Number }
    },
    password: { type: String },
    resetPwd: {
      token: { type: String },
      expiresIn: { type: Date }
    },
    img: { type: String, default: "" },
    role: { type: String, required: true }, // [customer, seller, admin]
    isDefaulter: { type: Boolean, default: false },
    isVerified: {
      email: { type: Boolean, default: false },
      contact: { type: Boolean, default: false }
    },
    verifyEmail: {
      token: { type: String },
      expiresIn: { type: Date }
    },
    quality: {
      avgRating: { type: Number },
      totalReviews: { type: Number }
    }
  },
  { timestamps: true }
);

UserSchema.methods.generateAuthToken = function() {
  const token = jwt.sign(
    {
      id: this._id,
      name: this.name,
      role: this.role,
      email: this.email,
      isDefaulter: this.isDefaulter
    },
    process.env.JWT_PRIVATE_KEY
  );
  return token;
};

module.exports = User = mongoose.model("User", UserSchema);
