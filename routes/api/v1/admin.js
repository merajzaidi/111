const express = require("express");
const router = express.Router();

//load error handler
const { catchErrors } = require("../../../config/errorHandler");

//load controller file
const {
  customers,
  customerDetails,
  settings,
  addSetting,
  deleteSetting,
  sellers,
  sellerDetails,
  sellerStores,
  markStore,
  ordersOrEnquiries,
  statusUpdate,
  orderOrEnquiryDetails,
  payments,
  replacementAccept,
  replacementDecline,
  markPayment,
  markDefaulter,
  generateOrgNames,
  generateUserCities,
  dashboard
} = require("../../../controllers/admin_controller");

//load validations
const {
  validateAddSettings
} = require("../../../middlewares/validators/adminValidations");
//load auth
const { adminAuth, allAuth } = require("../../../middlewares/auth");

//view customers list
router.post("/customers", catchErrors(adminAuth), catchErrors(customers));
//view customer details
router.get(
  "/customer/:id",
  catchErrors(adminAuth),
  catchErrors(customerDetails)
);
// view settings for stores
router.get("/settings", allAuth, catchErrors(settings));
// add a setting
router.post(
  "/settings",
  validateAddSettings,
  catchErrors(adminAuth),
  catchErrors(addSetting)
);
// delete a setting
router.post(
  "/settings/delete",
  catchErrors(adminAuth),
  catchErrors(deleteSetting)
);
//view seller list
router.post("/sellers", catchErrors(adminAuth), catchErrors(sellers));
//view seller details
router.get("/seller/:id", catchErrors(adminAuth), catchErrors(sellerDetails));
//view stores for a seller
router.get(
  "/seller/:id/stores",
  catchErrors(adminAuth),
  catchErrors(sellerStores)
);
//approve/disapprove a store
router.get("/store/:id", catchErrors(adminAuth), catchErrors(markStore));
//order history
router.post(
  "/orders/history",
  catchErrors(adminAuth),
  catchErrors(ordersOrEnquiries)
);
//update status if seller is unavailable
router.post(
  "/order/update/:id",
  catchErrors(adminAuth),
  catchErrors(statusUpdate)
);
//view order details
router.get(
  "/order/:id",
  catchErrors(adminAuth),
  catchErrors(orderOrEnquiryDetails)
);
// accept replacement and create new order
router.get(
  "/orders/replacement/accept/:id",
  catchErrors(adminAuth),
  catchErrors(replacementAccept)
);
// decline replacement, send mail to admin
router.post(
  "/orders/replacement/reject/:id",
  catchErrors(adminAuth),
  catchErrors(replacementDecline)
);
// payments
router.post("/payments", catchErrors(adminAuth), catchErrors(payments));
// mark/unmark seller payment
router.get("/payments/:id", catchErrors(adminAuth), catchErrors(markPayment));
//mark/unmark user as defaulter
router.get(
  "/defaulter/:id",
  catchErrors(adminAuth),
  catchErrors(markDefaulter)
);
//generate orgNames of all sellers/customers
router.get(
  "/generateOrgNames",
  catchErrors(adminAuth),
  catchErrors(generateOrgNames)
);
//get users cities
router.get("/generateUserCities/:role", catchErrors(generateUserCities));
//dashboard
router.get("/dashboard", catchErrors(adminAuth), catchErrors(dashboard));

//export router
module.exports = router;
