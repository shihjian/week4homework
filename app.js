var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
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

// 捕捉程式錯誤
process.on("uncaughtException", (err) => {
  // 記錄錯誤下來，等到服務都處理完後，停掉該 process
  console.error("程式有誤！");
  console.error(err);
  process.exit(1);
});
var app = express();

// 資料庫設定開始

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

// 中繼 404
app.use(function (req, res, next) {
  res.status(404).json({
    statue: "false",
    message: "無此路由",
  });
});

// express 捕捉錯誤
app.use(function (err, req, res, next) {
  res.status(500),
    json({
      err: err.message,
    });
});

// 未捕捉到的 catch
process.on("unhandledRejection", (err, promise) => {
  console.error("未捕捉到的 rejection：", promise, "原因：", err);
  // 記錄於 log 上
});

// 引入swagger 路由
app.use("/api-doc", swaggerUI.serve, swaggerUI.setup(swaggerFile));
module.exports = app;
