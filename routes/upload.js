var express = require("express");
var router = express.Router();
// 最外層保護機制
const handleErrorAsync = require("../errorHandler/handleErrorAsync");
// 集中管理錯誤資訊
const appError = require("../errorHandler/appError");
// token 機制
const { isAuth, generateToken } = require("../service/auth");
// upload 圖片中繼管理
// const upload = require("../service/image")

router.post('/',isAuth,handleErrorAsync(async(req, res, next)=>{
    
}))

module.exports = router;