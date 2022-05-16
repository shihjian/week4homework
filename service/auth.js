const express = require("express");
const jwt = require("jsonwebtoken");
const appError = require("../errorHandler/appError");
const handleErrorAsync = require("../errorHandler/handleErrorAsync");
const User = require("../models/userModel");

// 驗證Token
const isAuth = handleErrorAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(appError(401, "請先登入會員", next));
  }

  // 驗證token正確性及拿取Id
  const decode = await new Promise((resolve, reject) => {
    // 解析token
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) {
        reject(err);
      } else {
        resolve(payload);
        console.log("payload", payload);
      }
    });
  });

  // 因為token 有我自己放的id，拿出來比對
  const currentUser = await User.findById(decode.id);

  // req 可以自定義
  req.use = currentUser;
  next();
});

// 製作Token
const generateToken = (user, statusCode, res) => {
  // user 為比對後的整包資料放到這
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_DAY,
  });
  // 故意不給前端看到密碼
  user.password = undefined;
  res.status(statusCode).json({
    status: "Success",
    token,
    name: user.name,
  });
};

module.exports = {
  isAuth,
  generateToken,
};
