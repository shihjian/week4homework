var express = require("express");
var router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
    /**
   *  #swagger.ignore = true
   */
  // res.send('respond with a resource');
  res.status(200).json({
    "name": "Mike",
  });
});

module.exports = router;
