'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, ArrowUp, ArrowDown, Ellipsis } from 'lucide-react';
import * as t from '@/types/dashboard/post';
import { useCommentsByPostId } from '@/services/dashboard/getCommentByPostId';
import CommentBox from './CommentBox';
import { fetchDeletePost } from '@/services/post/post';
import {
	upvotePost,
	downvotePost,
	deletevotePost,
	useUserVote,
} from '@/services/user/vote';

type PostProps = {
	post: t.Post;
};

const daySincePosted = (minutes: number) => {
	if (minutes < 60) {
		return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
	} else if (minutes < 1440) {
		const hours = Math.floor(minutes / 60);
		return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
	} else {
		const days = Math.floor(minutes / 1440);
		return `${days} day${days !== 1 ? 's' : ''} ago`;
	}
};

// ----- Comment component (recursive) -----
type CommentProps = {
	comment: t.Comment & { replies: t.Comment[] };
};

function Comment({ comment }: CommentProps) {
	const [displayCommentBox, setDisplayCommentBox] = useState(false);

	const handleUpVote = async (e: React.MouseEvent) => {
		e.stopPropagation();
		console.log('Upvote on');
	};

	const handleDownVote = async (e: React.MouseEvent) => {
		e.stopPropagation();
		console.log('Downvote on');
	};

	const handleOpenComment = async (e: React.MouseEvent) => {
		e.stopPropagation();
		console.log('Comment on');
		setDisplayCommentBox(true);
	};

	return (
		<div className="mb-3">
			{/* Single comment */}
			<div className="flex items-center gap-2 text-sm mb-1">
				<span className="font-semibold">{comment.author_name}</span>
				<span className="text-gray-400 text-xs">
					{daySincePosted(1000)}{' '}
					{/* replace with comment.minutes if you have it */}
				</span>
			</div>
			<div className="text-sm mb-1">{comment.body_md}</div>

			<div className="flex flex-wrap gap-1 items-center text-sm text-gray-600 pt-3">
				<div className="flex items-center gap-1  px-2 py-1 rounded-xl h-8">
					<ArrowUp
						className="w-6 h-6 p-1 rounded-full border border-gray-200 hover:bg-gray-300"
						onClick={handleUpVote}
					/>
					<span>100</span>
					<ArrowDown
						className="w-6 h-6 p-1 rounded-full border border-gray-200 hover:bg-gray-300"
						onClick={handleDownVote}
					/>
				</div>

				<div
					className="flex items-center gap-1  px-2 py-1 rounded-xl hover:bg-gray-300 h-8"
					onClick={handleOpenComment}
				>
					<MessageSquare className="w-4 h-4" />
					<span>10</span>
				</div>

				{/* <div
                        className="flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-xl hover:bg-gray-300 h-8"
                        onClick={handleShare}
                    >
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                    </div> */}
			</div>

			{displayCommentBox && (
				<div>
					<CommentBox
						className="w-full max-w-2xl mb-4"
						postId={comment.post_id}
						parentId={comment.id}
						refresh={() => {}}
					/>
				</div>
			)}

			{/* Nested replies */}
			{comment.replies.length > 0 && (
				<div className="pl-5 border-l border-gray-200">
					{comment.replies.map((reply) => (
						<Comment key={reply.id} comment={reply} />
					))}
				</div>
			)}
		</div>
	);
}

