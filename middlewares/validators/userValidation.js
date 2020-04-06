const path = require("path");

// password check function
isValidPassword = pwd => {
  // const regexPassword = new RegExp(
  //   "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})"
  // );
  return pwd.length >= 8;
};

module.exports.validateBasicInfo = (req, res, next) => {
  const {
    email,
    fname,
    lname,
    orgName,
    contact,
    fullAddress,
    /*city,*/
    state,
    pincode,
    password,
    role
  } = req.body;

  //validating email
  let regexEmail = /^(([^<>()\[\]\\.,;:\s@']+(\.[^<>()\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  let isValidEmail = regexEmail.test(
    String(email)
      .toLowerCase()
      .trim()
  );

  //validating contact
  let regexContact = /(^[6-9][0-9]{9})$/gm;
  let isValidContact = regexContact.test(Number(contact));

  //validating pincode
  let isValidPincodeLength = String(pincode).length === 6 ? true : false;
  let pincodeRegex = /(^[0-9]{6}$)/gm;
  let isValidPincode = pincodeRegex.test(Number(pincode));

  //perform role wise validations
  if (role === "") {
    return res.status(403).json({ message: "Some entries are null" });
  } else {
    if (role === "seller") {
      //only seller will enter pincode and full address with state on register
      if (!isValidPincodeLength || !isValidPincode) {
        return res.status(406).json({ message: "Invalid Pincode" });
      } else if (fullAddress === "" /*|| state === ""*/) {
        return res.status(403).json({ message: "Some entries are null" });
      }
    }
    if (!isValidEmail) {
      res.status(406).json({ message: "Invalid Email ID" });
    } else if (!isValidContact) {
      res.status(406).json({ message: "Invalid Phone Number" });
    } else if (!isValidPassword(password)) {
      res.status(406).json({
        message: "Password must be atleast 8 characters long"
      });
    } else if (
      fname === "" ||
      lname === "" ||
      orgName == "" ||
      /*city === "" ||*/
      state === "" ||
      password === ""
    ) {
      res.status(403).json({ message: "Some entries are null" });
    } else {
      next();
    }
  }
};

module.exports.validateUpdateInfo = (req, res, next) => {
  const { fname, lname, orgName, fullAddress, city, state, pincode } = req.body;

  //validating pincode
  let isValidPincodeLength = String(pincode).length === 6 ? true : false;
  let pincodeRegex = /(^[0-9]{6}$)/gm;
  let isValidPincode = pincodeRegex.test(Number(pincode));

  //if image was updated then check for that
  if (req.files.length !== 0) {
    req.file = req.files[0];
    let ext = path.extname(req.file.originalname),
      type = req.file.mimetype.split("/");
    if (
      ext !== ".png" &&
      ext !== ".jpg" &&
      ext !== ".gif" &&
      ext !== ".jpeg" &&
      type[0] !== "image"
    ) {
      return res.status(400).json({ message: "Only images allowed" });
    }
  } else {
    req.body.img = undefined;
  }

  if (!isValidPincodeLength || !isValidPincode) {
    res.status(406).json({ message: "Invalid Pincode" });
  } else if (
    fname === "" ||
    lname === "" ||
    fullAddress === "" ||
    city === "" ||
    state === "" ||
    orgName === ""
  ) {
    res.status(403).json({ message: "Some entries are null" });
  } else {
    next();
  }
};

module.exports.newPasswordValidation = (req, res, next) => {
  let { newPwd, newPwd2 } = req.body;
  if (newPwd !== newPwd2) {
    res.status(400).json({ message: "confirm passwords not matched!!" });
  } else if (isValidPassword(newPwd)) {
    return next();
  } else {
    res.status(400).json({
      message:
        "Password must be atleast 8 characters long and contain a uppercase, a lowercase and a number."
    });
  }
};
