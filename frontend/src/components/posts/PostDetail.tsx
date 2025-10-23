'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ArrowUp, ArrowDown, Ellipsis } from 'lucide-react';
import * as t from '@/types/dashboard/post';
import { User } from '@/types/dashboard/user';
import { getCommentByPostId } from '@/services/dashboard/getCommentByPostId';
import CommentBox from './CommentBox';
import { deletePost } from '@/services/user/delete_post';
import { upvotePost, downvotePost, deletevotePost } from '@/services/user/vote';
import { jwtDecode } from 'jwt-decode';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { Pen } from 'lucide-react';
import { Flag } from 'lucide-react';
// import ReportComment from '@/app/posts/report_comment/page';
import ReportModal from '@/app/posts/report/page';

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
	const [menuOpen, setMenuOpen] = useState(false);

	const menuRef = useRef<HTMLDivElement>(null);

	const { data: session } = useSession();
	const tokenPayload = session?.accessToken
		? jwtDecode<User>(session.accessToken)
		: null;
	const currentUserId = tokenPayload?.user_id;

	const [reportingComment, setReportingComment] = useState<t.Comment | null>(null);

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

	const handleReportComment = async (e: React.MouseEvent) => {
		e.stopPropagation();
		console.log('Report Comment on', comment.id);
		setMenuOpen(false);
		setReportingComment(comment);

	};

	const handleCloseReport = () => {
		setReportingComment(null);
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
						<div
							className="flex items-center gap-1 px-2 py-1 "
							onClick={(e) => {
								e.stopPropagation();
								setMenuOpen(!menuOpen);
							}}
						>
							<button
								className="p-1 rounded-full hover:bg-gray-100 cursor-pointer cursor-pointer"
								onClick={(e) => {
									e.stopPropagation();
									setMenuOpen(!menuOpen);
								}}
							>
								<Ellipsis />
							</button>
							{comment.author_id != currentUserId && (
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
												<span className='mt-0.5'>Report</span>
											</button>
										</motion.div>
									)}
								</AnimatePresence>
							)}
							
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
			<AnimatePresence>
				{reportingComment && (
						<ReportModal
							targetType="comment"
							target={comment}
							onClose={handleCloseReport} 
						>
						</ReportModal>
				)}
			</AnimatePresence>
		</div>
	);
};

export default function PostDetail({ post }: PostDetailProps) {
	const [commentsData, setCommentsData] = useState<t.CommentsResponse | null>(
		null
	);
	const [loadingComments, setLoadingComments] = useState(true);

	const [reportingPost, setReportingPost] = useState<t.Post | null>(null);
	const [reportTarget, setReportTarget] = useState<{ 
		type: "post" | "comment", 
		data: t.Post | t.Comment 
	} | null>(null);

	const { data: session } = useSession();
	const tokenPayload = session?.accessToken
		? jwtDecode<User>(session.accessToken)
		: null;
	const currentUserId = tokenPayload?.user_id;

	const [menuOpen, setMenuOpen] = useState(false);
	const router = useRouter();
	const menuRef = useRef<HTMLDivElement>(null);

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
				await upvotePost(post.id);
				console.log('Upvote Post Success');
			}else{
				await deletevotePost(post.id);
				console.log('Delete Upvote Success')
			}
		} catch (err: unknown) {}
	};

	const handleDownVote = async (e: React.MouseEvent) => {
		e.stopPropagation();
		console.log('Downvote on');
		try {
			if(!post.disliked_by_requesting_user){
				await downvotePost(post.id);
				console.log('Downvote Post Success');
			}else{
				await deletevotePost(post.id);
				console.log('Delete Downvote Success')
			}
		} catch (err: unknown) {}
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
		} catch (err: unknown) {
			console.log('Delete Failed');
		}
	};

	const handleReportPost = async (e: React.MouseEvent) => {
		e.stopPropagation();
		console.log('Report on', post.id);
		setMenuOpen(false);
		setReportingPost(post);
	};

	const handleCloseReport = () => {
		setReportingPost(null);
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
											<Pen className='px-1 mr-2'/>
											<span className='mt-0.5'>Edit</span>
										</button>
										<button
											className="flex w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:rounded-b-lg cursor-pointer"
											onClick={handleDelete}
										>
											<Trash2 className='mr-2'/>
											<span className='mt-0.5'>Delete</span>
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
											<span className='mt-0.5'>Report</span>
										</button>
									</motion.div>
								)}
							</AnimatePresence>
						)}
					</div>
				</div>


				{/* Post Content */}
				<h2 className="text-lg font-medium">{post.title}</h2>
				{
					post.attachments.length > 0 &&
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
						))
					// <img
					// 	src={post.attachments[0].url}
					// 	alt="Post attachment"
					// 	className="w-full h-auto object-cover rounded-lg"
					// />
					// <Image src={`/backend/post/attachments/${post.attachments[0].url}`} alt="Post attachment" width={600} height={400} className="w-full h-auto object-cover rounded-lg" />
				}

				<div>{post.body_md}</div>

				{/* Post Actions */}
				<div className="flex items-center gap-6 text-gray-600">
					<div className="flex items-center gap-2">
						<ArrowUp
							className={`w-5 h-5 cursor-pointer p-1 hover:bg-gray-100 rounded-full
								${post.liked_by_requesting_user ? "bg-green-400 text-black" : "hover:bg-gray-200"}`}
							onClick={handleUpVote}
						/>
						<span>{post.vote_score}</span>
						<ArrowDown
							className={`w-5 h-5 cursor-pointer p-1 hover:bg-gray-100 rounded-full
								${post.disliked_by_requesting_user ? "bg-red-400 text-black" : "hover:bg-gray-200"}`}
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
			<AnimatePresence>
				{reportingPost && (
						<ReportModal
							targetType="post"
							target={post}
							onClose={handleCloseReport} 
						>
						</ReportModal>
				)}
			</AnimatePresence>
		</div>
	);
}