export default function InnerPost({ post }: PostProps) {
	const router = useRouter();
	const { userVote, updateUserVote } = useUserVote(post.id, post.author_id);
	const [menuOpen, setMenuOpen] = useState(false);

	const { data: commentsData, isLoading: loading } = useCommentsByPostId(
		post.id
	);

	if (loading) return <p>Loading comments...</p>;

	const handlePost = () => console.log('Click on a post:', post.id);

	const handleUpVote = async (e: React.MouseEvent) => {
		e.stopPropagation();
		console.log('Upvote on:', post.id);
		let newVote = userVote;

		if (userVote === 1) {
			newVote = 0;
			try {
				await deletevotePost(post.id);
				console.log('Undo UpVote success');
			} catch {
				// Handle error silently
			}
		} else {
			newVote = 1;
			try {
				await upvotePost(post.id);
				console.log('UpVote Post Success', post.id);
			} catch {
				// Handle error silently
			}
		}

		updateUserVote(newVote);
	};

	const handleDownVote = async (e: React.MouseEvent) => {
		e.stopPropagation();
		console.log('Downvote on:', post.id);
		let newVote = userVote;

		if (userVote === -1) {
			newVote = 0;
			try {
				await deletevotePost(post.id);
				console.log('Undo DownVote success');
			} catch {
				// Handle error silently
			}
		} else {
			newVote = -1;
			try {
				await downvotePost(post.id);
				console.log('DownVote Post Success', post.id);
			} catch {
				// Handle error silently
			}
		}

		updateUserVote(newVote);
	};

	const toggleComments = (e: React.MouseEvent) => {
		e.stopPropagation();
		// setShowComments(!showComments)
	};

	const handleEdit = async (e: React.MouseEvent) => {
		e.stopPropagation();
		setMenuOpen(false);
		console.log('Edit on', post.id);
		router.push(`/dashboard/${post.id}/edit`);
	};

	const handleDelete = async (e: React.MouseEvent) => {
		e.stopPropagation();
		setMenuOpen(false);
		try {
			await fetchDeletePost(post.id);
			console.log('Delete post', post.id, ' success');
			router.push('/dashboard');
		} catch {
			console.log('Delete Failed');
		}
	};

	return (
		<div className="flex flex-col items-center">
			{/* Post */}
			<div
				className="w-[100vw] max-w-2xl rounded-md hover:bg-gray-50 px-4 py-3 cursor-pointer m-10"
				onClick={handlePost}
			>
				{/* Header */}
				<div className="flex items-center gap-2 mb-2 px-3 pt-1">
					<Avatar className="w-8 h-8">
						<AvatarImage
							src="/chicken.png"
							alt={post.author_name}
						/>
						<AvatarFallback>
							{post.author_name.charAt(0)}
						</AvatarFallback>
					</Avatar>
					<div className="flex flex-col text-sm">
						<span className="font-semibold">
							{post.author_name}
						</span>
						<span className="text-gray-500">
							{daySincePosted(post.minutes_since_posted)}
						</span>
					</div>
					<div className="ml-auto relative">
						<button
							className="p-1 rounded-lg hover:bg-gray-200"
							onClick={(e) => {
								e.stopPropagation();
								setMenuOpen(!menuOpen);
							}}
						>
							<Ellipsis />
						</button>
						{menuOpen && (
							<div className="absolute mt-2 w-24 right-0 bg-white shadow rounded-lg">
								<button
									className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
									onClick={handleEdit}
								>
									Edit
								</button>
								<button
									className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
									onClick={handleDelete}
								>
									Delete
								</button>
							</div>
						)}
					</div>
				</div>

				{/* Actions */}
				<div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
					<div className="flex items-center gap-1">
						<ArrowUp
							className={`w-5 h-5 p-1 rounded hover:bg-gray-200 cursor-pointer
								${userVote === 1 ? 'bg-green-400 text-black' : 'hover:bg-gray-200'}`}
							onClick={handleUpVote}
						/>
						<span>{post.vote_score}</span>
						<ArrowDown
							className={`w-5 h-5 p-1 rounded hover:bg-gray-200 cursor-pointer
								${userVote === -1 ? 'bg-green-400 text-black' : 'hover:bg-gray-200'}`}
							onClick={handleDownVote}
						/>
					</div>
					<div
						className="flex items-center gap-1 hover:text-blue-600 cursor-pointer"
						onClick={toggleComments}
					>
						<MessageSquare className="w-4 h-4" />
						<span>{post.comment_count} comments</span>
					</div>
				</div>
			</div>

			<CommentBox
				className="w-full max-w-2xl mb-4"
				postId={post.id}
				parentId=""
				refresh={() => {}}
			/>

			{/* Comments section */}
			<div className="w-full max-w-2xl border-l border-gray-200 pl-5 mt-2">
				{commentsData && commentsData.comments.length > 0 ? (
					commentsData.comments.map((comment) => (
						<Comment key={comment.id} comment={comment} />
					))
				) : (
					<p className="text-gray-500 text-sm italic">
						No comments yet.
					</p>
				)}
			</div>
		</div>
	);
}
