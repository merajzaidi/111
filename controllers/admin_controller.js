// send email service
const { sendMail } = require("../config/emailService");

module.exports.customers = async (req, res) => {
  //sortType: asc/desc, filterBy: city
  let { pageNo, perPage, sortType, filterBy } = req.body;
  let totalCustomers = 0,
    customers = [],
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
    if (filterBy === undefined) {
      //count all customers in database for given filter
      totalCustomers = await User.countDocuments({
        role: "customer"
      });
      //sort all the customers by the time of their creation
      customers = await User.find({ role: "customer" })
        .sort({ createdAt: sortType })
        .skip(Number(perPage) * (Number(pageNo) - 1))
        .limit(Number(perPage));

      //calculate totalPages for frontend
      totalPages = Math.ceil(totalCustomers / Number(perPage));
    } else {
      let filterOptionsQuery = {
        role: "customer"
      };

      if (filterBy !== "") {
        filterOptionsQuery["address.state"] = filterBy;
      }
      console.log(filterBy, filterOptionsQuery);
      //count all customers in database for given filter
      totalCustomers = await User.countDocuments(filterOptionsQuery);
      //sort all the customers of particular city by the time of their creation
      customers = await User.find(filterOptionsQuery)
        .sort({ createdAt: sortType })
        .skip(Number(perPage) * (Number(pageNo) - 1))
        .limit(Number(perPage));
      //calculate totalPages for frontend
      totalPages = Math.ceil(totalCustomers / Number(perPage));
    }
  }
  res.status(200).json({
    message: "success",
    customers,
    totalCustomers,
    totalPages
  });
};

module.exports.customerDetails = async (req, res) => {
  //initialize the stats to display on customer detail page
  let statusStats = {
    requested: 0,
    responded: 0,
    ordered: 0,
    replacement: 0,
    cancelled: 0,
    delivered: 0
  };

  const customer = await User.findOne({
    _id: req.params.id,
    role: "customer"
  });
  if (customer) {
    //find all orders by this customer
    const ordersForStats = await Order.find({
      customer: req.params.id
    });
    //count all orders based on their statuses
    ordersForStats.map(order => {
      if (order.status.requested.time !== undefined) {
        statusStats.requested++;
      }
      if (order.status.responded.time !== undefined) {
        statusStats.responded++;
      }
      if (order.status.ordered.time !== undefined) {
        statusStats.ordered++;
      }
      if (order.status.replacement.time !== undefined) {
        statusStats.replacement++;
      }
      if (order.status.cancelled.time !== undefined) {
        statusStats.cancelled++;
      }
      if (order.status.delivered.time !== undefined) {
        statusStats.delivered++;
      }
    });
    res.status(200).json({
      message: "success",
      customer,
      statusStats
    });
  } else {
    res.status(400).json({ message: "No customer found" });
  }
};

module.exports.settings = async (req, res) => {
  let settings = await Setting.find({});
  if (settings.length === 0) {
    res.status(404).json({ message: "No settings available.", settings });
  } else {
    res.status(200).json({ message: "success", settings: settings });
  }
};

module.exports.addSetting = async (req, res) => {
  let { category, value } = req.body;
  // category: tshirtType or fabric (dropdown in frontend)
  // value: corresponding value for selected category
  let settings = await Setting.find({});
  if (settings.length !== 0) {
    let setting = settings[0];
    if (category === "tshirtType") {
      if (
        setting.tshirtType.indexOf(String(value.trim()).toLowerCase()) === -1
      ) {
        setting.tshirtType.push(String(value.trim()).toLowerCase());
      }
    } else if (category === "fabric") {
      if (setting.fabric.indexOf(String(value.trim()).toLowerCase()) === -1) {
        setting.fabric.push(String(value.trim()).toLowerCase());
      }
    }
    await setting.save();
    res.status(200).json({ message: "success" });
  } else {
    let tshirtType = [],
      fabric = [];
    if (category === "tshirtType") {
      tshirtType.push(String(value.trim()).toLowerCase());
    } else if (category === "fabric") {
      fabric.push(String(value.trim()).toLowerCase());
    }
    await Setting.create({ tshirtType, fabric });
    res.status(200).json({ message: "success" });
  }
};

