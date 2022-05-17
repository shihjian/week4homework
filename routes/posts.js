var express = require("express");
var router = express.Router();
const { generateToken, isAuth } = require("../service/auth");
const errHandler = require("../errorHandler/errHandler");
// 不使用try cath方式
const handleErrorAsync = require("../errorHandler/handleErrorAsync");
// 集中管理錯誤資訊
const appError = require("../errorHandler/appError");
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
router.post(
  "/",
  handleErrorAsync(async function (req, res, next) {
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

    //自訂可預測錯誤
    if (!req.body.content) {
      return next(appError(400, "你沒有填寫內容", next));
    }
    if (!req.body.user) {
      return next(appError(400, "你沒有填寫使用者", next));
    }
    const checkUser = await USER.findById(req.body.user)
      .exec()
      .catch((err) => {
        null;
      });
    if (checkUser === null) {
      return next(appError(400, "沒有這個使用者", next));
    }
    const newPost = await POST.create(req.body);
    res.status(200).json({
      status: "success",
      post: newPost,
    });
  })
);

// 單一 Delete
router.delete(
  "/:id",
  handleErrorAsync(async function (req, res, next) {
    /**
     *  #swagger.tags = ['文章CRUD']
     * #swagger.description ='刪除單一文章'
     */

    const id = req.params.id;
    const checkId = await POST.findByIdAndDelete(id);
    if (checkId !== null) {
      res.status(200).json({
        status: "success",
        Message: "刪除成功",
      });
    } else {
      appError(400, "查無此ID", next);
    }
  })
);

// 全刪除
router.delete(
  "/",
  handleErrorAsync(async function (req, res) {
    /**
     *  #swagger.tags = ['文章CRUD']
     *  #swagger.description ='刪除全部文章'
     */
    await POST.deleteMany({});
    res.status(200).json({
      status: "success",
      Message: "刪除成功",
    });
  })
);

// PATCH
router.patch(
  "/:id",
  handleErrorAsync(async function (req, res, next) {
    /**
     *  #swagger.tags = ['文章CRUD']
     * #swagger.description ='更新文章'
     */

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
      appError(400, "查無此ID編輯失敗", next);
    }
  })
);

module.exports = router;
