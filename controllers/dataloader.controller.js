// import DataLoader from "dataloader";
// import Post from "../models/post.model.js";
// import mongoose from "mongoose";

// async function batchGetPosts(ids) {
//   const posts = await Post.find({ _id: { $in: ids } });

//   const postMap = {};
//   posts.forEach((post) => (postMap[post._id] = post));
//   return ids.map((id) => postMap[id] || null);
// }

// const postLoader = new DataLoader(batchGetPosts);

// async function getPostById(req, res) {
//   try {
//     const postId = req.params.id;
//     if (!mongoose.Types.ObjectId.isValid(postId)) {
//       return res.status(400).json({ message: "Invalid post ID" });
//     }
//     const objectId = new mongoose.Types.ObjectId(postId);
//     const post = await postLoader.load(objectId);

//     if (!post) {
//       return res.status(404).json({ message: "Post not found" });
//     }
//     res.status(200).json(post);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }

// export default {
//   getPostById,
// };




import SmartBatcher from 'smart-batcher';
import Post from '../models/post.model.js'; 
import mongoose from 'mongoose';

async function batchGetPosts(ids) {
    console.log('Batch fetching posts with IDs:', ids);
    try {
        const objectIds = ids.map(id => {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                console.warn(`Invalid ObjectId: ${id}`);
                return null; 
            }
            return new mongoose.Types.ObjectId(id);
        }).filter(id => id !== null); 
        const posts = await Post.find({ _id: { $in: objectIds } }).select({
            title: 1,
            content: 1,
        });

        const postMap = new Map();
        posts.forEach(post => {
            postMap.set(post._id.toString(), post.toObject()); 
        });

        return ids.map(id => {
           if (!mongoose.Types.ObjectId.isValid(id)) {
                return new Error(`Invalid ObjectId: ${id}`);
            }
            const objectId = new mongoose.Types.ObjectId(id);
            const post = postMap.get(objectId.toString());
            return post || null; 
        });

    } catch (error) {
        console.error('Error in batchGetPosts:', error);
        return ids.map(() => error);
    }
}

const postBatcher = new SmartBatcher(batchGetPosts, {
    delay: 30,         
    memoryLimitMB: 50,  
    expirationTime: 60 * 1000, 
});

async function getPostById(req, res) {
    try {
        const postId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: 'Invalid post ID' });
        }

        const post = await postBatcher.load(postId);  
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if(post instanceof Error){
            console.error("Unexpected error loading post", post);
            return res.status(500).json({message: "Internal Server Error"})
        }

        res.status(200).json(post);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function clearPostCache(req, res){
    try {
        await postBatcher.clearCache();
        res.status(200).json({message: 'Cache cleared'})
    } catch (error) {
        console.error("Failed to clear cache: ", error);
        res.status(500).json({message: "Failed to clear cache"})
    }
}

export default {
    getPostById,
    clearPostCache
};