module.exports.deleteSetting = async (req, res) => {
  let { category, value } = req.body;
  let removeIndex;
  let settings = await Setting.find({});
  let setting = settings[0];
  if (category === "tshirtType") {
    removeIndex = setting.tshirtType.indexOf(
      String(value.trim()).toLowerCase()
    );
    if (removeIndex !== -1) {
      setting.tshirtType.splice(removeIndex, 1);
    }
  } else {
    removeIndex = setting.fabric.indexOf(String(value.trim()).toLowerCase());
    if (removeIndex !== -1) {
      setting.fabric.splice(removeIndex, 1);
    }
  }
  await setting.save();
  res.status(200).json({ message: "success" });
};

module.exports.sellers = async (req, res) => {
  //sortType; asc/desc, sortBy: createdAt/quality.avgRating, filterBy:city
  let { pageNo, perPage, sortType, sortBy, filterBy } = req.body;
  let totalSellers = 0,
    sellers = [],
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
    if (filterBy === undefined) {
      //count all sellers in database for given filter
      totalSellers = await User.countDocuments({ role: "seller" });
      //find all sellers and sortBy createdAt/quality.avgRating
      sellers = await User.find({ role: "seller" })
        .sort({ [sortBy]: sortType })
        .skip(Number(perPage) * (Number(pageNo) - 1))
        .limit(Number(perPage));
      //calculate totalPages for frontend
      totalPages = Math.ceil(totalSellers / Number(perPage));
    } else {
      let filterOptionsQuery = {
        role: "seller"
      };

      if (filterBy !== "") {
        filterOptionsQuery["address.state"] = filterBy;
      }
      //count all sellers in database for given filter
      totalSellers = await User.countDocuments(filterOptionsQuery);
      //find all sellers by city and sortBy createdAt/quality.avgRating
      sellers = await User.find(filterOptionsQuery)
        .sort({ [sortBy]: sortType })
        .skip(Number(perPage) * (Number(pageNo) - 1))
        .limit(Number(perPage));
      //calculate totalPages for frontend
      totalPages = Math.ceil(totalSellers / Number(perPage));
    }
  }
  res.status(200).json({
    message: "success",
    sellers,
    totalSellers,
    totalPages
  });
};

module.exports.sellerDetails = async (req, res) => {
  //initialize the stats to display on seller detail page
  let statusStats = {
    requested: 0,
    responded: 0,
    ordered: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    replacement: 0,
    cancelled: 0
  };

  const seller = await User.findOne({
    _id: req.params.id,
    role: "seller"
  });
  if (seller) {
    //find all orders by this seller
    const ordersForSeller = await Order.find({ seller: req.params.id });
    //count all order based on their statuses
    // please check in this way same order (assuming delivered) will be counted in requested, responded, ordered, processing, shipped also
    ordersForSeller.map(order => {
      if (order.status.requested.time !== undefined) {
        statusStats.requested++;
      }
      if (order.status.responded.time !== undefined) {
        statusStats.responded++;
      }
      if (order.status.ordered.time !== undefined) {
        statusStats.ordered++;
      }
      if (order.status.processing.time !== undefined) {
        statusStats.processing++;
      }
      if (order.status.shipped.time !== undefined) {
        statusStats.shipped++;
      }
      if (order.status.delivered.time !== undefined) {
        statusStats.delivered++;
      }
      if (order.status.replacement.time !== undefined) {
        statusStats.replacement++;
      }
      if (order.status.cancelled.time !== undefined) {
        statusStats.cancelled++;
      }
    });
    res.status(200).json({
      message: "success",
      seller,
      statusStats
    });
  } else {
    res.status(400).json({ message: "No seller found" });
  }
};

module.exports.sellerStores = async (req, res) => {
  let stores = await Store.find({ forSeller: req.params.id });
  if (stores.length !== 0) {
    res.status(200).json({ message: "success", stores });
  } else {
    res.status(404).json({ message: "No stores found." });
  }
};

module.exports.markStore = async (req, res) => {
  const store = await Store.findById(req.params.id);
  if (store) {
    if (store.approved) {
      store.approved = false;
    } else {
      store.approved = true;
    }
    await store.save();
    res.status(200).json({ message: "success" });
  } else {
    res.status(400).json({ message: "No store found" });
  }
};

