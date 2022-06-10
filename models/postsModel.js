const mongoose = require("mongoose");
const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Content 未填寫"],
    },
    image: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      select: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "user", //連接到哪個Collection
      required: [true, "貼文ID未填寫"],
    },
    likes: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "user",
      },
    ],
  },
  {
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 偷掛comments陣列 虛擬document上去。
postSchema.virtual("comments", {
  // 找尋Comment的collection中的post欄位有無相同ID的貼文
  ref: "Comment",
  foreignField: "post",
  // 從postModel的ID去尋找CommentModel中post欄位相同的ID
  // _id 為Mongoose預設的ID
  localField: "_id",
});
const Post = mongoose.model("Post", postSchema);

module.exports = Post;
