//send mail
const { sendMail } = require("../config/emailService");
//image uploader
const { uploader } = require("../config/imageUpload");
//rzp order creater
const { createOrder } = require("../config/paymentGateway");
require("dotenv").config();

module.exports.getStoreSettingsByCity = async (req, res) => {
  //get all settings from all stores for the provided state
  const stores = await Store.find({ state: req.params.state }).populate(
    "forSeller"
  );
  //initialise setting types to send
  let tshirtTypes = [],
    fabrics = [];

  if (stores.length !== 0) {
    //map on each store
    stores.map(store => {
      if (!store.forSeller.isDefaulter && store.approved) {
        //map on all tshirtTypes that store sells
        store.tshirtType.map(type => {
          // if that tshirt type is not present then add it
          if (tshirtTypes.indexOf(type) === -1) {
            tshirtTypes.push(type);
          }
        });

        //map on all fabrics that store sells
        store.fabric.map(type => {
          // if that fabric type is not present then add it
          if (fabrics.indexOf(type) === -1) {
            fabrics.push(type);
          }
        });
      }
    });
  }
  res.status(200).json({ message: "success", tshirtTypes, fabrics });
};

module.exports.getSellerBySettings = async (req, res) => {
  const { state, tshirtType, fabric } = req.body;
  //find all stores for the setting provided within that city
  const Stores = await Store.find({ state }).populate("forSeller");
  //initialise matching stores to send
  let stores = [];
  Stores.map(store => {
    if (
      store.tshirtType.indexOf(tshirtType) !== -1 &&
      store.fabric.indexOf(fabric) !== -1 &&
      !store.forSeller.isDefaulter &&
      store.approved
    ) {
      //if that store is approved and seller of that store is not a defaulter and the settings are not being repeated then push
      stores.push(store);
    }
  });

  res.status(200).json({ message: "success", stores });
};

module.exports.checkNoAuthEnquiry = async (req, res) => {
  //comes here only when validations are true for this route
  res.status(200).json({ message: "success" });
};

module.exports.addAddress = async (req, res) => {
  const { fullAddress, city, state, pincode } = req.body;

  const customer = await User.findById(req.user.id);

  if (customer) {
    customer.address.fullAddress = fullAddress;
    customer.address.city = city;
    customer.address.state = state;
    customer.address.pincode = pincode;
    let user = await customer.save();
    let token = user.generateAuthToken();
    res
      .status(200)
      .header("x-auth-token", token)
      .json({ message: "success", user });
  } else {
    res.status(403).json({ message: "No User found" });
  }
};

module.exports.createEnquiryForSellers = async (req, res) => {
  const {
    sellerIDs,
    quantity,
    sizeDetails,
    color,
    type,
    fabric,
    state
  } = req.body;

  //customer can send enquiry to no more than five sellers
  if (sellerIDs.length > 5) {
    res.status(406).json({ message: "Select no more than 5 seller at once" });
  } else {
    let imageType = "customer-uploads",
      randomStr = Math.random()
        .toString(36)
        .substring(2);
    fileName = `${req.user.name.first}-${randomStr}`;
    //image upload to firebase
    let uploadURL = await uploader(req.file, imageType, fileName);

    if (uploadURL["message"] === "success") {
      let emailSent = [];
      for (let i = 0; i < sellerIDs.length; i++) {
        let newEnquiry = {
          customer: req.user.id,
          seller: sellerIDs[i],
          item: {
            referenceImg: uploadURL["result"][0],
            type,
            fabric,
            color,
            quantity,
            sizeDetails
          },
          state
        };
        let enquiry = await Order.create(newEnquiry);

        enquiry.status.requested.time = Date(Date.now());
        enquiry.status.requested.comment = "Order Request sent to seller";
        await enquiry.save();
        //get seller details for email
        let enqDet = await Order.findById(enquiry._id).populate("seller");

        //send email to seller
        let extValues = { mailTo: "seller" };
        let response = await sendMail(enqDet, extValues);
        emailSent.push(response);
        if (emailSent.length === sellerIDs.length) {
          res.status(200).json({ message: "success" });
        }
      }
    } else {
      res.status(400).json({ message: "Image upload failed" });
    }
  }
};