module.exports.ordersOrEnquiries = async (req, res) => {
  //sortType: asc/desc, example for
  //filterObject:{type:'enquiry/order' 'order.state': 'Lucknow','seller.orgName':'ID',status.current: 'ordered'}
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
      overallOrders = await Order.countDocuments({});
      resultOrders = await Order.find({})
        .sort({ createdAt: sortType })
        .skip(Number(perPage) * (Number(pageNo) - 1))
        .limit(Number(perPage))
        .populate("seller")
        .populate("customer");
      totalPages = Math.ceil(overallOrders / Number(perPage));
    } else {
      let filterOptionsQuery = {},
        populateFilter = {};
      //based on the keys of filterObject fitlerOptionsQuery and populatQuery is constructed
      Object.keys(filterObject).map(key => {
        if (filterObject[key] !== "") {
          if (key === "seller.orgName") {
            populateFilter[key.slice(7)] = filterObject[key];
          } else {
            filterOptionsQuery[key] = filterObject[key];
          }
        }
      });
      orders = await Order.find(filterOptionsQuery)
        .populate({
          path: "seller",
          match: populateFilter
        })
        .populate("customer")
        .sort({ createdAt: sortType });
      //since populate returns those orders which doesn't match by assingning seller field to null
      //filter out those orders which have seller field null in them
      let resultOrdersWithNoPaging = orders.filter(
        order => order.seller !== null
      );
      // //overall orders with these queries
      //since result orders are those in which null values are removed and they are not paginated yet
      overallOrders = resultOrdersWithNoPaging.length;
      //filtered orders need to paginated manually
      let initialPageNo, uptoPageNo;
      initialPageNo = Number(perPage) * (Number(pageNo) - 1);
      uptoPageNo = Number(perPage) + initialPageNo;
      if (uptoPageNo > resultOrdersWithNoPaging.length) {
        resultOrders = resultOrdersWithNoPaging.slice(initialPageNo);
      } else {
        resultOrders = resultOrdersWithNoPaging.slice(
          initialPageNo,
          uptoPageNo
        );
      }
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
  let orderOrEnquiry = await Order.findOne({ _id: req.params.id })
    .populate("customer")
    .populate("seller");
  let payment = await Payment.findOne({ order: orderOrEnquiry._id });
  if (orderOrEnquiry) {
    res.status(200).json({ message: "success", orderOrEnquiry, payment });
  } else {
    res.status(400).json({ message: "No order found" });
  }
};

module.exports.replacementAccept = async (req, res) => {
  let order = await Order.findOne({
    _id: req.params.id,
    type: "replacement"
  })
    .populate("seller")
    .populate("customer");
  if (order.status.replacement.status === "atAdmin") {
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
    let extValues = { mailTo: "customer" };
    await sendMail(order, extValues);
    res.status(200).json({ message: "success", orderOrEnquiry: order });
  } else {
    res.status(404).json({ message: "No such order!!" });
  }
};

module.exports.replacementDecline = async (req, res) => {
  let order = await Order.findOne({
    _id: req.params.id,
    type: "replacement"
  })
    .populate("seller")
    .populate("customer");
  if (order.status.replacement.status === "atAdmin") {
    order.status.current = "replacement-declined-admin";
    order.status.replacement.time = Date(Date.now());
    order.status.replacement.comment =
      "Your replacement request has been rejected by admin";
    order.status.replacement.status = "rejected";
    order.type = "order";
    await order.save();
    // send mail to customer
    let extValues = { mailTo: "customer" };
    await sendMail(order, extValues);
    res.status(200).json({ message: "success", orderOrEnquiry: order });
  } else {
    res.status(404).json({ message: "No such order!!" });
  }
};

