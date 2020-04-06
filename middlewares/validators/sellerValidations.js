module.exports.validateAddStore = (req, res, next) => {
  let { tshirtType, fabric, state, phone, location } = req.body;
  if (!tshirtType || !fabric || !state || !phone || !location) {
    return res.status(400).json({ message: "All fields are mandatory!!" });
  }
  if (tshirtType.length === 0 || fabric.length === 0) {
    return res
      .status(400)
      .json({ message: "Select any one type for each of the options above" });
  }

  // checking inputs and sending validity
  const phoneRegex = /(^[6-9][0-9]{9})$/gm;

  if (phoneRegex.test(Number(phone))) {
    return next();
  } else {
    return res
      .status(400)
      .json({ message: "Please enter a valid phone number." });
  }
};

module.exports.validateSellerResponse = (req, res, next) => {
  let { rate, deliveryChg, expTime } = req.body;
  if (!rate || !deliveryChg || !expTime) {
    res.status(400).json({ message: "All fields are mandatory!!" });
  }

  // checking inputs and sending validity
  const rateRegex = /([0-9])/; // Only numbers
  const deliveryChgRegex = /([0-9])/; // only numbers
  const expTimeRegex = /([0-9])/; // no. of days

  if (rateRegex.test(Number(rate))) {
    if (deliveryChgRegex.test(Number(deliveryChg))) {
      if (expTimeRegex.test(Number(expTime))) {
        return next();
      } else {
        res.status(400).json({ message: "Please enter feasible no. of days." });
      }
    } else {
      res
        .status(400)
        .json({ message: "Please enter feasible delivery charge." });
    }
  } else {
    res.status(400).json({ message: "Please enter feasible rate." });
  }
};
