module.exports.validateAddSettings = (req, res, next) => {
  let { category, value } = req.body;
  if (!category || !value || category === "" || value === "") {
    return res.status(400).json({ message: "All fields are mandatory!!" });
  }

  // checking inputs and sending validity
  const valueRegex = /([a-zA-z])/;

  if (valueRegex.test(value)) {
    return next();
  } else {
    return res.status(400).json({ message: "Please enter a valid value." });
  }
};
