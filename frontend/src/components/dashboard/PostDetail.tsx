'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, ArrowUp, ArrowDown, Ellipsis } from 'lucide-react';
import * as t from '@/types/dashboard/post';
import { getCommentByPostId } from '@/hooks/dashboard/getCommentByPostId';
import CommentBox from './CommentBox';

type PostDetailProps = {
	post: t.Post;
};

const formatTime = (minutes: number) => {
	if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
	if (minutes < 1440)
		return `${Math.floor(minutes / 60)} hour${
			Math.floor(minutes / 60) !== 1 ? 's' : ''
		} ago`;
	return `${Math.floor(minutes / 1440)} day${
		Math.floor(minutes / 1440) !== 1 ? 's' : ''
	} ago`;
};

// Recursive Comment Component
type CommentProps = {
	comment: t.Comment & { replies: t.Comment[] };
};

const CommentItem = ({ comment }: CommentProps) => {
	const [showReplyBox, setShowReplyBox] = useState(false);

	return (
		<div className="mb-4">
			<div className="flex items-start gap-3">
				<Avatar className="w-8 h-8">
					<AvatarImage src="/chicken.png" alt={comment.author_name} />
					<AvatarFallback>
						{comment.author_name.charAt(0)}
					</AvatarFallback>
				</Avatar>
				<div className="flex-1">
					<div className="flex items-center gap-2 text-sm">
						<span className="font-semibold">
							{comment.author_name}
						</span>
						<span className="text-gray-400">
							{formatTime(1000)}
						</span>
					</div>
					<p className="text-gray-700 mt-1">{comment.body_md}</p>

					<div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
						<div className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-gray-100 cursor-pointer">
							<ArrowUp className="w-4 h-4" />
							<span>100</span>
							<ArrowDown className="w-4 h-4" />
						</div>
						<div
							className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-gray-100 cursor-pointer"
							onClick={() => setShowReplyBox(!showReplyBox)}
						>
							<MessageSquare className="w-4 h-4" />
							<span>Reply</span>
						</div>
					</div>

					{showReplyBox && (
						<CommentBox
							className="mt-2"
							postId={comment.post_id}
							parentId={comment.id}
						/>
					)}

					{comment.replies.length > 0 && (
						<div className="pl-5 border-l border-gray-200 mt-2">
							{comment.replies.map((reply) => (
								<CommentItem key={reply.id} comment={reply} />
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default function PostDetail({ post }: PostDetailProps) {
	const [commentsData, setCommentsData] = useState<t.CommentsResponse | null>(
		null
	);
	const [loadingComments, setLoadingComments] = useState(true);

	useEffect(() => {
		const fetchComments = async () => {
			try {
				const data = await getCommentByPostId(post.id);
				setCommentsData(data);
			} catch (error) {
				console.error(error);
			} finally {
				setLoadingComments(false);
			}
		};
		fetchComments();
	}, [post.id]);

	return (
		<div className="flex flex-col items-center py-10">
			{/* Post Card */}
			<div className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 space-y-4">
				{/* Header */}
				<div className="flex items-center gap-3">
					<Avatar className="w-10 h-10">
						<AvatarImage
							src="/chicken.png"
							alt={post.author_name}
						/>
						<AvatarFallback>
							{post.author_name.charAt(0)}
						</AvatarFallback>
					</Avatar>
					<div className="flex-1 flex flex-col text-sm">
						<span className="font-semibold">
							{post.author_name}
						</span>
						<span className="text-gray-400">
							{formatTime(post.minutes_since_posted)}
						</span>
					</div>
					<button className="p-1 rounded hover:bg-gray-200">
						<Ellipsis />
					</button>
				</div>

				{/* Post Content */}
				<h2 className="text-lg font-medium">{post.title}</h2>
				{post.attachments.length > 0 && (
					<img
						src={post.attachments[0].url}
						alt="Post attachment"
						className="w-full h-auto object-cover rounded-lg"
					/>
				)}

				<div>{post.body_md}</div>

				{/* Post Actions */}
				<div className="flex items-center gap-6 text-gray-600">
					<div className="flex items-center gap-2">
						<ArrowUp className="w-5 h-5 cursor-pointer p-1 hover:bg-gray-100 rounded-full" />
						<span>{post.vote_count}</span>
						<ArrowDown className="w-5 h-5 cursor-pointer p-1 hover:bg-gray-100 rounded-full" />
					</div>
					<div className="flex items-center gap-2 cursor-pointer hover:text-blue-600">
						<MessageSquare className="w-5 h-5" />
						<span>{post.comment_count} comments</span>
					</div>
				</div>
			</div>

			{/* Comment Box */}
			<CommentBox
				className="w-full max-w-3xl mt-4"
				postId={post.id}
				parentId=""
			/>

			{/* Comments Section */}
			<div className="w-full max-w-3xl mt-6 space-y-4">
				{loadingComments ? (
					<p className="text-gray-500 italic">Loading comments...</p>
				) : commentsData && commentsData.comments.length > 0 ? (
					commentsData.comments.map((comment) => (
						<CommentItem key={comment.id} comment={comment} />
					))
				) : (
					<p className="text-gray-500 italic">No comments yet.</p>
				)}
			</div>
		</div>
	);
}
