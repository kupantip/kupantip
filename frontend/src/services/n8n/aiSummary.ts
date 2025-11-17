import axios from 'axios';

const instance = axios.create({
	baseURL: '/api/proxy/n8n',
	timeout: 35000, // 35 seconds (n8n has 30s timeout + buffer)
});

export type AISummaryResponse = {
	message: string;
	data: {
		post_id: string;
		title: string;
		body: string;
	};
	ai_summary: string;
};

export async function getAISummary(postId: string): Promise<AISummaryResponse> {
	try {
		const response = await instance.get<AISummaryResponse>(
			`/post/${postId}`
		);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			throw new Error(
				error.response?.data?.message || 'Failed to generate AI summary'
			);
		}
		throw new Error('An unexpected error occurred');
	}
}
