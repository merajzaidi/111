const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const { notFoundError, sendErrors } = require("./config/errorHandler");
const app = express();

const cors = require("cors");
require("dotenv").config();
require("./config/dbconnection");

app.use(
  cors({
    exposedHeaders: "x-auth-token"
  })
);
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 1000000
  })
);
app.use(
  bodyParser.json({ limit: "50mb", extended: true, parameterLimit: 1000000 })
);

//load Schemas
const User = require("./models/User");
const Order = require("./models/Order");
const Payment = require("./models/Payment");
const Setting = require("./models/Setting");
const Store = require("./models/Store");
const Review = require("./models/Review");

//Routes
app.use("/api/v1/", require("./routes/api/v1/index"));
app.use("/api/v1/users", require("./routes/api/v1/users"));
app.use("/api/v1/customer", require("./routes/api/v1/customer"));
app.use("/api/v1/seller", require("./routes/api/v1/seller"));
app.use("/api/v1/admin", require("./routes/api/v1/admin"));

//Error Handlers
app.use(notFoundError);
app.use(sendErrors);

//Setting up server
startServer = async () => {
  try {
    await app.listen(process.env.PORT);
    console.log(`Server is up and running on Port ${process.env.PORT}`);
  } catch (err) {
    console.log("Error in running server.");
  }
};
startServer();
