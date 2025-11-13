'use client';

import PostDetail from '@/components/posts/PostDetail';
import { useParams, useSearchParams } from 'next/navigation';
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
import { useAnnouncementById } from '@/services/announcement/announcement';

export default function PostPage() {
	const params = useParams();
	const searchParams = useSearchParams();
	const isAnnouncement = searchParams.get('type') === 'announcement';

	const postId = Array.isArray(params.postId)
		? params.postId[0]
		: params.postId;

	const {
		data: post,
		isLoading: isLoadingPost,
		refetch: refetchPost,
	} = usePostDetail(postId || '');

	const { data: announcement, isLoading } = useAnnouncementById(postId || '');

	const refreshPage = async () => {
		refetchPost();
	};

	// Loading state
	if ((isAnnouncement && isLoading) || (!isAnnouncement && isLoadingPost)) {
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

	// Transform announcement data to post format if needed
	const displayPost =
		isAnnouncement && announcement
			? {
					id: announcement.id,
					title: announcement.title,
					body_md: announcement.body_md,
					url: '',
					created_at: announcement.create_at,
					updated_at: announcement.create_at,
					author_name: announcement.author_display_name,
					author_id: announcement.author_id,
					category_label: 'Announcement',
					category_color: '#10b981',
					category_id: '',
					attachments: [],
					minutes_since_posted: announcement.minutes_since_announced,
					comment_count: 0,
					vote_count: 0,
					vote_score: 0,
					like_count: 0,
					dislike_count: 0,
					liked_by_requesting_user: false,
					disliked_by_requesting_user: false,
			  }
			: post;

	// Post not found / invalid ID
	if (!displayPost) {
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
	return (
		<div>
			<PostDetail post={displayPost} refresh={refreshPage} />
		</div>
	);
}
