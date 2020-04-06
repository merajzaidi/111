const express = require("express");
const router = express.Router();

//load error handler
const { catchErrors } = require("../../../config/errorHandler");
//load controller file
const {
  sendOtp,
  verifyOtp,
  resendOtp,
  sendVerifyEmailLink,
  verifyEmail,
  register,
  profile,
  updateProfile,
  login,
  changePassword,
  forgot,
  reset
} = require("../../../controllers/user_controller");

//middlewares
const {
  multer
} = require("../../../middlewares/validators/imageUploadValidation");
const {
  validateBasicInfo,
  validateUpdateInfo,
  newPasswordValidation
} = require("../../../middlewares/validators/userValidation");
const { allAuth } = require("../../../middlewares/auth");

// send otp
router.post("/send-otp", allAuth, catchErrors(sendOtp));
// resend otp
router.post("/resend-otp", allAuth, catchErrors(resendOtp));
// verify otp
router.post("/verify-otp", allAuth, catchErrors(verifyOtp));
//send-verify-email-link
router.get("/verify-email", allAuth, catchErrors(sendVerifyEmailLink));
//verify-email
router.post("/verify-email", catchErrors(verifyEmail));
//register
router.post(
  "/register",
  multer.any(),
  validateBasicInfo,
  catchErrors(register)
);
//login
router.post("/login", catchErrors(login));
//change password
router.post(
  "/change-password",
  allAuth,
  newPasswordValidation,
  catchErrors(changePassword)
);
//forgot password - send reset link
router.post("/forgot", catchErrors(forgot));
// reset password
router.post("/reset", newPasswordValidation, catchErrors(reset));
//get customer profile
router.get("/profile", allAuth, catchErrors(profile));
//customer profile update
router.post(
  "/profile",
  allAuth,
  multer.any(),
  validateUpdateInfo,
  catchErrors(updateProfile)
);

//export router
module.exports = router;
