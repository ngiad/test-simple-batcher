import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  title: String,
  content: String,
});

const Post = mongoose.model('Post', PostSchema);
export default Post;