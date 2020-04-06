const Multer = require("multer");
const path = require("path");

const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // no larger than 5mb
  }
});

const fileFilter = (req, res, next) => {
  if (!req.file) {
    res.status(400).json({ message: "No image file found" });
  } else {
    let ext = path.extname(req.file.originalname),
      type = req.file.mimetype.split("/");
    if (
      ext !== ".png" &&
      ext !== ".jpg" &&
      ext !== ".gif" &&
      ext !== ".jpeg" &&
      type[0] !== "image"
    ) {
      res.status(400).json({ message: "Only images allowed" });
    } else {
      next();
    }
  }
};

module.exports = {
  multer,
  fileFilter
};
