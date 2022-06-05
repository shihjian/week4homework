var express = require("express");
var router = express.Router();
const errHandler = require("../errorHandler/errHandler");
// 不使用try cath方式
const handleErrorAsync = require("../errorHandler/handleErrorAsync");
// 集中管理錯誤資訊
const appError = require("../errorHandler/appError");
// 引入Model
const POST = require("../models/postsModel");
const USER = require("../models/userModel");
const Comment = require("../models/commentsModel");
// token 機制
const { isAuth, generateToken } = require("../service/auth");
const Post = require("../models/postsModel");
// GET
router.get(
  "/",
  handleErrorAsync(async function (req, res) {
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

    let {
      query: { q, sort },
    } = req;

    // 新舊排序
    let rink = sort === "asc" ? "createdAt" : "-createdAt";
    // // 關鍵字搜尋
    const filter = q !== undefined ? { content: new RegExp(req.query.q) } : {};
    const total = await POST.find(filter).count();
    // console.log("total", total);
    // const totalPage = Math.ceil(total / limit);
    // console.log("totalPage", totalPage);
    const post = await POST.find(filter)
      .populate({
        path: "user", // 選擇欄位
        select: "name photo ",
      })
      .populate({
        path: "comments",
        select: "comment user",
      })
      .sort(rink);
    res.status(200).json({
      status: "success",
      data: post,
    });
  })
);

// 需要登入後的貼文
router.post(
  "/",
  isAuth,
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
    console.log("req.body.content", req.body.content);
    if (!req.body.content) {
      return next(appError(400, "你沒有填寫內容", next));
    }
    if (!req.user.id) {
      return next(appError(400, "請先登入會員", next));
    }
    const checkUser = await USER.findById(req.user.id).exec();
    console.log("checkUser", checkUser);
    if (!checkUser) {
      return next(appError(400, "沒有這個使用者", next));
    }
    const newPost = await POST.create({
      content: req.body.content,
      user: req.user.id,
    });
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
    const data = req.body.content;

    if (!data) {
      return next(appError(400, "請輸入訊息", next));
    }
    const upData = await POST.findByIdAndUpdate(
      id,
      {
        content: data,
      },
      { new: true }
    );
    if (upData !== null) {
      res.status(200).json({
        status: "success",
        Message: "編輯成功",
        data: upData,
      });
    } else {
      appError(400, "查無此ID編輯失敗", next);
    }
  })
);

// 點擊按讚
router.post(
  "/:id/like",
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const _id = req.params.id;
    const checkId = await Post.findById(_id);
    if (!checkId) {
      return next(appError("400", "查無此文章", next));
    }
    await Post.findByIdAndUpdate(
      { _id },
      {
        $addToSet: {
          likes: req.user.id,
        },
      }
    );
    res.status(201).json({
      status: "success",
      postId: _id,
      userId: req.user.id,
    });
  })
);

// 取消按讚
router.delete(
  "/:id/like",
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const _id = req.params.id;
    const checkId = await Post.findById(_id);
    if (!checkId) {
      return next(appError("400", "查無此文章", next));
    }
    await Post.findByIdAndUpdate(
      { _id },
      {
        $pull: { likes: req.user.id },
      }
    );
    res.status(201).json({
      status: "success",
      postId: _id,
      userId: req.user.id,
    });
  })
);

// 留言
router.post(
  "/:id/comment",
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const user = req.user.id;
    const post = req.params.id;
    const { comment } = req.body;
    const newComment = await Comment.create({
      post,
      user,
      comment,
    });
    res.status(201).json({
      status: "success",
      data: {
        comments: newComment,
      },
    });
  })
);
module.exports = router;