module.exports.payments = async (req, res) => {
  //sortType; asc/desc, sortBy: createdAt/payments.amount, filterObject:{''seller.orgName':,'payments.seller.status':}
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
      let paymentsForStats = await Payment.find({});
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
      resultPayments = await Payment.find({})
        .sort({ [sortBy]: sortType })
        .skip(Number(perPage) * (Number(pageNo) - 1))
        .limit(Number(perPage));
      totalPages = Math.ceil(paymentsForStats.length / Number(perPage));
    } else {
      let filterOptionsQuery = {},
        populateFilter = {};
      //based on the keys of filterObject fitlerOptionsQuery and populatQuery is constructed
      Object.keys(filterObject).map(key => {
        if (filterObject[key] !== "") {
          if (key === "seller.orgName") {
            populateFilter[key.slice(7)] = filterObject[key];
          } else {
            filterOptionsQuery[key] = filterObject[key];
          }
        }
      });
      //find all paymenrs by /orgName/payments.seller.status and sortBy createdAt/payments.amount
      payments = await Payment.find(filterOptionsQuery)
        .populate({ path: "seller", match: populateFilter })
        .sort({ [sortBy]: sortType });
      //since populate returns those payments which doesn't match by assingning seller field to null
      //filter out those payments which have seller field null in them
      let resultPaymentWithNoPagin = payments.filter(
        payment => payment.seller != null
      );
      //filtered payments need to paginated manually
      let initialPageNo, uptoPageNo;
      initialPageNo = Number(perPage) * (Number(pageNo) - 1);
      uptoPageNo = Number(perPage) + initialPageNo;
      if (uptoPageNo > resultPaymentWithNoPagin.length) {
        resultPayments = resultPaymentWithNoPagin.slice(initialPageNo);
      } else {
        resultPayments = resultPaymentWithNoPagin.slice(
          initialPageNo,
          uptoPageNo
        );
      }
      //calcualating totalPages to display for frontend
      totalPages = Math.ceil(resultPaymentWithNoPagin.length / Number(perPage));
      //calculating payment stats for this filtered payments
      let paymentsForStats = resultPaymentWithNoPagin;
      paymentsForStats.map(payment => {
        paymentStats.totalAmount += payment.payments.amount;
        paymentStats.totalBrokage += payment.payments.brokage;
        if (payment.payments.seller.status === "pending") {
          paymentStats.totalDue += payment.payments.seller.amount;
        } else {
          paymentStats.totalPaid += payment.payments.seller.amount;
        }
      });
    }
  }
  res.status(200).json({
    message: "success",
    resultPayments,
    paymentStats,
    totalPages
  });
};

module.exports.markPayment = async (req, res) => {
  let payment = await Payment.findById(req.params.id);
  if (payment) {
    if (payment.payments.seller.status === "pending") {
      payment.payments.seller.status = "paid";
    } else {
      payment.payments.seller.status = "pending";
    }
    await payment.save();
    res.status(200).json({ message: "success" });
  } else {
    res.status(400).json({ message: "No payment found" });
  }
};

module.exports.markDefaulter = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    if (user.isDefaulter) {
      user.isDefaulter = false;
    } else {
      user.isDefaulter = true;
    }
    await user.save();
    res.status(200).json({ message: "success" });
  } else {
    res.status(400).json({ message: "No user found" });
  }
};

module.exports.generateOrgNames = async (req, res) => {
  const orders = await Order.find({}).populate("seller");
  if (orders.length !== 0) {
    let orgNames = [],
      states = [];
    orders.map(order => {
      if (orgNames.indexOf(order.seller.orgName) === -1) {
        orgNames.push(order.seller.orgName);
      }
      if (states.indexOf(order.state) === -1) {
        states.push(order.state);
      }
    });
    res.status(200).json({ message: "success", orgNames, states });
  } else {
    res.status(400).json({ message: "No sellers found" });
  }
};

module.exports.generateUserCities = async (req, res) => {
  const users = await User.find({ role: req.params.role });
  let states = [];
  if (users.length !== 0) {
    users.map(user => {
      if (states.indexOf(user.address.state) === -1) {
        states.push(user.address.state);
      }
    });
    res.status(200).json({ message: "success", states });
  } else {
    res.status(400).json({ message: "No states found", states });
  }
};

module.exports.statusUpdate = async (req, res) => {
  let { status } = req.body;

  let order = await Order.findById(req.params.id)
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
          message: "Order cannot be processed"
        });
      }
    } else if (status === "shipped") {
      if (order.status.current === "processing") {
        order.status.current = status;
        order.status.shipped.time = Date(Date.now());
        order.status.shipped.comment = "Your order has been shipped.";
      } else {
        return res.status(400).json({
          message: "Order cannot be shipped without processing."
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
          message: "Order cannot be delivered without shipping."
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
    type: "enquiry"
  });
  stats.orders = await Order.countDocuments({
    type: "order"
  });
  stats.lastOrderOrEnquiry = await Order.find({})
    .sort({ createdAt: "desc" })
    .limit(3)
    .populate("customer")
    .populate("seller");

  stats.reviews = await Review.countDocuments({});
  stats.lastReview = await Review.find({})
    .sort({ createdAt: "desc" })
    .limit(3)
    .populate("customer")
    .populate("seller")
    .populate("order");

  res.status(200).json({ message: "success", stats });
};
