var express = require("express");
var validator = require("validator");
var bcryptjs = require("bcryptjs");
var router = express.Router();
const User = require("../models/userModel");
// 不使用try cath方式
const handleErrorAsync = require("../errorHandler/handleErrorAsync");
// 集中管理錯誤資訊
const appError = require("../errorHandler/appError");
// token 機制
const { isAuth, generateToken } = require("../service/auth");
router.post(
  "/sign_up",
  handleErrorAsync(async function (req, res, next) {
    let { email, password, confirmPassword, name } = req.body;

    // 內容不得為空
    if (!email || !password || !confirmPassword || !name) {
      return next(appError("400", "欄位未填寫正確", next));
    }

    // 密碼不一致
    if (password !== confirmPassword) {
      return next(appError("400", "密碼輸入不一致", next));
    }

    // 密碼小於8碼
    if (!validator.isLength(password, { min: 8 })) {
      return next(appError("400", "密碼低於8碼", next));
    }

    // 驗證email
    if (!validator.isEmail(email)) {
      return next(appError("400", "Email格式不正確", next));
    }

    // 密碼加密需要一些時間 所以一定要用await
    password = await bcryptjs.hash(password, 12);
    const createNewUser = await User.create({
      email,
      password,
      name,
    });
    console.log("createNewUser", createNewUser);
    generateToken(createNewUser, 201, res);
  })
);

module.exports = router;
