var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
// 吵架必備
const cors = require("cors");
const mongoose = require("mongoose");
// Router
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var postsRouter = require("./routes/posts");

var app = express();

// 資料庫設定開始

mongoose
  .connect("mongodb+srv://werty713025:ab852456@cluster0.h2smg.mongodb.net/week4?retryWrites=true&w=majority")
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
module.exports = app;
