const path = require("path");

const upload = multer({
  limit: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter(req, file, cb) {},
});

module.exports = upload;
