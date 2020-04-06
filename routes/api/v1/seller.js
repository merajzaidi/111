const express = require("express");
const router = express.Router();

//load error handler
const { catchErrors } = require("../../../config/errorHandler");
//load controller file
const {
  stores,
  viewStore,
  addStore,
  updateStore,
  deleteStore,
  ordersOrEnquiries,
  orderOrEnquiryDetails,
  respondCustomer,
  statusUpdate,
  replacementAccept,
  replacementDecline,
  payments,
  dashboard
} = require("../../../controllers/seller_controller");

//load validators
const {
  validateAddStore,
  validateSellerResponse
} = require("../../../middlewares/validators/sellerValidations");
//load auth
const { sellerAuth } = require("../../../middlewares/auth");

//view all stores
router.get("/store/all", catchErrors(sellerAuth), catchErrors(stores));
// add store
router.post(
  "/store/add",
  catchErrors(sellerAuth),
  validateAddStore,
  catchErrors(addStore)
);
//update store
router.post(
  "/store/update/:id",
  catchErrors(sellerAuth),
  validateAddStore,
  catchErrors(updateStore)
);
// delete store
router.get(
  "/store/delete/:id",
  catchErrors(sellerAuth),
  catchErrors(deleteStore)
);
//view store
router.get("/store/:id", catchErrors(sellerAuth), catchErrors(viewStore));
//order history
router.post(
  "/orders/history",
  catchErrors(sellerAuth),
  catchErrors(ordersOrEnquiries)
);
//order status update
router.post(
  "/order/update/:id",
  catchErrors(sellerAuth),
  catchErrors(statusUpdate)
);
//order details
router.get(
  "/orders/:id",
  catchErrors(sellerAuth),
  catchErrors(orderOrEnquiryDetails)
);
//respond to query
router.post(
  "/enquiries/:id",
  catchErrors(sellerAuth),
  validateSellerResponse,
  catchErrors(respondCustomer)
);
// accept replacement and create new order
router.get(
  "/orders/replacement/accept/:id",
  catchErrors(sellerAuth),
  catchErrors(replacementAccept)
);
// decline replacement, send mail to admin
router.post(
  "/orders/replacement/reject/:id",
  catchErrors(sellerAuth),
  catchErrors(replacementDecline)
);
// know your payments
router.post("/payments", catchErrors(sellerAuth), catchErrors(payments));
//dashboard
router.get("/dashboard", catchErrors(sellerAuth), catchErrors(dashboard));

//export router
module.exports = router;
