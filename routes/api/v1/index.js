const express = require("express");
const router = express.Router();

//load error handler
const { catchErrors } = require("../../../config/errorHandler");
//load controller file
const { index } = require("../../../controllers/index_controller");

//index route
router.get("/", index);

//export router
module.exports = router;
