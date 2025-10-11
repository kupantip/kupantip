import * as t from '@/types/dashboard/post';

const BACKEND_HOST = process.env.NEXT_PUBLIC_BACKEND_HOST;

interface Content {
    post_id: string
	parent_id: string;
	body_md: string;
}

export async function postComment(body: {
	content: Content;
}): Promise<boolean> {
	try {

		const res = await fetch(
			`${BACKEND_HOST}/comment?post_id=${body.content.post_id}`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body.content),
				credentials: 'include',
			}
		);

		if (!res.ok) {
			throw new Error(
				`Failed to post data: ${res.status} ${res.statusText}`
			);
		}

		const json: t.CommentsResponse = await res.json();
		return true;
	} catch (err: unknown) {
		if (err instanceof Error) {
			throw new Error(err.message);
		} else {
			throw new Error(String(err));
		}
	}
}
