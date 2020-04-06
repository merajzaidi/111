// send mail
const { sendMail } = require("../config/emailService");

module.exports.stores = async (req, res) => {
  let stores = await Store.find({ forSeller: req.user.id });
  if (stores.length !== 0) {
    res.status(200).json({ message: "success", stores });
  } else {
    res.status(404).json({ message: "No stores found." });
  }
};

module.exports.viewStore = async (req, res) => {
  let store = await Store.findById(req.params.id);
  if (store && store.forSeller == req.user.id) {
    res.status(200).json({ message: "success", store });
  } else {
    res.status(404).json({ message: "invalid store" });
  }
};

module.exports.addStore = async (req, res) => {
  let { tshirtType, fabric, state, phone, location } = req.body;

  let store = await Store.findOne({ forSeller: req.user.id, state });
  if (store) {
    res.status(400).json({
      message: "A seller cant have 2 stores in a city"
    });
  } else {
    let newStore = {
      tshirtType,
      fabric,
      state,
      location,
      phone,
      forSeller: req.user.id
    };
    await Store.create(newStore);
    res.status(200).json({ message: "success" });
  }
};

module.exports.updateStore = async (req, res) => {
  let store = await Store.findByIdAndUpdate(req.params.id, req.body);
  if (store) {
    res.status(200).json({ message: "success" });
  } else {
    res.status(404).json({ message: "invalid store" });
  }
};

