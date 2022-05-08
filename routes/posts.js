var express = require("express");
var router = express.Router();
const errHandler = require("../errorHandler/errHandler");

// 引入Model
const POST = require("../models/postsModel");
const USER = require("../models/userModel");
// GET
router.get("/", async function (req, res) {
  /**
   *  #swagger.tags = ['文章CRUD']
   *  #swagger.description ='取得全部文章'
   *  #swagger.responses[200]={
        description:'Some thing',
        schema:{
          "status": "success",
          "data": [
            {
              "_id": "6275ce90f854a19e3f9ca31b",
              "content": "測試資料3",
              "image": "",
              "user": {
                "_id": "6271d053e4d791780cac19b1",
                "name": "John",
                "photo": "https://thumb.fakeface.rest/thumb_male_10_8c02e4e9bdc0e103530691acfca605f18caf1766.jpg"
              },
              "likes": 0
            },
          ]
        }
    }
   */
  // 新舊排序
  const timeSort = req.query.timeSort === "asc" ? "createdAt" : "-createdAt";
  // 關鍵字搜尋
  const q =
    req.query.q !== undefined ? { content: new RegExp(req.query.q) } : {};
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
  /**
   *  #swagger.tags = ['文章CRUD']
   *  #swagger.description ='新增文章'
   *  #swagger.parameters['body'] = {
         in:'body',
          description:'格式',
          schema:{
            $user:'Number',
            $content:'String',
            image:'String',
          }
      }
   */
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
  /**
   *  #swagger.tags = ['文章CRUD']
   * #swagger.description ='刪除單一文章'
   */
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
  /**
   *  #swagger.tags = ['文章CRUD']
   *  #swagger.description ='刪除全部文章'
   */
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
  /**
   *  #swagger.tags = ['文章CRUD']
   * #swagger.description ='更新文章'
   */
  try {
    const id = req.params.id;
    const data = req.body;


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