module.exports.ordersOrEnquiries = async (req, res) => {
  //sortType: asc/desc, example for
  //filterObject:{type:'enquiry/order' ',status.current: 'ordered'}
  let { pageNo, perPage, sortType, filterObject } = req.body;
  let overallOrders = 0,
    resultOrders = [],
    totalPages = 0;
  if (
    pageNo === undefined ||
    perPage === undefined ||
    Number(pageNo) === 0 ||
    Number(perPage) === 0 ||
    sortType === undefined
  ) {
    return res.status(400).json({ message: "Wrong page parameters provided" });
  } else {
    if (filterObject === undefined) {
      //overall orders with these queries
      overallOrders = await Order.countDocuments({ customer: req.user.id });
      resultOrders = await Order.find({ customer: req.user.id })
        .sort({ createdAt: sortType })
        .skip(Number(perPage) * (Number(pageNo) - 1))
        .limit(Number(perPage))
        .populate("seller")
        .populate("customer");

      totalPages = Math.ceil(overallOrders / Number(perPage));
    } else {
      let filterOptionsQuery = {
        customer: req.user.id
      };
      Object.keys(filterObject).map(key => {
        if (filterObject[key] !== "") {
          filterOptionsQuery[key] = filterObject[key];
        }
      });
      // overall orders with these queries
      overallOrders = await Order.countDocuments(filterOptionsQuery);
      resultOrders = await Order.find(filterOptionsQuery)
        .sort({ createdAt: sortType })
        .skip(Number(perPage) * (Number(pageNo) - 1))
        .limit(Number(perPage))
        .populate("seller")
        .populate("customer");

      //calcualating totalPages to display for frontend
      totalPages = Math.ceil(overallOrders / Number(perPage));
    }
  }
  res.status(200).json({
    message: "success",
    resultOrders,
    overallOrders,
    totalPages
  });
};

module.exports.orderOrEnquiryDetails = async (req, res) => {
  let orderOrEnquiry = await Order.findOne({
    _id: req.params.id,
    customer: req.user.id
  })
    .populate("customer")
    .populate("seller");
  let payment = await Payment.findOne({ order: orderOrEnquiry._id });
  if (orderOrEnquiry) {
    res.status(200).json({ message: "success", orderOrEnquiry, payment });
  } else {
    res.status(400).json({ message: "No order found" });
  }
};

module.exports.createRzpOrder = async (req, res) => {
  let orders = await Order.findById(req.params.id);
  let order = await createOrder(
    Math.round((orders.info.amount / 2) * 100) / 100,
    req.params.id
  );
  let payment = await Payment.findOne({ order: orders._id });
  if (!payment) {
    let newPayment = {
      order: orders._id,
      seller: orders.seller,
      payments: {
        amount: orders.info.amount,
        seller: {
          amount: Math.round(0.95 * orders.info.subtot * 100) / 100,
          status: "pending"
        },
        brokage: Math.round(0.05 * orders.info.subtot * 100) / 100,
        gateway: {
          status: "pending",
          orderId: order.id
        }
      }
    };
    await Payment.create(newPayment);
  }
  res
    .status(200)
    .json({ message: "success", order, key: process.env.RZP_KEY_ID });
};

