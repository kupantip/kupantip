'use client';

import { useSession } from 'next-auth/react';
import { usePostByUserId } from '@/services/post/post';
import { Spinner } from '@/components/ui/spinner';
import { PostItem } from '@/components/posts/PostItem';
import { useEffect, useState } from 'react';

export default function MyPostsPage() {
	const session = useSession();
	const [userId, setUserId] = useState<string | null>(null);

	useEffect(() => {
		console.log(session);
		if (session.data?.user?.user_id) {
			setUserId(session.data.user.user_id);
		}
	}, [session]);

	const {
		data: posts,
		isLoading: isLoadingPost,
		isError,
		error,
	} = usePostByUserId(userId ?? '');

	if (status === 'loading' || isLoadingPost) {
		return (
			<div className="flex justify-center items-center h-96">
				<Spinner className="w-8 h-8" />
			</div>
		);
	}

	if (isError) {
		// If the error is a 400 Bad Request (likely no posts for user), show a friendly UI
		const isNoPosts =
			error instanceof Error &&
			error.message.includes('Failed to fetch post by user id: 400');
		if (isNoPosts) {
			return (
				<div className="flex flex-col items-center justify-center h-96 text-gray-500">
					<span className="text-lg font-semibold mb-2">
						You have no posts yet.
					</span>
					<span className="text-sm">
						Start sharing your thoughts by creating a new post!
					</span>
				</div>
			);
		}
		return (
			<div className="flex justify-center items-center h-96 text-red-500">
				{error instanceof Error
					? error.message
					: 'Failed to load posts.'}
			</div>
		);
	}

	if (!posts || posts.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center h-96 text-gray-500">
				<span className="text-lg font-semibold">
					You have no posts yet.
				</span>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-grey-3 py-8 px-2">
			<div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6 mt-5">
				<h1 className="text-2xl font-bold mb-6 text-gray-800">
					My Posts
				</h1>
				<div className="space-y-4">
					{posts.map((post) => (
						<PostItem
							key={post.id}
							id={post.id}
							title={post.title}
							author={post.author_name}
							category={post.category_label}
							time={post.minutes_since_posted}
							comments={post.comment_count}
							attachments={post.attachments}
							authorId={post.author_id}
							likeCount={post.like_count}
							likedByUser={post.liked_by_requesting_user}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