module.exports.deleteStore = async (req, res) => {
  let result = await Store.deleteOne({
    _id: req.params.id,
    forSeller: req.user.id
  });
  if (result.deletedCount !== 0) {
    res.status(200).json({ message: "success" });
  } else {
    res.status(400).json({ message: "Cannot delete this store" });
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
      overallOrders = await Order.countDocuments({ seller: req.user.id });
      resultOrders = await Order.find({ seller: req.user.id })
        .sort({ createdAt: sortType })
        .skip(Number(perPage) * (Number(pageNo) - 1))
        .limit(Number(perPage))
        .populate("seller")
        .populate("customer");

      totalPages = Math.ceil(overallOrders / Number(perPage));
    } else {
      let filterOptionsQuery = {
        seller: req.user.id
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
    seller: req.user.id
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

module.exports.respondCustomer = async (req, res) => {
  let { rate, deliveryChg, expTime } = req.body;
  let order = await Order.findOne({
    _id: req.params.id,
    seller: req.user.id
  })
    .populate("customer")
    .populate("seller");
  if (order.status.current === "requested") {
    let subtot =
      Math.round(Number(rate) * Number(order.item.quantity) * 100) / 100 +
      Math.round(Number(deliveryChg) * 100) / 100;
    let charges = Math.round(0.0233 * subtot * 100) / 100;
    let amount = Math.round((subtot + charges) * 100) / 100;
    // let payableAmt = Math.round(((amount / 2) * 100) / 100);

    order.info.rate = Math.round(Number(rate) * 100) / 100;
    order.info.amount = amount;
    // order.info.payableAmt = payableAmt;
    order.info.deliveryChg = Math.round(Number(deliveryChg) * 100) / 100;
    order.info.charges = charges;
    order.info.subtot = subtot;
    order.info.expTime = expTime;
    order.status.current = "responded";
    order.status.responded.time = Date(Date.now());
    order.status.responded.comment = "Response sent to customer";
    await order.save();
    let extValues = req.body;
    extValues.mailTo = "customer";
    // send email to customer
    await sendMail(order, extValues);
    res.status(200).json({ message: "success" });
  } else {
    res.status(404).json({ message: "Invalid Enquiry!!" });
  }
};

module.exports.statusUpdate = async (req, res) => {
  let { status } = req.body;

  let order = await Order.findOne({
    _id: req.params.id,
    seller: req.user.id
  })
    .populate("customer")
    .populate("seller");
  if (order) {
    if (status === "processing") {
      if (order.status.current === "ordered") {
        order.status.current = status;
        order.status.processing.time = Date(Date.now());
        order.status.processing.comment =
          "Your order is has been received and is being processed.";
      } else {
        return res.status(400).json({
          message: "Order status cannot be changed to processed"
        });
      }
    } else if (status === "shipped") {
      if (order.status.current === "processing") {
        order.status.current = status;
        order.status.shipped.time = Date(Date.now());
        order.status.shipped.comment = "Your order has been shipped.";
      } else {
        return res.status(400).json({
          message: "Order status cannot be changed to shipped."
        });
      }
    } else if (status === "delivered") {
      if (order.status.current === "shipped") {
        order.status.current = status;
        order.status.delivered.time = Date(Date.now());
        order.status.delivered.comment =
          "Your order has been delivered successfully.";
      } else {
        return res.status(400).json({
          message: "Order status cannot be changed to delivered."
        });
      }
    } else {
      return res.status(400).json({ message: "invalid status" });
    }
    await order.save();
    let extValues = { mailTo: "customer" };
    // send email to customer.
    await sendMail(order, extValues);
    res.status(200).json({ message: "success" });
  } else {
    res.status(404).json({ message: "Invalid Enquiry!!" });
  }
};

module.exports.replacementAccept = async (req, res) => {
  let order = await Order.findOne({
    _id: req.params.id,
    seller: req.user.id
  })
    .populate("seller")
    .populate("customer");
  if (order.status.current === "replacement") {
    let { customer, seller, item, info, payment, state } = order;
    let orderStatus = {
      current: "ordered",
      ordered: {
        time: Date(Date.now()),
        comment: "Your order has been placed."
      }
    };
    let newOrder = {
      customer,
      seller,
      item,
      info,
      payment,
      state,
      status: orderStatus,
      type: "order"
    };
    let orderCreated = await Order.create(newOrder);
    order.status.current = "replacement-accepted";
    order.status.replacement.time = Date(Date.now());
    order.status.replacement.comment =
      "Your replacement request has been accepted by seller";
    // order.status.replacement.message = "request accepted";
    order.status.replacement.status = "accepted";
    order.status.replacement.newOrderId = orderCreated._id;
    await order.save();
    // send mail to customer

    let extValues = { mailTo: "customer" };
    await sendMail(order, extValues);
    res.status(200).json({ message: "success", orderOrEnquiry: order });
  } else {
    res.status(404).json({ message: "No such order!!" });
  }
};

module.exports.replacementDecline = async (req, res) => {
  let { declineReason } = req.body;

  let order = await Order.findOne({
    _id: req.params.id,
    seller: req.user.id
  })
    .populate("seller")
    .populate("customer");
  if (order.status.current === "replacement") {
    order.status.current = "replacement-declined-seller";
    order.status.replacement.time = Date(Date.now());
    order.status.replacement.comment =
      "Your replacement request has been rejected by seller and is being reviewed by admin.";
    // order.status.replacement.message = declineReason;
    order.status.replacement.status = "atAdmin";
    await order.save();
    // send mail to customer
    let extValues = {
      reason: declineReason,
      mailTo: "customer"
    };
    await sendMail(order, extValues);
    res.status(200).json({ message: "success", orderOrEnquiry: order });
  } else {
    res.status(404).json({ message: "No such order!!" });
  }
};

module.exports.payments = async (req, res) => {
  //sortType; asc/desc, sortBy: createdAt/payments.amount, filterObject:{'payments.seller.status':}
  let { pageNo, perPage, sortType, sortBy, filterObject } = req.body;
  let resultPayments = [],
    paymentStats = {
      totalAmount: 0,
      totalDue: 0,
      totalPaid: 0,
      totalBrokage: 0
    },
    totalPages = 0;

  if (
    pageNo === undefined ||
    perPage === undefined ||
    Number(pageNo) === 0 ||
    Number(perPage) === 0 ||
    sortType === undefined ||
    sortBy === undefined
  ) {
    return res.status(400).json({ message: "Wrong page parameters provided" });
  } else {
    if (filterObject === undefined) {
      //get all payments from database to calculate stats
      let paymentsForStats = await Payment.find({ seller: req.user.id });
      paymentsForStats.map(payment => {
        paymentStats.totalAmount += payment.payments.amount;
        paymentStats.totalBrokage += payment.payments.brokage;
        if (payment.payments.seller.status === "pending") {
          paymentStats.totalDue += payment.payments.seller.amount;
        } else {
          paymentStats.totalPaid += payment.payments.seller.amount;
        }
      });
      //find all payments and sortBy createdAt/payments.amount to send to frontend
      resultPayments = await Payment.find({ seller: req.user.id })
        .sort({ [sortBy]: sortType })
        .skip(Number(perPage) * (Number(pageNo) - 1))
        .limit(Number(perPage));
      totalPages = Math.ceil(paymentsForStats.length / Number(perPage));
    } else {
      let filterOptionsQuery = {
        seller: req.user.id
      };
      //based on the keys of filterObject fitlerOptionsQuery is constructed
      Object.keys(filterObject).map(key => {
        if (filterObject[key] !== "") {
          if (key !== "seller.orgName") {
            filterOptionsQuery[key] = filterObject[key];
          }
        }
      });
      //find all paymenrs by payments.seller.status and sortBy createdAt/payments.amount
      //calculating payment stats for these filtered payments
      let paymentsForStats = await Payment.find(filterOptionsQuery);
      paymentsForStats.map(payment => {
        paymentStats.totalAmount += payment.payments.amount;
        paymentStats.totalBrokage += payment.payments.brokage;
        if (payment.payments.seller.status === "pending") {
          paymentStats.totalDue += payment.payments.seller.amount;
        } else {
          paymentStats.totalPaid += payment.payments.seller.amount;
        }
      });
      resultPayments = await Payment.find(filterOptionsQuery)
        .sort({ [sortBy]: sortType })
        .populate("order", "seller")
        .skip(Number(perPage) * (Number(pageNo) - 1))
        .limit(Number(perPage));

      //calcualating totalPages to display for frontend
      totalPages = Math.ceil(paymentsForStats.length / Number(perPage));
    }
  }
  res.status(200).json({
    message: "success",
    resultPayments,
    paymentStats,
    totalPages
  });
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
    seller: req.user.id,
    type: "enquiry"
  });
  stats.orders = await Order.countDocuments({
    seller: req.user.id,
    type: "order"
  });
  stats.lastOrderOrEnquiry = await Order.find({ seller: req.user.id })
    .sort({ createdAt: "desc" })
    .limit(3)
    .populate("customer")
    .populate("seller");

  stats.reviews = await Review.countDocuments({ seller: req.user.id });
  stats.lastReview = await Review.find({ seller: req.user.id })
    .sort({ createdAt: "desc" })
    .limit(3)
    .populate("customer")
    .populate("seller")
    .populate("order");
  res.status(200).json({ message: "success", stats });
};
