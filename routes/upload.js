var express = require("express");
var router = express.Router();
// Imgur套件
const { ImgurClient } = require("imgur");
// 偵測圖片大小
const sizeOf = require("image-size");
// 偵測圖片正確性
const upload = require("../service/image");
// 最外層保護機制
const handleErrorAsync = require("../errorHandler/handleErrorAsync");
// 集中管理錯誤資訊
const appError = require("../errorHandler/appError");
// token 機制
const { isAuth, generateToken } = require("../service/auth");
// upload 圖片中繼管理
// const upload = require("../service/image")

router.post(
  "/",
  upload,
  handleErrorAsync(async (req, res, next) => {
    console.log("files", req.files);
    if (!req.files.length) {
      return next(appError(400, "尚未上傳圖片", next));
    }
    // const dimensions = sizeOf(req.files[0].buffer);
    // if (dimensions.with !== dimensions.heigh) {
    //   return next(appError(400, "圖片長寬不符合1:1", next));
    // }
    const client = new ImgurClient({
      clientId: process.env.IMGUR_CLIENTID,
      clientSecret: process.env.IMGUR_CLIENT_SECRET,
      refreshToken: process.env.IMGUR_REFRESH_TOKEN,
    });
    const response = await client.upload({
      image: req.files[0].buffer.toString("base64"),
      type: "base64",
      album: process.env.IMGUR_ALBUM_ID,
    });
    res.status(200).json({
      status: "success",
      msg: "圖片上傳成功",
      imgUrl: response.data.link,
    });
  })
);

module.exports = router;
