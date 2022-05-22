var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const dotenv = require("dotenv");
// 引入swaggerUI
const swaggerUI = require("swagger-ui-express");
const swaggerFile = require("./swagger-output");

// 吵架必備表頭增加
const cors = require("cors");
const mongoose = require("mongoose");

// Router
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var postsRouter = require("./routes/posts");
var uploadRouter = require("./routes/upload");

// 捕捉程式錯誤
process.on("uncaughtException", (err) => {
  // 記錄錯誤下來，等到服務都處理完後，停掉該 process
  console.error("程式有誤！");
  console.error(err);
  process.exit(1);
});
var app = express();

// 資料庫設定開始

dotenv.config({ path: "./config.env" });
mongoose
  .connect(
    "mongodb+srv://werty713025:ab852456@cluster0.h2smg.mongodb.net/week4?retryWrites=true&w=majority"
  )
  .then((res) => console.log("連線資料成功"));

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/posts", postsRouter);
app.use("/upload", uploadRouter);

console.log(process.env.NODE_ENV);

// 中繼 404
app.use(function (req, res, next) {
  res.status(404).json({
    statue: "false",
    message: "無此路由!",
  });
});

// 自己設定的 err 錯誤
const resErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      message: err.message,
    });
  } else {
    // log 紀錄
    console.error("出現重大錯誤", err);
    // 送出罐頭預設訊息
    res.status(500).json({
      status: "error",
      message: "系統錯誤，請恰系統管理員",
    });
  }
};

// 在Dev開發環境中中顯示的錯誤
const resErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

// Express 捕捉錯誤 (全部Error都會集中在這處理)
app.use(function (err, req, res, next) {
  // dev，將statusCode複寫我自定義的
  err.statusCode = err.statusCode || 500;
  if (process.env.NODE_ENV === "dev") {
    return resErrorDev(err, res);
  }

  // production，ValidationError 為Express原本就有的欄位驗證屬性
  if (err.name === "ValidationError") {
    err.message = "資料欄位未填寫正確，請重新輸入！";
    err.isOperational = true;
    return resErrorProd(err, res);
  }
  resErrorProd(err, res);
});

// 未捕捉到的 catch
process.on("unhandledRejection", (err, promise) => {
  console.error("未捕捉到的 rejection：", promise, "原因：", err);
  // 記錄於 log 上
});

// 引入swagger 路由
app.use("/api-doc", swaggerUI.serve, swaggerUI.setup(swaggerFile));
module.exports = app;
