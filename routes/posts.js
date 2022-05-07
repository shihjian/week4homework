var express = require("express");
var router = express.Router();
const errHandler = require("../errorHandler/errHandler");

// 引入Model
const POST = require("../models/postsModel");
const USER = require("../models/userModel");
// GET
router.get("/", async function (req, res) {
  // 新舊排序
  const timeSort = req.query.timeSort === "asc" ? "createdAt" : "-createdAt";
  // 關鍵字搜尋
  const q = req.query.q !== undefined ? { content: new RegExp(req.query.q) } : {};
  const post = await POST.find(q)
    .populate({
      path: "user", // 選擇欄位
      select: "name photo ",
    })
    .sort(timeSort);
  res.status(200).json({
    status: "success",
    data: post,
  });
});

// POST
router.post("/", async function (req, res) {
  try {
    const data = req.body;
    console.log(data);
    if (data.content !== "" && data.name !== "") {
      const newPost = await POST.create(data);
      res.status(200).json({
        status: "success",
        data: newPost,
      });
    } else {
      errHandler(res, 400, 2001);
    }
  } catch (err) {
    res.status(400).json({
      status: "false",
      message: err.message,
    });
  }
});

// 單一 Delete
router.delete("/:id", async function (req, res) {
  try {
    const id = req.params.id;
    const checkId = await POST.findByIdAndDelete(id);
    if (checkId !== null) {
      res.status(200).json({
        status: "success",
        Message: "刪除成功",
      });
    } else {
      errHandler(res, 400, 2002);
    }
  } catch (err) {
    res.status(400).json({
      status: "false",
      message: err.message,
    });
  }
});

// 全刪除
router.delete("/", async function (req, res) {
  try {
    await POST.deleteMany({});
    res.status(200).json({
      status: "success",
      Message: "刪除成功",
    });
  } catch (err) {
    res.status(400).json({
      status: "false",
      message: err.message,
    });
  }
});

// PATCH
router.patch("/:id", async function (req, res) {
  try {
    const id = req.params.id;
    const data = req.body;

    //接到的req.body 整包送給serve，就不用$set了
    const upData = await POST.findByIdAndUpdate(id, data);
    if (upData !== null) {
      const data = await POST.findById(id);
      res.status(200).json({
        status: "success",
        Message: "編輯成功",
        data: data,
      });
    } else {
      errHandler(res, 400, 2003);
    }
  } catch (err) {
    res.status(400).json({
      status: "false",
      message: err.message,
    });
  }
});

module.exports = router;
