const express = require("express");
const router = express.Router();

//load error handler
const { catchErrors } = require("../../../config/errorHandler");
//load controller file
const {
  getStoreSettingsByCity,
  getSellerBySettings,
  checkNoAuthEnquiry,
  addAddress,
  createEnquiryForSellers,
  ordersOrEnquiries,
  orderOrEnquiryDetails,
  createRzpOrder,
  paymentSuccess,
  enquiryCancelling,
  addReview,
  viewOrderReview,
  requestReplacement,
  dashboard
} = require("../../../controllers/customer_controller");

//middlewares
const {
  multer,
  fileFilter
} = require("../../../middlewares/validators/imageUploadValidation");
//load validators
const {
  validateNoAuthEnquiryInfo,
  validateAddress,
  validateEnquiryInfo,
  validateReviews,
  validateReplacementInfo
} = require("../../../middlewares/validators/customerValidations");
//load auth
const { allAuth, customerAuth } = require("../../../middlewares/auth");

//get sellers by settings
router.post("/enquire/seller", catchErrors(getSellerBySettings));
//get settings by city
router.get("/enquire/:state", catchErrors(getStoreSettingsByCity));
//check no auth enquiry
router.post(
  "/enquiry/check",
  validateNoAuthEnquiryInfo,
  catchErrors(checkNoAuthEnquiry)
);
//add delivery address
router.post(
  "/enquiry/address",
  catchErrors(customerAuth),
  validateAddress,
  catchErrors(addAddress)
);
//submit enquiry
router.post(
  "/enquire",
  catchErrors(customerAuth),
  multer.any(),
  validateEnquiryInfo,
  fileFilter,
  catchErrors(createEnquiryForSellers)
);
//order history
router.post(
  "/orders/history",
  catchErrors(customerAuth),
  catchErrors(ordersOrEnquiries)
);
//order details
router.get(
  "/orders/:id",
  catchErrors(customerAuth),
  catchErrors(orderOrEnquiryDetails)
);
// payment success redirect
router.post("/orders/payments/success", catchErrors(paymentSuccess));
// create rzp order
router.post("/orders/payments/:id", catchErrors(createRzpOrder));
//enquiry cancel
router.post(
  "/enquiry/cancel/:id",
  catchErrors(customerAuth),
  catchErrors(enquiryCancelling)
);
// review order
router.post(
  "/orders/review/:id",
  catchErrors(customerAuth),
  validateReviews,
  catchErrors(addReview)
);
//view order reviews
router.get("/reviews/order/:id", allAuth, catchErrors(viewOrderReview));
//replacement request
router.post(
  "/orders/replacement/:id",
  multer.none(),
  validateReplacementInfo,
  catchErrors(customerAuth),
  catchErrors(requestReplacement)
);
//customer dashboard
router.get("/dashboard", catchErrors(customerAuth), catchErrors(dashboard));
//export router
module.exports = router;
