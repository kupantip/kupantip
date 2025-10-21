import { Request, Response, NextFunction } from 'express';
import { getDbConnection } from '../database/mssql.database';
import {
	createPost,
	getPosts,
	addAttachment,
	deletePost,
	updatePost,
	clearAttachmentsByPost,
	getHotPostsByCategory,
	getCategorySummaryStats,
} from '../models/post.model';
import * as z from 'zod';

const postSchema = z.object({
	title: z.string().min(1, 'Title is required'),
	body_md: z.string(),
	url: z.string().url(),
	category_id: z.string().uuid().optional(),
});

// For update via multipart/form-data: overwrite semantics like create
// - title and body_md are required
// - if category_id is omitted or empty string => set to NULL
const updatePostSchema = z.object({
	title: z.string().min(1, 'Title is required'),
	body_md: z.string(),
	category_id: z
		.union([z.string().uuid(), z.literal('')])
		.optional()
		.transform((v) => (v === '' ? undefined : v)),
});

const postIdParamSchema = z.object({
	// use for updatePostController
	post_id: z.string().uuid(),
});

// Filter by category_id and/or user_id
const getFilterSchema = z.object({
	category_id: z.string().uuid().optional(),
	user_id: z.string().uuid().optional(),
	// robust boolean: 'true'|'1' => true, 'false'|'0' => false
	recent: z.preprocess((v) => {
		const toBool = (s: string) => {
			const t = s.trim().toLowerCase();
			if (t === 'true' || t === '1') return true;
			if (t === 'false' || t === '0') return false;
			return undefined;
		};
		if (typeof v === 'boolean') return v;
		if (typeof v === 'string') return toBool(v);
		if (Array.isArray(v) && v.length > 0) {
			const last = v[v.length - 1];
			if (typeof last === 'string') return toBool(last);
		}
		return undefined;
	}, z.boolean().optional()),
});

const getAttachmentsSchema = z.object({
	filename: z.string().min(1, 'Filename is required'),
});

export const createPostController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		postSchema.parse(req.body);

		if (!req.user) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const { title, body_md, url, category_id } = req.body;

		// 1. สร้าง post
		const post = await createPost(
			req.user.user_id,
			title,
			body_md || null,
			url || null,
			category_id || null
		);

		interface Attachment {
			id: string;
			post_id: string;
			url: string;
			mime_type: string | null;
			created_at: Date;
		}

		// 2. ถ้ามีไฟล์แนบ → เพิ่ม attachment
		const files = req.files as Express.Multer.File[];
		const attachments: Attachment[] = [];

		if (files && files.length > 0) {
			for (const file of files) {
				const fileUrl = `/uploads/${file.filename}`;
				const mimeType = file.mimetype; // jpg/png/gif/jpeg
				const attachment = await addAttachment(
					post.id,
					fileUrl,
					mimeType
				);
				attachments.push(attachment);
			}
		}

		return res.status(201).json({
			message: 'Post created',
			post,
			attachments,
		});
	} catch (err) {
		next(err);
	}
};

export const getPostsController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const parsed = getFilterSchema.parse(req.query);
		const { category_id, user_id, recent } = parsed;
		let posts;
		const post_id =
			typeof req.query.post_id === 'string'
				? req.query.post_id
				: undefined;
		if (req.user) {
			posts = await getPosts(
				category_id,
				user_id,
				post_id,
				recent ?? true,
				req.user?.user_id
			);
		} else {
			posts = await getPosts(
				category_id,
				user_id,
				post_id,
				recent ?? true
			);
		}

		return res.status(200).json(posts);
	} catch (err) {
		next(err);
	}
};

export const getHotPostsController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const posts = await getHotPostsByCategory(req.user?.user_id);
		return res.status(200).json(posts);
	} catch (err) {
		next(err);
	}
};

export const getPostSummaryStatsController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const stats = await getCategorySummaryStats();
		return res.status(200).json(stats);
	} catch (err) {
		next(err);
	}
};

export const deletePostController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		postIdParamSchema.parse(req.params);

		if (!req.user) {
			return res
				.status(401)
				.json({ message: 'Unauthorized: Please login first' });
		}

		const { post_id } = req.params;

		// Check existence BEFORE deleting
		const pool = await getDbConnection();
		const checkPost = await pool
			.request()
			.input('post_id', post_id)
			.query(
				`SELECT author_id FROM [dbo].[post] WHERE id = @post_id AND deleted_at IS NULL`
			);
		if (checkPost.recordset.length === 0) {
			return res.status(404).json({ message: 'Post not found' });
		}

		let deletedPost;
		if (req.user.role === 'admin') {
			deletedPost = await deletePost(post_id);
		} else {
			deletedPost = await deletePost(post_id, req.user.user_id);
		}

		if (!deletedPost) {
			// User tried to delete someone else's post
			return res.status(403).json({
				message: 'Forbidden: Not authorized to delete this post',
			});
		}

		return res
			.status(200)
			.json({ message: 'Post deleted', post: deletedPost });
	} catch (err) {
		next(err);
	}
};

export const updatePostController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		postIdParamSchema.parse(req.params);
		const parsed = updatePostSchema.parse(req.body);

		if (!req.user) {
			return res
				.status(401)
				.json({ message: 'Unauthorized: Please login first' });
		}

		const { post_id } = req.params;
		const { title, body_md } = parsed;
		// When category_id is omitted or empty => set to null per business rule
		const category_id: string | null = parsed.category_id ?? null;

		const pool = await getDbConnection();
		const checkPost = await pool
			.request()
			.input('post_id', post_id)
			.query(
				`SELECT author_id FROM [dbo].[post] WHERE id = @post_id AND deleted_at IS NULL`
			);

		if (checkPost.recordset.length === 0) {
			return res.status(404).json({ message: 'Post not found' });
		}

		const post = checkPost.recordset[0];
		if (post.author_id !== req.user.user_id) {
			return res.status(403).json({
				message: 'Forbidden: You are not the author of this post',
			});
		}

		// Overwrite main fields
		const updated = await updatePost(
			post_id,
			req.user.user_id,
			title,
			body_md,
			category_id
		);

		if (!updated) {
			return res.status(400).json({ message: 'Update failed' });
		}

		// Replace attachments: delete all and add new ones
		await clearAttachmentsByPost(post_id);
		const files = req.files as Express.Multer.File[];
		const newAttachments: Array<{
			id: string;
			post_id: string;
			url: string;
			mime_type: string | null;
			created_at: Date;
		}> = [];
		if (files && files.length > 0) {
			for (const file of files) {
				const fileUrl = `/uploads/${file.filename}`;
				const mimeType = file.mimetype;
				const att = await addAttachment(post_id, fileUrl, mimeType);
				newAttachments.push(att);
			}
		}

		return res.status(200).json({
			message: 'Post updated',
			post: updated,
			attachments: newAttachments,
		});
	} catch (err) {
		next(err);
	}
};

export const getAttachmentsController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const filename = req.params.filename;

		const parsed = getAttachmentsSchema.parse({ filename });

		const options = {
			root: 'uploads/',
		};

		res.sendFile(parsed.filename, options, (err) => {
			if (err) {
				res.status(404).send('File not found');
			}
		});
	} catch (err) {
		next(err);
	}
};
