import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { getPostForN8n } from '../models/n8n.model';
import { env } from '../config/env';

const postIdSchema = z.object({
	post_id: z.string().uuid('Invalid post ID format'),
});

export const getAISummaryController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { post_id } = postIdSchema.parse(req.params);

		const post = await getPostForN8n(post_id);

		if (!post) {
			return res.status(404).json({ message: 'Post not found' });
		}

		// Send data to n8n webhook
		const n8nWebhookUrl = env.n8nWebhookUrl;

		if (!n8nWebhookUrl) {
			return res
				.status(500)
				.json({ message: 'N8N webhook URL not configured' });
		}

		// Build URL with query parameters
		const url = new URL(n8nWebhookUrl);
		url.searchParams.append('post_id', post.id);
		url.searchParams.append('title', post.title);
		url.searchParams.append('body', post.body_md);

		const response = await fetch(url.toString(), {
			method: 'GET',
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('N8N webhook error:', {
				status: response.status,
				statusText: response.statusText,
				body: errorText,
			});
			return res.status(500).json({
				message: 'Failed to send data to n8n',
				error: errorText,
				status: response.status,
			});
		}

		// Get response data from n8n (if available)
		let aiSummaryResponse = null;
		try {
			const contentType = response.headers.get('content-type');
			if (contentType && contentType.includes('application/json')) {
				aiSummaryResponse = await response.json();
			} else {
				aiSummaryResponse = await response.text();
			}
		} catch (err) {
			console.log('No response body from AI summary service');
		}

		return res.status(200).json({
			message: 'AI summary generated successfully',
			data: {
				post_id: post.id,
				title: post.title,
				body: post.body_md,
			},
			...(aiSummaryResponse && { ai_summary: aiSummaryResponse }),
		});
	} catch (err) {
		console.error('Error in getAISummaryController:', err);
		next(err);
	}
};
