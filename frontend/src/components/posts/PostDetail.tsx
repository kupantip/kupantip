'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import {
	MessageSquare,
	Ellipsis,
	ArrowLeft,
	Sparkles,
	Loader2,
	ChevronDown,
	ArrowBigDown,
	ArrowBigUp,
	Share2,
} from 'lucide-react';
import * as t from '@/types/dashboard/post';
import { useCommentsByPostId } from '@/services/comment/comment';
import CommentBox from './CommentBox';
import { fetchDeletePost } from '@/services/post/post';
import { fetchDeleteComment } from '@/services/comment/comment';
import {
	fetchVoteComment,
	fetchDeletevoteComment,
} from '@/services/comment/vote';
import {
	fetchDeletevotePost,
	fetchUpvotePost,
	fetchDownvotePost,
} from '@/services/post/vote';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Trash2, Pen, Flag, LogIn } from 'lucide-react';
import ReportModal from './ReportModal';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useSidebar } from '../ui/sidebar';
import { Button } from '../ui/button';
import Link from 'next/link';
import { getAISummary } from '@/services/n8n/aiSummary';
import { stat } from 'fs';

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
	const { open: isSidebarOpen } = useSidebar();

	const [showReportCommentDialog, setShowReportCommentDialog] =
		useState(false);

	const menuRef = useRef<HTMLDivElement>(null);

	const { data: session, status } = useSession();
	const currentUserId = session?.user.user_id;

	const [reportingComment, setReportingComment] = useState<t.Comment | null>(
		null
	);

	const router = useRouter();
	const [isAuthenAlert, setIsAuthenAlert] = useState(false);

	const handleUpVote = async (e: React.MouseEvent) => {
		e.stopPropagation();
		console.log('Upvote on', comment.id);

		if (status === 'unauthenticated') {
			setIsAuthenAlert(true);
		} else {
			try {
				if (!comment.liked_by_requesting_user) {
					await fetchVoteComment({ commentId: comment.id, value: 1 });
					console.log('Upvote Comment Success');
				} else {
					await fetchDeletevoteComment(comment.id);
					console.log('Delete Upvote Success');
				}
			} catch (err: unknown) {
				console.error('Upvote failed:', err);
			} finally {
				refreshComments();
			}
		}
	};

	const handleDownVote = async (e: React.MouseEvent) => {
		e.stopPropagation();
		console.log('Downvote on', comment.id);

		if (status === 'unauthenticated') {
			setIsAuthenAlert(true);
		} else {
			try {
				if (!comment.disliked_by_requesting_user) {
					await fetchVoteComment({ commentId: comment.id, value: -1 });
					console.log('Downvote Comment Success');
				} else {
					await fetchDeletevoteComment(comment.id);
					console.log('Delete Downvote Success');
				}
			} catch (err: unknown) {
				console.error('Downvote failed:', err);
			} finally {
				refreshComments();
			}
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
			await fetchDeleteComment(comment.id);
			console.log('Delete comment', comment.id, ' success');
			toast.warning('Comment deleted successfully!');
			refreshComments();
		} catch {
			console.log('Delete Failed');
			toast.error('Failed to delete comment. Please try again.');
		}
	};

	const handleReportComment = async (e: React.MouseEvent) => {
		e.stopPropagation();
		setMenuOpen(false);

		if (status === 'unauthenticated') {
			setIsAuthenAlert(true);
			return;
		}
		
		console.log('Report Comment on', comment.id);
		setReportingComment(comment);
		setShowReportCommentDialog(true);
	};

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

	return (
		<div className="mb-4">
			<div className="flex items-start gap-3">
				<Link href={`/profile/${comment.author_id}`}>
					<Avatar className="w-6 h-6 border-1 border-emerald-600">
						<AvatarImage
							src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.author_name}`}
							className="hover:brightness-75"
						/>
						<AvatarFallback>
							{comment.author_name.charAt(0)}
						</AvatarFallback>
					</Avatar>
				</Link>
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
							editComment={{
								id: comment.id,
								body_md: comment.body_md,
							}}
						/>
					) : (
						<p className="text-gray-700 mt-1">{comment.body_md}</p>
					)}
					{!isEditing && (
						<div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
							<div className="flex items-center gap-1 py-1">
								<ArrowBigUp
									className={`w-6 h-6 p-1 cursor-pointer hover:bg-gray-100 rounded-full
									${
										comment.liked_by_requesting_user
											? 'text-emerald-500 fill-emerald-500'
											: 'hover:bg-gray-200'
									}`}
									onClick={handleUpVote}
								/>
								<span>{comment.vote_score}</span>
								<ArrowBigDown
									className={`w-6 h-6 p-1 cursor-pointer hover:bg-gray-100 rounded-full
									${
										comment.disliked_by_requesting_user
											? 'text-red-500 fill-red-500'
											: 'hover:bg-gray-200'
									}`}
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
												initial={{
													opacity: 0,
													x: 0,
													y: 0,
												}}
												animate={{ opacity: 1 }}
												exit={{ opacity: 0 }}
												transition={{ duration: 0.15 }}
											>
												<button
													className="flex w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:rounded-t-lg cursor-pointer"
													onClick={handleEditComment}
												>
													<Pen className="px-1 mr-2" />
													<span className="mt-0.5">
														Edit
													</span>
												</button>
												<button
													className="flex w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:rounded-b-lg cursor-pointer"
													onClick={() =>
														setIsDeleting(true)
													}
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
												initial={{
													opacity: 0,
													x: 0,
													y: 0,
												}}
												animate={{ opacity: 1 }}
												exit={{ opacity: 0 }}
												transition={{ duration: 0.15 }}
											>
												<button
													className="flex gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:rounded-t-lg cursor-pointer"
													onClick={
														handleReportComment
													}
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
					)}

					<AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
						<AlertDialogContent
							className={isSidebarOpen ? 'ml-32' : 'ml-6'}
						>
							<AlertDialogHeader>
								<AlertDialogTitle>
									Delete comment?
								</AlertDialogTitle>
								<AlertDialogDescription>
									Are you sure you want to delete your
									comment? You can&apos;t undo this.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel
									type="button"
									onClick={() => setIsDeleting(false)}
									className="cursor-pointer"
								>
									Cancel
								</AlertDialogCancel>
								<AlertDialogAction
									type="submit"
									onClick={handleDeleteComment}
									className="cursor-pointer hover:bg-red-700 bg-red-600"
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
								<CommentItem
									key={reply.id}
									comment={reply}
									refreshComments={refreshComments}
								/>
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
			<AlertDialog open={isAuthenAlert} onOpenChange={setIsAuthenAlert}>
                <AlertDialogContent className={isSidebarOpen ? 'ml-32' : 'ml-6'}>
                    <AlertDialogHeader>
                        <div className="flex gap-2 text-red-500 items-center">
                            <LogIn className="w-5 h-5" />
                            <AlertDialogTitle>Authentication Required</AlertDialogTitle>
                        </div>
                        <AlertDialogDescription>
                            You need to act as a member to take an action on comment. <br/>
                            Please log in to continue.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel 
                             className="cursor-pointer"
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                             onClick={() => router.push('/signup')}
                             className="bg-emerald-700 hover:bg-emerald-800 cursor-pointer"
                        >
                            Log in / Sign up
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
		</div>
	);
};

export default function PostDetail({ post, refresh }: PostDetailProps) {
	const [reportingPost, setReportingPost] = useState<t.Post | null>(null);
	const [showReportPostDialog, setShowReportPostDialog] = useState(false);

	const searchParams = useSearchParams();
	const result = searchParams.get('r');
	const [copied, setCopied] = useState(false);

	const { data: session, status } = useSession();
	const currentUserId = session?.user.user_id;

	const [menuOpen, setMenuOpen] = useState(false);
	const router = useRouter();
	const menuRef = useRef<HTMLDivElement>(null);

	const { open: isSidebarOpen } = useSidebar();
	const [isDeleting, setIsDeleting] = useState(false);
	const [aiSummary, setAiSummary] = useState<string | null>(null);
	const [isLoadingAI, setIsLoadingAI] = useState(false);
	const [showAISummary, setShowAISummary] = useState(false);

	const [isAuthenAlert, setIsAuthenAlert] = useState(false);

	const {
		data: commentsData,
		isLoading: loadingComments,
		refetch: refreshComments,
	} = useCommentsByPostId(post.id);

	const handleUpVote = async (e: React.MouseEvent) => {
		e.stopPropagation();
		console.log('Upvote on');
		if (status === 'unauthenticated') {
			setIsAuthenAlert(true);
		} else {
			try {
				if (!post.liked_by_requesting_user) {
					await fetchUpvotePost(post.id);
					console.log('Upvote Post Success');
				} else {
					await fetchDeletevotePost(post.id);
					console.log('Delete Upvote Success');
				}
			} catch (err) {
				console.log(err);
			} finally {
				refresh();
			}
		}
	};

	const handleDownVote = async (e: React.MouseEvent) => {
		e.stopPropagation();
		console.log('Downvote on');
		if (status === 'unauthenticated') {
			setIsAuthenAlert(true)
		} else {
			try {
				if (!post.disliked_by_requesting_user) {
					await fetchDownvotePost(post.id);
					console.log('Downvote Post Success');
				} else {
					await fetchDeletevotePost(post.id);
					console.log('Delete Downvote Success');
				}
			} catch (err) {
				console.log(err);
			} finally {
				refresh();
			}
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
			await fetchDeletePost(post.id);
			console.log('Delete post', post.id, ' success');
			router.push(`/posts/category/${post.category_id}`);
			toast.warning('Post deleted successfully!');
		} catch {
			console.log('Delete Failed');
			toast.error('Failed to delete comment. Please try again.');
		}
	};

	const handleReportPost = async (e: React.MouseEvent) => {
		e.stopPropagation();
		setMenuOpen(false);

		if (status === 'unauthenticated') {
			setIsAuthenAlert(true);
			return;
		}

		console.log('Report on', post.id);
		setReportingPost(post);
		setShowReportPostDialog(true);
	};

	const handleBackButton = async () => {
		if (!result) {
			router.push('/posts');
		} else {
			router.back();
		}
	};

	const handleAISummary = async () => {
		setIsLoadingAI(true);
		try {
			const response = await getAISummary(post.id);
			setAiSummary(response.ai_summary);
			setShowAISummary(true);
			toast.success('AI Summary generated!', {
				position: 'bottom-right',
			});
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to generate AI summary';
			toast.error(errorMessage, {
				position: 'bottom-right',
			});
			console.error('AI Summary error:', error);
		} finally {
			setIsLoadingAI(false);
		}
	};

	const handleSharePost = async () => {
		try {
			await navigator.clipboard.writeText(window.location.href);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000); // Reset 'copied' state after 2 seconds
		} catch (err) {
			console.error('Failed to copy URL: ', err);
		}
	};

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

	return (
		<div className="h-full px-4 md:px-10 py-4 md:py-8 space-y-4 md:space-y-6 rounded-lg bg-gray-50 dark:bg-gray-900">
			<div className="relative w-full max-w-4xl mx-auto">
				{/* Back Button */}
				<Button
					variant="ghost"
					onClick={handleBackButton}
					className="mb-3 md:mb-5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 pl-0 md:pl-4 cursor-pointer"
				>
					<ArrowLeft className="w-4 h-4 mr-2" />
					{result ? `Back to ${result}` : 'Back to Posts'}
				</Button>
				{/* Post Card */}
				<div className="w-full bg-white dark:bg-gray-9 rounded-lg shadow-md p-4 md:p-6 space-y-4">
					{/* Header */}
					<div className="flex items-start md:items-center gap-3">
						<Link href={`/profile/${post.author_id}`}>
							<Avatar className="w-8 h-8 md:w-10 md:h-10 border-3 border-emerald-600 dark:border-emerald-700">
								<AvatarImage
									src={`https://api.dicebear.com/7.x/initials/svg?seed=${post.author_name}`}
									className="transition duration-200 hover:brightness-75"
								/>
								<AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold text-lg md:text-xl">
									{post.author_name.charAt(0).toUpperCase()}
								</AvatarFallback>
							</Avatar>
						</Link>

						<div className="flex-1 flex flex-col text-sm">
							<span className="font-semibold text-base md:text-sm">
								{post.author_name}
							</span>
							<span className="text-xs md:text-sm text-gray-400">
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
											<Button
												className="bg-white text-black cursor-pointer flex gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:rounded-t-lg"
												onClick={handleSharePost}
												disabled={copied}
											>
												<Share2 />
												<span className="mt-0.5">
													{copied
														? 'Copied!'
														: 'Share'}
												</span>
											</Button>
											<Button
												className="bg-white text-black cursor-pointer flex gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:rounded-t-lg"
												onClick={handleEdit}
											>
												<Pen />
												<span className="mt-0.5">
													Edit
												</span>
											</Button>
											<Button
												className="bg-white text-black cursor-pointer flex gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:rounded-t-lg"
												onClick={() =>
													setIsDeleting(true)
												}
											>
												<Trash2 />
												<span className="mt-0.5">
													Delete
												</span>
											</Button>
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
											<Button
												className="bg-white text-black cursor-pointer flex gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:rounded-t-lg"
												onClick={handleSharePost}
												disabled={copied}
											>
												<Share2 />
												<span className="mt-0.5">
													{copied
														? 'Copied!'
														: 'Share'}
												</span>
											</Button>
											<Button
												className="bg-white text-black cursor-pointer flex gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:rounded-t-lg"
												onClick={handleReportPost}
											>
												<Flag />
												<span className="mt-0.5">
													Report
												</span>
											</Button>
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
									'/api/proxy/post/attachments/'
								)}
								alt="Post attachment"
								width={300}
								height={200}
								className="w-full h-auto object-cover rounded-lg mb-4"
							/>
						))}
					<div>{post.body_md}</div>
					{/* AI Summary Section */}
					<div className="mt-4">
						{!aiSummary ? (
							<Button
								variant="outline"
								size="sm"
								onClick={handleAISummary}
								disabled={isLoadingAI}
								className="relative flex items-center gap-2 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all overflow-hidden group"
							>
								<span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 group-hover:animate-shimmer" />
								{isLoadingAI ? (
									<>
										<Loader2 className="w-4 h-4 animate-spin" />
										<span>Generating...</span>
									</>
								) : (
									<>
										<Sparkles className="w-4 h-4 animate-pulse" />
										<span>Generate AI Summary</span>
									</>
								)}
							</Button>
						) : (
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() =>
											setShowAISummary(!showAISummary)
										}
										className="flex items-center gap-2 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all cursor-pointer"
									>
										<Sparkles className="w-4 h-4" />
										<span>
											{showAISummary ? 'Hide' : 'Show'} AI
											Summary
										</span>
										<ChevronDown
											className={`w-4 h-4 transition-transform duration-300 ${
												showAISummary
													? 'rotate-180'
													: 'rotate-0'
											}`}
										/>
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={handleAISummary}
										disabled={isLoadingAI}
										className="flex items-center gap-2 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all cursor-pointer"
									>
										{isLoadingAI ? (
											<>
												<Loader2 className="w-4 h-4 animate-spin" />
												<span>Regenerating...</span>
											</>
										) : (
											<>
												<Sparkles className="w-4 h-4" />
												<span>Regenerate</span>
											</>
										)}
									</Button>
								</div>

								<AnimatePresence>
									{showAISummary && (
										<motion.div
											initial={{
												opacity: 0,
												height: 0,
												y: -10,
											}}
											animate={{
												opacity: 1,
												height: 'auto',
												y: 0,
											}}
											exit={{
												opacity: 0,
												height: 0,
												y: -10,
											}}
											transition={{
												duration: 0.3,
												ease: 'easeInOut',
											}}
											className="overflow-hidden"
										>
											<div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
												<div className="flex items-start gap-2">
													<Sparkles className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
													<div>
														<p className="text-sm font-semibold text-purple-900 mb-1">
															AI Summary
														</p>
														<p className="text-sm text-gray-700">
															{aiSummary}
														</p>
													</div>
												</div>
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						)}
					</div>{' '}
					{/* Post Actions */}
					<div className="flex items-center gap-6 text-gray-600">
						<div className="flex items-center gap-2">
							<ArrowBigUp
								className={`w-7 h-7 p-1 cursor-pointer hover:bg-gray-100 rounded-full 
								${
									post.liked_by_requesting_user
										? 'text-emerald-500 fill-emerald-500'
										: 'hover:bg-gray-200'
								}`}
								onClick={handleUpVote}
							/>
							<span>{post.vote_score}</span>
							<ArrowBigDown
								className={`w-7 h-7 p-1 cursor-pointer hover:bg-gray-100 rounded-full
								${
									post.disliked_by_requesting_user
										? 'text-red-500 fill-red-500'
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
			</div>
			{/* Comment Box */}
			<CommentBox
				className="w-full max-w-4xl mt-4 mx-auto"
				postId={post.id}
				parentId=""
				refresh={refreshComments}
			/>{' '}
			{/* Comments Section */}
			<div className="w-full max-w-4xl mt-6 space-y-4 mx-auto">
				{loadingComments ? (
					<p className="text-gray-500 italic">Loading comments...</p>
				) : commentsData && commentsData.comments.length > 0 ? (
					commentsData.comments.map((comment) => (
						<CommentItem
							key={comment.id}
							comment={comment}
							refreshComments={refreshComments}
						/>
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
				<AlertDialogContent
					className={isSidebarOpen ? 'ml-32' : 'ml-6'}
				>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete post?</AlertDialogTitle>
						<AlertDialogDescription>
							Once you delete this post, it can&apos;t be
							restored.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel
							type="button"
							onClick={() => setIsDeleting(false)}
							className="cursor-pointer"
						>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							type="submit"
							onClick={handleDelete}
							className="cursor-pointer hover:bg-red-700 bg-red-600"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog open={isAuthenAlert} onOpenChange={setIsAuthenAlert}>
                <AlertDialogContent className={isSidebarOpen ? 'ml-32' : 'ml-6'}>
                    <AlertDialogHeader>
                        <div className="flex gap-2 text-red-500 items-center">
                            <LogIn className="w-5 h-5" />
                            <AlertDialogTitle>Authentication Required</AlertDialogTitle>
                        </div>
                        <AlertDialogDescription>
                            You need to act as a member to take an action on post. <br/>
                            Please log in to continue.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel 
                             className="cursor-pointer"
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                             onClick={() => router.push('/signup')}
                             className="bg-emerald-700 hover:bg-emerald-800 cursor-pointer"
                        >
                            Log in / Sign up
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
		</div>
	);
}
