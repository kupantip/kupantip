import { Request, Response } from 'express';
import { createPost, getPosts, addAttachment } from '../models/post.model';
import path from 'path';


export const createPostController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { title, body_md, url, category_id } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // 1. สร้าง post
    const post = await createPost(
      req.user.user_id,
      title,
      body_md || null,
      url || null,
      category_id || null
    );

    // 2. ถ้ามีไฟล์แนบ → เพิ่ม attachment
    const files = req.files as Express.Multer.File[];
    let attachments: any[] = [];

    if (files && files.length > 0) {
      for (const file of files) {
        const fileUrl = `/uploads/${file.filename}`;
        const ext = path.extname(file.originalname).toLowerCase().replace('.', ''); // jpg/png/gif
        const attachment = await addAttachment(post.id, fileUrl, ext);
        attachments.push(attachment);
      }
    }

    return res.status(201).json({
      message: 'Post created',
      post,
      attachments,
    });
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
