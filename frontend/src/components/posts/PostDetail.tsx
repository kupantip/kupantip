'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ArrowUp, ArrowDown, Ellipsis } from 'lucide-react';
import * as t from '@/types/dashboard/post';
import { User } from '@/types/dashboard/user';
import { getCommentByPostId } from '@/services/dashboard/getCommentByPostId';
import CommentBox from './CommentBox';
import { deletePost } from '@/services/user/delete_post';
import { deleteComment } from '@/services/delete_comment';
import { votePost, deletevotePost, voteComment, deletevoteComment } from '@/services/user/vote';
import { jwtDecode } from 'jwt-decode';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { Pen } from 'lucide-react';
import { Flag } from 'lucide-react';
import ReportModal from '@/app/posts/report/page';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from 'sonner';
import { useSidebar } from '../ui/sidebar';

type PostDetailProps = {
	post: t.Post;
	refresh: () => void;
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
	refreshComments: () => void;
};

const CommentItem = ({ comment, refreshComments }: CommentProps) => {
	const [showReplyBox, setShowReplyBox] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);

	const [isEditing, setIsEditing] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const {open : isSidebarOpen} = useSidebar();

	const [showReportCommentDialog, setShowReportCommentDialog] = useState(false);

	const menuRef = useRef<HTMLDivElement>(null);

	const { data: session } = useSession();
	const tokenPayload = session?.accessToken
		? jwtDecode<User>(session.accessToken)
		: null;
	const currentUserId = tokenPayload?.user_id;

	const [reportingComment, setReportingComment] = useState<t.Comment | null>(
		null
	);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				menuRef.current &&
				!menuRef.current.contains(event.target as Node)
			) {
				setMenuOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const handleUpVote = async (e: React.MouseEvent) => {
		e.stopPropagation();
		console.log('Upvote on',comment.id);
		try {
			if(!comment.liked_by_requesting_user){
				await voteComment({commentId: comment.id, value: 1});
				console.log('Upvote Comment Success');
			}else{
				await deletevoteComment(comment.id);
				console.log('Delete Upvote Success')
			}
		} catch (err: unknown) {
			console.error("Upvote failed:", err)
		} finally {
			refreshComments();
		}
	};

	const handleDownVote = async (e: React.MouseEvent) => {
		e.stopPropagation();
		console.log('Downvote on',comment.id);
		try {
			if(!comment.disliked_by_requesting_user){
				await voteComment({commentId: comment.id, value: -1});
				console.log('Downvote Comment Success');
			}else{
				await deletevoteComment(comment.id);
				console.log('Delete Downvote Success')
			}
		} catch (err: unknown) {
			console.error("Downvote failed:", err);
		} finally {
			refreshComments();
		}
	};

	const handleEditComment = async (e: React.MouseEvent) => {
		e.stopPropagation();
		console.log('Edit Comment on', comment.id);
		setMenuOpen(false);
		setIsEditing(true);
	};

	const handleDeleteComment = async (e: React.MouseEvent) => {
		e.stopPropagation();
		console.log('Delete Comment on', comment.id);
		try {
			await deleteComment(comment.id);
			console.log('Delete comment', comment.id, ' success');
			toast.warning('Comment deleted successfully!')
			refreshComments();
		} catch {
			console.log('Delete Failed');
			toast.error('Failed to delete comment. Please try again.')
		}
	};

	const handleReportComment = async (e: React.MouseEvent) => {
		e.stopPropagation();
		console.log('Report Comment on', comment.id);
		setMenuOpen(false);
		setReportingComment(comment);
		setShowReportCommentDialog(true)
	};

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
							{formatTime(comment.minutes_since_commented || 0)}
						</span>
					</div>

                    {isEditing ? (
                        <CommentBox
                            className="mt-2"
                            postId={comment.post_id}
                            parentId={comment.parent_id || ''}
                            refresh={refreshComments}
                            onClose={() => setIsEditing(false)}
                            editComment={{ id: comment.id, body_md: comment.body_md }}
                        />
                    ) : (
                        <p className="text-gray-700 mt-1">{comment.body_md}</p>
                    )}
					{!isEditing &&
						<div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
							<div className="flex items-center gap-1 px-2 py-1">
							<ArrowUp
								className={`w-5 h-5 cursor-pointer p-1 hover:bg-gray-100 rounded-full
									${comment.liked_by_requesting_user ? "bg-green-400 text-black" : "hover:bg-gray-200"}`}
								onClick={handleUpVote}
							/>
							<span>{comment.vote_score}</span>
							<ArrowDown
								className={`w-5 h-5 cursor-pointer p-1 hover:bg-gray-100 rounded-full
									${comment.disliked_by_requesting_user ? "bg-red-400 text-black" : "hover:bg-gray-200"}`}
								onClick={handleDownVote}
							/>
							</div>
							<div
								className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-gray-100 cursor-pointer"
								onClick={() => setShowReplyBox(!showReplyBox)}
							>
								<MessageSquare className="w-4 h-4" />
								<span>Reply</span>
							</div>
							<div
								className="flex items-center gap-1 px-2 py-1 "
								onClick={(e) => {
									e.stopPropagation();
									setMenuOpen(!menuOpen);
								}}
							>
								<button
									className="p-1 rounded-full hover:bg-gray-100 cursor-pointer"
									onClick={(e) => {
										e.stopPropagation();
										setMenuOpen(!menuOpen);
									}}
								>
									<Ellipsis />
								</button>
							{comment.author_id === currentUserId ? (
								<AnimatePresence>
									{menuOpen && (
										<motion.div
											ref={menuRef}
											className="absolute mt-32 w-24 bg-white shadow-md rounded-lg"
											initial={{ opacity: 0, x: 0, y: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
											transition={{ duration: 0.15 }}
										>
											<button
												className="flex w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:rounded-t-lg cursor-pointer"
												onClick={handleEditComment}
											>
												<Pen className="px-1 mr-2" />
												<span className="mt-0.5">Edit</span>
											</button>
											<button
												className="flex w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:rounded-b-lg cursor-pointer"
												onClick={() => setIsDeleting(true)}
											>
												<Trash2 className="mr-2" />
												<span className="mt-0.5">
													Delete
												</span>
											</button>
										</motion.div>
									)}
								</AnimatePresence>
							) : (
								<AnimatePresence>
									{menuOpen && (
										<motion.div
											ref={menuRef}
											className="absolute mt-22 w-24 bg-white shadow-md rounded-lg"
											initial={{ opacity: 0, x: 0, y: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
											transition={{ duration: 0.15 }}
										>
											<button
												className="flex gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:rounded-t-lg cursor-pointer"
												onClick={handleReportComment}
											>
												<Flag />
												<span className="mt-0.5">
													Report
												</span>
											</button>
										</motion.div>
									)}
								</AnimatePresence>
							)}
							</div>
						</div>
					}


					<AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
						<AlertDialogContent className={isSidebarOpen ? "ml-32" : "ml-6"}>
							<AlertDialogHeader>
								<AlertDialogTitle>Delete comment?</AlertDialogTitle>
								<AlertDialogDescription>
									Are you sure you want to delete your comment? You can&apos;t undo this.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel
									type="button"
									onClick={() => setIsDeleting(false)}
									className='cursor-pointer'
								>
									Cancel
								</AlertDialogCancel>
								<AlertDialogAction
									type="submit"
									onClick={handleDeleteComment}
									className='cursor-pointer hover:bg-red-700 bg-red-600'
								>
									Delete
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>

					{showReplyBox && (
						<CommentBox
							className="mt-2"
							postId={comment.post_id}
							parentId={comment.id}
							refresh={refreshComments}
							onClose={() => setShowReplyBox(false)}
						/>
					)}

					{comment.replies.length > 0 && (
						<div className="pl-5 border-l border-gray-200 mt-2">
							{comment.replies.map((reply) => (
								<CommentItem key={reply.id} comment={reply} refreshComments={refreshComments} />
							))}
						</div>
					)}
				</div>
			</div>
			{reportingComment && (
				<ReportModal
					targetType="comment"
					target={comment}
					open={showReportCommentDialog}
					onOpenChange={setShowReportCommentDialog}
				></ReportModal>
			)}
		</div>
	);
};

export default function PostDetail({ post, refresh }: PostDetailProps) {
	const [reportingPost, setReportingPost] = useState<t.Post | null>(null);
	const [showReportPostDialog, setShowReportPostDialog] = useState(false);

	const { data: session } = useSession();
	const tokenPayload = session?.accessToken
		? jwtDecode<User>(session.accessToken)
		: null;
	const currentUserId = tokenPayload?.user_id;

	const [menuOpen, setMenuOpen] = useState(false);
	const router = useRouter();
	const menuRef = useRef<HTMLDivElement>(null);

	const {open: isSidebarOpen} = useSidebar();
	const [isDeleting, setIsDeleting] = useState(false);

	const{
		data: commentsData,
		isLoading: loadingComments,
		refetch: refreshComments
	} = useQuery({
		queryKey: ['comments', post.id, currentUserId],
		queryFn: () => getCommentByPostId(post.id),
		enabled: !!post.id,
	})

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				menuRef.current &&
				!menuRef.current.contains(event.target as Node)
			) {
				setMenuOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const handleUpVote = async (e: React.MouseEvent) => {
		e.stopPropagation();
		console.log('Upvote on');
		try {
			if(!post.liked_by_requesting_user){
				await votePost({postId: post.id, value: 1});
				console.log('Upvote Post Success');
			} else {
				await deletevotePost(post.id);
				console.log('Delete Upvote Success');
			}
		} catch {
		} finally {
			refresh();
		}
	};

	const handleDownVote = async (e: React.MouseEvent) => {
		e.stopPropagation();
		console.log('Downvote on');
		try {
			if(!post.disliked_by_requesting_user){
				await votePost({postId: post.id, value: -1});
				console.log('Downvote Post Success');
			} else {
				await deletevotePost(post.id);
				console.log('Delete Downvote Success');
			}
		} catch {
		} finally {
			refresh();
		}
	};

	const handleEdit = async (e: React.MouseEvent) => {
		e.stopPropagation();
		setMenuOpen(false);
		console.log('Edit on', post.id);
		router.push(`/posts/${post.id}/edit`);
	};

	const handleDelete = async (e: React.MouseEvent) => {
		e.stopPropagation();
		setMenuOpen(false);
		try {
			await deletePost(post.id);
			console.log('Delete post', post.id, ' success');
			router.push(`/posts/category/${post.category_id}`);
			toast.warning('Post deleted successfully!')
		} catch {
			console.log('Delete Failed');
			toast.error('Failed to delete comment. Please try again.')
		}
	};

	const handleReportPost = async (e: React.MouseEvent) => {
		e.stopPropagation();
		console.log('Report on', post.id);
		setMenuOpen(false);
		setReportingPost(post);
		setShowReportPostDialog(true);
	};

	return (
		<div className="flex flex-col items-center py-10">
			{/* Post Card */}
			<div className="w-full max-w-3xl bg-white dark:bg-gray-9 rounded-lg shadow-md p-6 space-y-4">
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
					<div className="ml-auto relative">
						<button
							className="p-1 rounded-lg hover:bg-gray-200 cursor-pointer"
							onClick={(e) => {
								e.stopPropagation();
								setMenuOpen(!menuOpen);
							}}
						>
							<Ellipsis />
						</button>

						{post.author_id === currentUserId ? (
							<AnimatePresence>
								{menuOpen && (
									<motion.div
										ref={menuRef}
										className="absolute mt-2 w-24 right-0 bg-white shadow-md rounded-lg"
										initial={{ opacity: 0, x: 0, y: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										transition={{ duration: 0.15 }}
									>
										<button
											className="flex w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:rounded-t-lg cursor-pointer"
											onClick={handleEdit}
										>
											<Pen className="px-1 mr-2" />
											<span className="mt-0.5">Edit</span>
										</button>
										<button
											className="flex w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:rounded-b-lg cursor-pointer"
											onClick={() => setIsDeleting(true)}
										>
											<Trash2 className="mr-2" />
											<span className="mt-0.5">
												Delete
											</span>
										</button>
									</motion.div>
								)}
							</AnimatePresence>
						) : (
							<AnimatePresence>
								{menuOpen && (
									<motion.div
										ref={menuRef}
										className="absolute mt-2 w-24 right-0 bg-white shadow-md rounded-lg"
										initial={{ opacity: 0, x: 0, y: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										transition={{ duration: 0.15 }}
									>
										<button
											className="flex gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:rounded-t-lg cursor-pointer"
											onClick={handleReportPost}
										>
											<Flag />
											<span className="mt-0.5">
												Report
											</span>
										</button>
									</motion.div>
								)}
							</AnimatePresence>
						)}
					</div>
				</div>

				{/* Post Content */}
				<h2 className="text-lg font-medium">{post.title}</h2>
				{post.attachments.length > 0 &&
					post.attachments.map((attachment) => (
						<Image
							key={attachment.id}
							src={attachment.url.replace(
								'/uploads/',
								'/backend/post/attachments/'
							)}
							alt="Post attachment"
							width={300}
							height={200}
							className="w-full h-auto object-cover rounded-lg mb-4"
						/>
					))}

				<div>{post.body_md}</div>

				{/* Post Actions */}
				<div className="flex items-center gap-6 text-gray-600">
					<div className="flex items-center gap-2">
						<ArrowUp
							className={`w-5 h-5 cursor-pointer p-1 hover:bg-gray-100 rounded-full
								${
									post.liked_by_requesting_user
										? 'bg-green-400 text-black'
										: 'hover:bg-gray-200'
								}`}
							onClick={handleUpVote}
						/>
						<span>{post.vote_score}</span>
						<ArrowDown
							className={`w-5 h-5 cursor-pointer p-1 hover:bg-gray-100 rounded-full
								${
									post.disliked_by_requesting_user
										? 'bg-red-400 text-black'
										: 'hover:bg-gray-200'
								}`}
							onClick={handleDownVote}
						/>
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
				refresh={refreshComments}
			/>

			{/* Comments Section */}
			<div className="w-full max-w-3xl mt-6 space-y-4">
				{loadingComments ? (
					<p className="text-gray-500 italic">Loading comments...</p>
				) : commentsData && commentsData.comments.length > 0 ? (
					commentsData.comments.map((comment) => (
						<CommentItem key={comment.id} comment={comment} refreshComments={refreshComments} />
					))
				) : (
					<p className="text-gray-500 italic">No comments yet.</p>
				)}
			</div>

			{reportingPost && (
				<ReportModal
					targetType="post"
					target={post}
					open={showReportPostDialog}
					onOpenChange={setShowReportPostDialog}
				></ReportModal>
			)}

			<AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
				<AlertDialogContent className={isSidebarOpen ? "ml-32" : "ml-6"}>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete post?</AlertDialogTitle>
						<AlertDialogDescription>
							Once you delete this post, it can&apos;t be restored.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel
							type="button"
							onClick={() => setIsDeleting(false)}
							className='cursor-pointer'
						>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							type="submit"
							onClick={handleDelete}
							className='cursor-pointer hover:bg-red-700 bg-red-600'
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
