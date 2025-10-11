'use client';

import PostDetail from '@/components/dashboard/PostDetail';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import * as t from '@/types/dashboard/post';
import { getPostById } from '@/services/dashboard/getPostById';

import { Button } from '@/components/ui/button';
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from '@/components/ui/empty';
import { Loader2, Folder } from 'lucide-react';

export default function PostPage() {
	const params = useParams();
	const postId = Array.isArray(params.postId)
		? params.postId[0]
		: params.postId;

	const [post, setPost] = useState<t.Post[] | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!postId) return;

		const fetchPost = async () => {
			setLoading(true);
			try {
				const data: t.Post[] = await getPostById(postId);
				setPost(data);
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		};
		fetchPost();
	}, [postId]);

	// Loading state
	if (loading) {
		return (
			<div className="flex justify-center items-center h-[60vh]">
				<Empty>
					<EmptyHeader>
						<EmptyMedia>
							<Loader2 className="animate-spin w-8 h-8" />
						</EmptyMedia>
						<EmptyTitle>Loading Post...</EmptyTitle>
						<EmptyDescription>
							Please wait while we fetch the post for you.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			</div>
		);
	}

	// Post not found / invalid ID
	if (!post || post.length === 0) {
		return (
			<div className="flex justify-center items-center h-[60vh]">
				<Empty>
					<EmptyHeader>
						<EmptyMedia>
							<Folder className="w-8 h-8" />
						</EmptyMedia>
						<EmptyTitle>Post Not Found</EmptyTitle>
						<EmptyDescription>
							The post you are looking for doesn&apos;t exist or
							may have been removed.
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<div className="flex gap-2">
							<Button onClick={() => window.history.back()}>
								Go Back
							</Button>
							<Button
								variant="outline"
								onClick={() =>
									(window.location.href = '/dashboard')
								}
							>
								Go to Dashboard
							</Button>
						</div>
					</EmptyContent>
				</Empty>
			</div>
		);
	}

	// Display post
	return <PostDetail post={post[0]} />;
}
