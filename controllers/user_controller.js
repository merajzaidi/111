const bcrypt = require("bcryptjs");
const axios = require("axios");
require("dotenv").config();

// send mail
const { sendMail } = require("../config/emailService");
// image uploader
const { uploader } = require("../config/imageUpload");

module.exports.sendOtp = async (req, res) => {
  let { mobile } = req.body;
  let user = await User.findById(req.user.id);
  if (user.isVerified.contact === true) {
    let token = user.generateAuthToken();
    res
      .status(200)
      .header("x-auth-token", token)
      .json({ message: "Already verified", user });
  } else {
    let response = await axios.post(
      `${process.env.MSG91_SENDOTP_URL}${mobile}`
    );
    if (response.data.type === "success") {
      res.status(200).json({ message: "OTP sent successfully." });
    } else {
      res.status(400).json({ message: "OTP not sent." });
    }
  }
};

module.exports.verifyOtp = async (req, res) => {
  let { mobile, otp } = req.body;
  let user = await User.findById(req.user.id);
  let response = await axios.post(
    `${process.env.MSG91_VERIFYOTP_URL}${mobile}&otp=${otp}`
  );
  if (response.data.type === "success") {
    //mark in db that user is verified
    user.isVerified.contact = true;
    await user.save();
    //whenever user is schema is update new token should be generated for sync with frontend
    const token = user.generateAuthToken();
    res
      .status(200)
      .header("x-auth-token", token)
      .json({ message: "OTP verified successfully.", user });
  } else {
    res.status(400).json({ message: "OTP not verified" });
  }
};

module.exports.resendOtp = async (req, res) => {
  let { mobile } = req.body;

  let response = await axios.post(
    `${process.env.MSG91_RESENDOTP_URL}${mobile}`
  );
  if (response.data.type === "success") {
    res.status(200).json({ message: "OTP re-sent successfully." });
  } else {
    res.status(400).json({ message: "OTP not sent" });
  }
};

module.exports.sendVerifyEmailLink = async (req, res) => {
  let { email } = req.user;
  let user = await User.findOne({ email });
  if (user) {
    if (user.isVerified.email === true) {
      let token = user.generateAuthToken();
      res
        .status(200)
        .header("x-auth-token", token)
        .json({ message: "Already verified", user });
    } else {
      let emailToken = `${user._id}${Date.now()}`;
      user.verifyEmail.token = emailToken;
      user.verifyEmail.expiresIn = Date.now() + 3600000;
      await user.save();
      let token = user.generateAuthToken();
      // send email to user
      let order = {},
        extValues = {},
        customTo = user.email,
        customStatus = "verify-email-link";
      extValues.userName = user.orgName;
      extValues.verifyEmailLink = `https://www.angrybaaz.com/verifyEmail/${user.email}/${emailToken}`;
      await sendMail(order, extValues, customStatus, customTo);
      res
        .status(200)
        .header("x-auth-token", token)
        .json({ message: "Link sent to your mail successfully", user });
    }
  } else {
    res.status(404).json({ message: "Email not registered." });
  }
};

module.exports.verifyEmail = async (req, res) => {
  let { emailToken } = req.body;
  let user = await User.findOne({
    "verifyEmail.token": emailToken,
    "verifyEmail.expiresIn": { $gte: Date.now() }
  });
  if (user) {
    if (user.isVerified.email === true) {
      let token = user.generateAuthToken();
      res
        .status(200)
        .header("x-auth-token", token)
        .json({ message: "Already verified", user });
    } else {
      user.isVerified.email = true;
      user.verifyEmail.token = undefined;
      user.verifyEmail.expiresIn = undefined;
      await user.save();
      let token = user.generateAuthToken();
      res
        .status(200)
        .header("x-auth-token", token)
        .json({ message: "Email Verified !", user });
    }
  } else {
    res.status(400).json({ message: "Invalid Request or Link Expired!!" });
  }
};

module.exports.register = async (req, res) => {
  const {
    email,
    fname,
    lname,
    orgName,
    contact,
    fullAddress,
    city,
    state,
    pincode,
    role,
    password
  } = req.body;

  let user = await User.findOne({
    $or: [{ email }, { contact }, { orgName }]
  });
  if (user) {
    let response = "";
    if (user.email === email) {
      response = "Email already in use";
    } else if (user.contact === contact) {
      response = "Phone number already in use";
    } else if (user.orgName === orgName) {
      response =
        "Organisation Name already registered. Try putting hypen with random number. eg: name-2";
    }
    res.status(403).json({
      message: response,
      error: true
    });
  } else {
    let newUser = new User({
      email: email.toLowerCase(),
      password,
      name: {
        first: String(fname).trim(),
        last: String(lname).trim()
      },
      orgName: String(orgName).trim(),
      contact: String(contact).trim(),
      address: {
        fullAddress,
        city,
        state,
        pincode: String(pincode).trim()
      },
      role: String(role).trim()
    });
    if (role === "seller") {
      //below values should be initialised and seen for sellers only
      newUser.quality.avgRating = 0;
      newUser.quality.totalReviews = 0;
    }

    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(newUser.password, salt);
    await newUser.save();

    const token = newUser.generateAuthToken();
    res
      .status(200)
      .header("x-auth-token", token)
      .json({ user: newUser, message: "success" });
  }
};

