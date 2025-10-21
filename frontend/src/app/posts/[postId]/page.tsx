'use client';

import PostDetail from '@/components/posts/PostDetail';
import { useParams } from 'next/navigation';
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
import { usePostDetail } from '@/services/post/post';

export default function PostPage() {
	const params = useParams();
	const postId = Array.isArray(params.postId)
		? params.postId[0]
		: params.postId;

	const { data: post, isLoading: isLoadingPost } = usePostDetail(
		postId || ''
	);

	// Loading state
	if (isLoadingPost) {
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
	if (!post) {
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
	return <PostDetail post={post} />;
}
