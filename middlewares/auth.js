const jwt = require("jsonwebtoken");
require("dotenv").config();

const checkAuthenticity = async id => {
  const user = await User.findById(id);
  return {
    isDefaulter: user.isDefaulter,
    emailVerified: user.isVerified.email,
    contactVerified: user.isVerified.contact
  };
};

module.exports.allAuth = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token)
    return res
      .status(401)
      .json({ message: "Access denied. No Token provided" });

  const decodedPayload = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
  req.user = decodedPayload;
  return next();
};

module.exports.customerAuth = async (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token)
    return res
      .status(401)
      .json({ message: "Access denied. No Token provided" });

  const decodedPayload = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
  let { isDefaulter, emailVerified, contactVerified } = await checkAuthenticity(
    decodedPayload.id
  );
  if (decodedPayload.role === "customer") {
    if (isDefaulter) {
      return res.status(401).json({
        message:
          "You can't perform this action as your account has been marked Defaulter by Admin."
      });
    } else if (!emailVerified) {
      return res.status(401).json({
        message:
          "Your email has not been verified yet!! Please verify your email to proceed."
      });
    } else if (!contactVerified) {
      return res.status(401).json({
        message:
          "Your mobile number has not been verified yet!! Please verify your mobile number to proceed."
      });
    } else {
      req.user = decodedPayload;
      return next();
    }
  } else {
    return res
      .status(401)
      .json({ message: "Access denied. not a valid customer token" });
  }
};

module.exports.sellerAuth = async (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token)
    return res
      .status(401)
      .json({ message: "Access denied. No Token provided" });

  const decodedPayload = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
  let { isDefaulter, emailVerified, contactVerified } = await checkAuthenticity(
    decodedPayload.id
  );
  if (decodedPayload.role === "seller") {
    if (isDefaulter) {
      return res.status(401).json({
        message:
          "You can't perform this action as your account has been marked Defaulter by Admin."
      });
    } else if (!emailVerified) {
      return res.status(401).json({
        message:
          "Your email has not been verified yet!! Please verify your email to proceed."
      });
    } else if (!contactVerified) {
      return res.status(401).json({
        message:
          "Your mobile number has not been verified yet!! Please verify your mobile number to proceed."
      });
    } else {
      req.user = decodedPayload;
      return next();
    }
  } else {
    return res
      .status(401)
      .json({ message: "Access denied. not a valid customer token" });
  }
};

module.exports.adminAuth = async (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token)
    return res
      .status(401)
      .json({ message: "Access denied. No Token provided" });

  const decodedPayload = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
  if (decodedPayload.role === "admin") {
    req.user = decodedPayload;
    return next();
  } else {
    return res
      .status(401)
      .json({ message: "Access denied. not a valid admin token" });
  }
};