module.exports.login = async (req, res) => {
  let { username, password } = req.body;
  let user = await User.findOne({
    $or: [
      { email: { $regex: `^${username}$`, $options: "i" } },
      { contact: username }
    ]
  });
  if (!user)
    return res.status(406).json({ message: "user not registered", user: null });

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword)
    return res.status(406).json({ message: "invalid password", user: null });

  const token = user.generateAuthToken();
  res
    .status(200)
    .header("x-auth-token", token)
    .json({ user, message: "success" });
};

module.exports.changePassword = async (req, res) => {
  let { oldPwd, newPwd } = req.body;
  let user = await User.findById(req.user.id);
  let pwdMatched = await bcrypt.compare(oldPwd, user.password);
  if (pwdMatched) {
    if (oldPwd === newPwd) {
      res.status(400).json({
        message: "New Password can't be same as old password."
      });
    } else {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPwd, salt);
      await user.save();
      // send email to user
      let order = {},
        extValues = {},
        customTo = user.email,
        customStatus = "password-changed";
      extValues.userName = user.orgName;
      await sendMail(order, extValues, customStatus, customTo);
      res.status(200).json({ message: "success" });
    }
  } else {
    res.status(400).json({ message: "Old Password not matched!!" });
  }
};

module.exports.forgot = async (req, res) => {
  let { email } = req.body;
  let user = await User.findOne({ email });
  if (user) {
    let pwdToken = `${user._id}${Date.now()}`;
    user.resetPwd.token = pwdToken;
    user.resetPwd.expiresIn = Date.now() + 3600000;
    await user.save();
    let token = user.generateAuthToken();
    // send email to user
    let order = {},
      extValues = {},
      customTo = user.email,
      customStatus = "reset-link";
    extValues.userName = user.orgName;
    extValues.resetLink = `https://www.angrybaaz.com/reset/${user.email}/${pwdToken}`;
    await sendMail(order, extValues, customStatus, customTo);
    res
      .status(200)
      .header("x-auth-token", token)
      .json({ message: "success" });
  } else {
    res.status(404).json({ message: "Email not registered." });
  }
};

module.exports.reset = async (req, res) => {
  let { newPwd, pwdToken } = req.body;
  let user = await User.findOne({
    "resetPwd.token": pwdToken,
    "resetPwd.expiresIn": { $gte: Date.now() }
  });
  if (user) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPwd, salt);
    user.resetPwd.token = undefined;
    user.resetPwd.expiresIn = undefined;
    await user.save();
    let token = user.generateAuthToken();
    // send email to user
    let order = {},
      extValues = {},
      customTo = user.email,
      customStatus = "reset-success";
    extValues.userName = user.orgName;
    await sendMail(order, extValues, customStatus, customTo);
    res
      .status(200)
      .header("x-auth-token", token)
      .json({ message: "success", user });
  } else {
    res.status(400).json({ message: "Invalid Token or Token Expired!!" });
  }
};

module.exports.profile = async (req, res) => {
  let user = await User.findById(req.user.id);
  let token = user.generateAuthToken();
  if (user) {
    res
      .status(200)
      .header("x-auth-token", token)
      .json({ message: "success", user });
  } else {
    res.status(404).json({ message: "No user found." });
  }
};

module.exports.updateProfile = async (req, res) => {
  const { fname, lname, orgName, fullAddress, city, state, pincode } = req.body;

  let user = await User.findOne({
    $and: [{ $or: [{ orgName }] }, { _id: { $ne: req.user.id } }]
  });
  if (user) {
    let response = "";
    if (user.orgName === orgName) {
      response =
        "Organisation Name already registered. Try putting hypen with random number. eg: name-2";
    }
    res.status(403).json({
      message: response,
      error: true
    });
  } else {
    let newValues = {
      name: {
        first: String(fname).trim(),
        last: String(lname).trim()
      },
      orgName: String(orgName).trim(),
      address: {
        fullAddress,
        city,
        state,
        pincode: String(pincode).trim()
      }
    };
    //if user has updated profile pic
    if (req.file) {
      let imageType = "profile-uploads";
      fileName = `${req.user.email}-${req.user.role}`;
      let uploadURL = await uploader(req.file, imageType, fileName);
      newValues["img"] = uploadURL["result"][0];
    }

    let updatedUser = await User.findByIdAndUpdate(req.user.id, newValues, {
      new: true
    });

    const token = updatedUser.generateAuthToken();
    res
      .status(200)
      .header("x-auth-token", token)
      .json({ message: "success", updatedUser });
  }
};
