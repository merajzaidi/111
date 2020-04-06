module.exports.validateNoAuthEnquiryInfo = (req, res, next) => {
  const { sellerIDs, state, type, fabric } = req.body;

  if (!sellerIDs || sellerIDs.length === 0) {
    res.status(406).json({ message: "No sellers provided" });
  } else if (!state) {
    res.status(406).json({ message: "Invalid state" });
  } else if (!type) {
    res.status(406).json({ message: "Invalid T-Shirt type" });
  } else if (!fabric) {
    res.status(406).json({ message: "Invalid fabric" });
  } else {
    return next();
  }
};

module.exports.validateAddress = (req, res, next) => {
  const { fullAddress, city, state, pincode } = req.body;

  //validating pincode
  let isValidPincodeLength = String(pincode).length === 6 ? true : false;
  let pincodeRegex = /(^[0-9]{6}$)/gm;
  let isValidPincode = pincodeRegex.test(Number(pincode));

  if (fullAddress === "" || state === "" || city === "") {
    return res.status(403).json({ message: "Some entries are null" });
  } else if (!isValidPincodeLength || !isValidPincode) {
    return res.status(406).json({ message: "Invalid Pincode" });
  } else {
    return next();
  }
};

module.exports.validateEnquiryInfo = (req, res, next) => {
  //sanitize because all data recd is serialised
  req.body.sellerIDs = JSON.parse(req.body.sellerIDs);
  const sizeDetails = JSON.parse(req.body.sizeDetails);
  Object.keys(sizeDetails).map(
    size => (sizeDetails[size] = Number(sizeDetails[size]))
  );
  req.body.sizeDetails = sizeDetails;
  req.body.quantity = Number(req.body.quantity);
  req.file = req.files[0];

  const { sellerIDs, quantity, color } = req.body;

  //validating quanting,size and color
  const quantityRegex = /([0-9])/,
    sizeRegex = /([0-9])/,
    colorRegex = /([a-zA-z])/;
  let sizeSum = 0;
  let areAllSizesNum = Object.keys(sizeDetails).map(size => {
    if (sizeRegex.test(Number(sizeDetails[size]))) {
      sizeSum += Number(sizeDetails[size]);
      return true;
    } else {
      return false;
    }
  });

  if (sellerIDs.length === 0) {
    res.status(400).json({ message: "No sellers provided" });
  } else if (
    !quantityRegex.test(quantity) ||
    quantity !== sizeSum ||
    quantity === 0
  ) {
    res.status(400).json({
      message: "Invalid Quantity"
    });
  } else if (areAllSizesNum.indexOf(false) !== -1) {
    res.status(400).json({ message: "Please enter feasible no. of sizes" });
  } else if (!colorRegex.test(color)) {
    res.status(400).json({ message: "Please enter correct color name" });
  } else {
    return next();
  }
};

module.exports.validateReviews = (req, res, next) => {
  let { review, rating } = req.body;
  if (!rating && !review) {
    return res.status(400).json({ message: "Atleast one field required!!" });
  } else {
    // checking inputs and sending validity
    const ratingRegex = /([0-9])/; // Only numbers

    if (ratingRegex.test(Number(rating)) && rating >= 0 && rating <= 5) {
      return next();
    } else {
      res.status(400).json({ message: "Please rate between 0 to 5." });
    }
  }
};

module.exports.validateReplacementInfo = (req, res, next) => {
  //sanitize
  req.body.quantity = Number(req.body.quantity);
  const { quantity, message } = req.body;

  const quantityRegex = /([0-9])/;

  if (!quantityRegex.test(quantity) || quantity === 0) {
    res.status(400).json({
      message: "Invalid Quantity"
    });
  } else if (message === "") {
    res.status(400).json({ message: "Please enter message" });
  } else {
    return next();
  }
};
