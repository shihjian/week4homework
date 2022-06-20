var express = require("express");
var validator = require("validator");
var bcryptjs = require("bcryptjs");
var router = express.Router();
const POST = require("../models/postsModel");
const USER = require("../models/userModel");
// 不使用try cath方式
const handleErrorAsync = require("../errorHandler/handleErrorAsync");
// 集中管理錯誤資訊
const appError = require("../errorHandler/appError");
// token 機制
const { isAuth, generateToken } = require("../service/auth");

// 註冊
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

    // 確認email 是否重複
    const cheekEmail = await USER.findOne({ email });
    if (cheekEmail) {
      return next(appError("400", "Email重複註冊", next));
    }

    // 密碼加密需要一些時間 所以一定要用await
    password = await bcryptjs.hash(password, 12);
    const createNewUser = await USER.create({
      email,
      password,
      name,
    });
    console.log("createNewUser", createNewUser);
    generateToken(createNewUser, 201, "註冊成功註冊成功", res);
  })
);

// 登入
router.post(
  "/sign_in",
  handleErrorAsync(async function (req, res, next) {
    let { email, password } = req.body;
    if (!email || !password) {
      return next(appError(400, "請填寫電子信箱或密碼", next));
    }
    const user = await USER.findOne({ email }).select("+password");
    if (!user) {
      return next(appError(400, "此信箱尚未註冊", next));
    }
    const auth = await bcryptjs.compare(password, user.password);
    if (!auth) {
      return next(appError(400, "密碼輸入錯誤", next));
    }
    generateToken(user, 201, "登入成功", res);
  })
);

// 重設密碼
router.post(
  "/updatePassword",
  isAuth,
  handleErrorAsync(async function (req, res, next) {
    let { password, confirmPassword } = req.body;
    if (!password || !confirmPassword) {
      return next(appError(400, "請重新輸入新密碼", next));
    }
    if (password !== confirmPassword) {
      return next(appError(400, "新密碼和確認密碼不一致", next));
    }
    if (!validator.isLength(password, { min: 8 })) {
      return next(appError(400, "密碼不得小於8碼", next));
    }
    password = await bcryptjs.hash(password, 12);
    await USER.findByIdAndUpdate(req.user.id, { password: password });
    res.status(200).json({
      status: "Success",
      msg: "密碼更新成功",
    });
  })
);

// 取得個人資訊
router.get(
  "/profile",
  isAuth,
  handleErrorAsync(async function (req, res, next) {
    const user = await USER.findById(req.user._id);
    res.status(200).json({
      status: "Success",
      msg: user,
    });
  })
);

// 取得個人資訊
router.get(
  "/profiles/:id",
  handleErrorAsync(async function (req, res, next) {
    const id = req.params.id;
    const user = await USER.find({ _id: id });
    res.status(200).json({
      status: "Success",
      msg: user,
    });
  })
);

// 更新個人資訊
router.patch(
  "/profile",
  isAuth,
  handleErrorAsync(async function (req, res, next) {
    const { name, sex, photo } = req.body;
    const user = await USER.findByIdAndUpdate(req.user._id, {
      name,
      sex,
      photo,
    });
    res.status(200).json({
      status: "Success",
      msg: "資料更新成功",
      edit: user,
    });
  })
);

// 取得個人按讚列表
router.get(
  "/getLikeList",
  isAuth,
  handleErrorAsync(async function (req, res, next) {
    const likes = await POST.find({ likes: req.user._id }).populate({
      path: "user", // 選擇欄位
      select: "name photo ",
    });
    res.status(200).json({
      status: "Success",
      msg: "資料更新成功",
      data: likes,
    });
  })
);

// 追蹤
router.post(
  "/:id/follow",
  isAuth,
  handleErrorAsync(async function (req, res, next) {
    if (req.params.id == req.user.id) {
      return next(appError(400, "無法追蹤自己", next));
    }

    // 新增我的追蹤
    await USER.updateOne(
      {
        _id: req.user.id,
        "following.user": { $ne: req.params.id },
      },
      {
        $addToSet: { following: { user: req.params.id } },
      }
    );
    // 新增他的追蹤
    await USER.updateOne(
      {
        _id: req.user.id,
        "followers.user": { $ne: req.params.id },
      },
      {
        $addToSet: { followers: { user: req.params.id } },
      }
    );
    res.status(200).json({
      status: "Success",
      msg: "追蹤成功",
    });
  })
);

// 取消追蹤
router.delete(
  "/:id/unfollow",
  isAuth,
  handleErrorAsync(async function (req, res, next) {
    if (req.params.id == req.user.id) {
      return next(appError(400, "無法追蹤自己", next));
    }

    // 新增我的追蹤
    await User.updateOne(
      {
        _id: req.user.id,
        "following.user": { $ne: req.params.id },
      },
      {
        $pull: { following: { user: req.params.id } },
      }
    );
    // 新增他的追蹤
    await User.updateOne(
      {
        _id: req.user.id,
        "followers.user": { $ne: req.params.id },
      },
      {
        $pull: { followers: { user: req.params.id } },
      }
    );
    res.status(200).json({
      status: "Success",
      msg: "取消追蹤成功",
    });
  })
);
module.exports = router;