module.exports.paymentSuccess = async (req, res) => {
  let { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

  if (razorpay_payment_id) {
    let payment = await Payment.findOne({
      "payments.gateway.orderId": razorpay_order_id
    });
    let order = await Order.findById(payment.order)
      .populate("seller")
      .populate("customer");
    // payment details updation
    payment.payments.gateway.status = "paid";
    payment.payments.gateway.paymentId = razorpay_payment_id;
    payment.payments.gateway.signature = razorpay_signature;
    order.payment = "paid";
    // order booking
    order.status.current = "ordered";
    order.type = "order";
    order.status.ordered.time = Date(Date.now());
    order.status.ordered.comment = "Order successfully placed by customer";
    await payment.save();
    await order.save();
    let status = ["payment-success-customer", "payment-success-seller"],
      extValues = [
        { mailTo: "customer", paymentId: razorpay_payment_id },
        { mailTo: "seller" }
      ];
    let sendMailPromises = [];
    // send email to customer
    sendMailPromises.push(sendMail(order, extValues[0], status[0]));
    // send email to seller
    sendMailPromises.push(sendMail(order, extValues[1], status[1]));
    //wait for these mails to send
    await Promise.all(sendMailPromises);
    res.status(200).json({ message: "success" });
  } else {
    res.status(500).json({ message: "Payment failed!!" });
  }
};

module.exports.enquiryCancelling = async (req, res) => {
  let { cancelReason } = req.body;

  let enquiry = await Order.findOne({
    customer: req.user.id,
    _id: req.params.id,
    type: "enquiry"
  })
    .populate("customer")
    .populate("seller");
  if (enquiry) {
    enquiry.status.current = "cancelled";
    enquiry.status.cancelled.time = Date(Date.now());
    enquiry.status.cancelled.comment = `Your enquiry has been cancelled.`;
    enquiry.status.cancelled.message = cancelReason;
    await enquiry.save();
    let extValues = { mailTo: "seller", reason: cancelReason };
    // send email to seller.
    await sendMail(enquiry, extValues);
    res.status(200).json({ message: "success", orderOrEnquiry: enquiry });
  } else {
    res.status(404).json({
      message: `Can't cancel enquiry!`
    });
  }
};

module.exports.addReview = async (req, res) => {
  let { review, rating } = req.body;
  //find order to review
  let order = await Order.findOne({
    _id: req.params.id,
    customer: req.user.id
  }).populate("customer");
  //find existing reviews
  let reviews = await Review.find({
    customer: req.user.id,
    order: order._id
  });
  if (reviews.length === 0 && order.status.current === "delivered") {
    let seller = await User.findById(order.seller);
    let newReview = {
      customer: req.user.id,
      order: req.params.id,
      seller: order.seller,
      review,
      rating
    };
    await Review.create(newReview);
    //updated seller documents with new reviews
    let sellerReviews = await Review.find({ seller: order.seller });
    let totalReviews = 0,
      ratingSum = 0,
      totRatings = 0;
    sellerReviews.map(review => {
      if (review.review !== undefined) {
        totalReviews++;
      }
      if (review.rating !== undefined) {
        ratingSum += review.rating;
        totRatings += 1;
      }
    });
    let avgRating = Math.round((ratingSum / totRatings) * 100) / 100;
    seller.quality.avgRating = avgRating;
    seller.quality.totalReviews = totalReviews;
    await seller.save();
    res.status(200).json({ message: "success", orderOrEnquiry: order });
  } else {
    res.status(400).json({
      message: "Review not allowed or already reviewed!!"
    });
  }
};

module.exports.viewOrderReview = async (req, res) => {
  const reviews = await Review.find({ order: req.params.id }).populate(
    "customer"
  );
  if (reviews.length !== 0) {
    res.status(200).json({ message: "success", reviews });
  } else {
    res.status(404).json({ message: "No reviews found" });
  }
};

module.exports.requestReplacement = async (req, res) => {
  let { quantity, message } = req.body;

  let order = await Order.findOne({
    _id: req.params.id,
    customer: req.user.id,
    type: "order"
  })
    .populate("seller")
    .populate("customer");

  if (order && order.status.current === "delivered") {
    if (quantity > order.item.quantity) {
      res.status(406).json({
        message:
          "Replacement quantity should not be greater than order quantity"
      });
    } else {
      order.status.current = "replacement";
      order.status.replacement.time = Date(Date.now());
      order.status.replacement.comment =
        "Your replacement request has been sent to seller";
      order.status.replacement.message = message;
      order.status.replacement.status = "requested";
      order.status.replacement.quantity = quantity;
      order.type = "replacement";
      // send mail to seller
      let extValues = [{ mailTo: "seller" }, { mailTo: "customer" }],
        customStatus = "replacement-seller";

      let Promises = [];
      Promises.push(order.save());
      Promises.push(sendMail(order, extValues[0], customStatus));
      Promises.push(sendMail(order, extValues[1]));
      await Promise.all(Promises);
      res.status(200).json({ message: "success", orderOrEnquiry: order });
    }
  } else {
    res.status(404).json({
      message: "Cannot request replacement for this order!!"
    });
  }
};

module.exports.dashboard = async (req, res) => {
  //can be improved on further dicussions
  let stats = {
    enquiries: 0,
    orders: 0,
    reviews: 0,
    lastOrderOrEnquiry: [],
    lastReview: []
  };

  stats.enquiries = await Order.countDocuments({
    customer: req.user.id,
    type: "enquiry"
  });
  stats.orders = await Order.countDocuments({
    customer: req.user.id,
    type: "order"
  });
  stats.lastOrderOrEnquiry = await Order.find({ customer: req.user.id })
    .sort({ createdAt: "desc" })
    .limit(3)
    .populate("customer")
    .populate("seller");

  stats.reviews = await Review.countDocuments({ customer: req.user.id });
  stats.lastReview = await Review.find({ customer: req.user.id })
    .sort({ createdAt: "desc" })
    .limit(3)
    .populate("customer")
    .populate("seller")
    .populate("order");

  res.status(200).json({ message: "success", stats });
};
