const mongoose = require("mongoose");
const commentSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: [true, "內容不得為空"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "user",
    required: [true, "需要有效的使用者ID"],
  },
  post: {
    type: mongoose.Schema.ObjectId,
    ref: "post",
    required: [true, "需要有效的文章ID"],
  },
});

// 使用到find的語法就會被觸發。
commentSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name id photo createAt",
  });
  next();
});

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
