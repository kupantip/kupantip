import { Request, Response, NextFunction } from 'express';
import { getDbConnection } from '../database/mssql.database';
import { createPost, getPosts, addAttachment, deletePost, updatePost } from '../models/post.model';
import * as z from 'zod';
import path from 'path';

const postSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  body_md: z.string().optional(),
  url: z.string().url().optional(),
  category_id: z.string().uuid().optional(),
});

const updatePostSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  body_md: z.string().optional(),
  category_id: z.string().uuid().optional(),
});

const postIdParamSchema = z.object({ // use for updatePostController
  post_id: z.string().uuid(),
});

const getCategorySchema = z.object({
  category_id: z.string().uuid().optional(),
});


export const createPostController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    postSchema.parse(req.body);

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
    // return res
    //   .status(500)
    //   .json({ message: 'Failed to create post', error: err });
      next(err);
    
  }
};

// GET /posts?category_id=...
export const getPostsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    getCategorySchema.parse(req.params);
    const { category_id } = req.query;

    const posts = await getPosts(
      category_id ? String(category_id) : undefined
    );

    return res.status(200).json(posts);
  } catch (err) {
    // return res.status(500).json({ message: 'Failed to fetch posts', error: err });
    next(err);
  }
};

export const deletePostController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    postIdParamSchema.parse(req.params);

    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: Please login first' });
    }

    const { post_id } = req.params;

    if (!post_id) {
      return res.status(400).json({ message: 'Post ID is required' });
    }

    let deletedPost;

    if (req.user.role === 'admin') {
      // admin ลบได้ทุกโพส
      deletedPost = await deletePost(post_id);
    } else {
      // ผู้ใช้ทั่วไป ลบโพสตัวเองเท่านั้น
      deletedPost = await deletePost(post_id, req.user.user_id);
    }

    if (!deletedPost) {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Not authorized to delete this post' });
      }
      return res.status(404).json({ message: 'Post not found' });
    }

    return res.status(200).json({ message: 'Post deleted (soft)', post: deletedPost });
  } catch (err) {
    next(err);
  }
};


export const updatePostController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    postIdParamSchema.parse(req.params);
    updatePostSchema.parse(req.body);

    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: Please login first' });
    }

    const { post_id } = req.params;
    const { title, body_md, category_id } = req.body;

    if (!title && !body_md && !category_id) {
      return res.status(400).json({ message: 'At least one field is required to update' });
    }

    const pool = await getDbConnection();
    const checkPost = await pool
      .request()
      .input('post_id', post_id)
      .query(`SELECT author_id FROM [dbo].[post] WHERE id = @post_id AND deleted_at IS NULL`);

    if (checkPost.recordset.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const post = checkPost.recordset[0];
    if (post.author_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Forbidden: You are not the author of this post' });
    }

    // ผ่านทุกเงื่อนไข → อัปเดตได้
    const updated = await updatePost(
      post_id,
      req.user.user_id,
      title,
      body_md,
      category_id
    );

    return res.status(200).json({ message: 'Post updated', post: updated });
  } catch (err) {
    next(err);
  }
};
