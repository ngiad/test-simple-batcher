import mongoose from "mongoose";
import Post from "../models/post.model.js";


async function getPostById(req, res) {
  try {
    const postId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }
    const post = await Post.findById(postId);
    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export default {
  getPostById,
};
