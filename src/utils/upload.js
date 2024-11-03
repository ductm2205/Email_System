const multer = require("multer");
const storage = require("../config/storage");

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: function (req, file, callback) {
    callback(null, true);
  },
});

module.exports = upload;
