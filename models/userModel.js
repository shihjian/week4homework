const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "請輸入您的名字"],
    },
    sex: {
      type: String,
      //枚舉
      enum: ["male", "female"],
    },
    email: {
      type: String,
      required: [true, "請輸入您的 Email"],
      unique: true,
      lowercase: true,
      select: false,
    },
    password: {
      type: String,
      required: [true, "請輸入密碼"],
      minlength: 8,
      select: false,
    },
    createdAt: {
      type: Date,
      default: new Date(),
      select: false,
    },
    photo: String,
  },
  {
    versionKey: false,
  }
);

const User = mongoose.model("user", userSchema);

module.exports = User;
