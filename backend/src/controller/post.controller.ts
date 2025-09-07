import { Request, Response } from 'express';
import { createPost, getPosts } from '../models/post.model';


export const createPostController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { title, body_md, url, category_id } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // mock url ตอนนี้ ถ้า frontend ไม่ส่งมาก็ใส่ลิงก์ placeholder ไปก่อน
    const finalUrl = url || `https://example.com/posts/${Date.now()}`;

    const post = await createPost(
      req.user.user_id,
      title,
      body_md || null,
      finalUrl,
      category_id || null
    );

    return res.status(201).json({ message: 'Post created', post });
  } catch (err) {
    return res
      .status(500)
      .json({ message: 'Failed to create post', error: err });
  }
};

export const getPostsController = async (req: Request, res: Response) => {
  try {
    const { category_id } = req.query;

    const posts = await getPosts(
      category_id ? String(category_id) : undefined
    );

    return res.status(200).json(posts);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch posts', error: err });
  }
};
