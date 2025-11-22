'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { usePostComment } from '@/services/comment/comment';
import { fetchUpdateComment } from '@/services/comment/comment';
import { AlertTriangle, LogIn } from 'lucide-react';
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogAction
} from '@/components/ui/alert-dialog';
import { useSidebar } from '../ui/sidebar';
import { useRouter } from 'next/navigation';

interface CommentBoxProps {
	className?: string;
	postId: string;
	parentId: string;
	refresh: () => void;
	onClose?: () => void;
	editComment?: {
		id: string;
		body_md: string;
	};
}

export default function CommentBox({
	className,
	postId,
	parentId,
	refresh,
	onClose,
	editComment,
}: CommentBoxProps) {
	const { status } = useSession();
	const isLoggedIn = status === 'authenticated';

	const isEditing = !!editComment;

	const [comment, setComment] = useState(
		isEditing ? editComment.body_md : ''
	);
	const [showActions, setShowActions] = useState(isEditing);

	const postCommentMutation = usePostComment();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [banInfo, setBanInfo] = useState<{
		message: string;
		reason: string;
		end_at: string;
	} | null>(null);

	const { open: isSidebarOpen } = useSidebar();

	if (!postId) {
		postId = '';
	}

	if (!parentId) {
		parentId = '';
	}

	const [isAuthenAlert, setIsAuthenAlert] = useState(false);
	const router = useRouter();

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (!comment.trim()) {
			return;
		}

		setIsSubmitting(true);

		if (!isLoggedIn) {
			setIsAuthenAlert(true);
			return;
		}

		try {
			if (isEditing) {
				const success = await fetchUpdateComment({
					body_md: comment,
					id: editComment.id,
				});
				if (success) {
					toast.success('Comment updated successfully!');
					if (onClose) {
						onClose();
					}
				}
			} else {
				await postCommentMutation.mutateAsync({
					content: {
						post_id: postId,
						parent_id: parentId,
						body_md: comment,
					},
				});

				if (isLoggedIn) {
					toast.message('Comment Succuss!');
					setComment('');
					setShowActions(false);
					if (onClose) {
						onClose();
					}
				}
			}

			refresh();
		} catch (err: unknown) {
			console.error('Failed to submit comment: ', err);

			if (
				typeof err === 'object' &&
				err !== null &&
				'status' in err &&
				(err as { status?: number }).status === 403
			) {
				const e = err as {
					message?: string;
					reason?: string;
					end_at?: string;
				};
				setBanInfo({
					message: e.message ?? 'You are banned',
					reason: e.reason ?? '-',
					end_at: e.end_at ?? '-',
				});
				return;
			}

			if (isEditing) {
				toast.error('Failed to update comment. Please try again.');
			} else {
				toast.error('Failed to post comment. Please try again.');
			}
		} finally {
			setIsSubmitting(false);
		}
	}

	const handleCancel = () => {
		setComment(isEditing ? editComment.body_md : '');
		setShowActions(isEditing);
		if (onClose) {
			onClose();
		}
	};

	return (
		<div>
			<form
				onSubmit={handleSubmit}
				className={cn(
					'w-full rounded-3xl border px-4 py-2 shadow-sm bg-white',
					isEditing && 'border-emerald-600',
					className
				)}
			>
				<Textarea
					placeholder={
						isEditing ? 'Editing comment...' : 'Write a comment...'
					}
					value={comment}
					onChange={(e) => setComment(e.target.value)}
					onFocus={() => {
						if (isEditing) {
							return;
						}
						setShowActions(true);
					}}
					className="resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
					rows={1}
					disabled={isSubmitting}
				/>

				<div className="mt-3 flex items-center justify-between">
					{/* Left action icons */}
					<div className="flex gap-3 text-gray-500">
						{/* <ImageIcon size={16} className="cursor-pointer" /> */}
						{/* <Film size={16} className="cursor-pointer" />
						<Type size={16} className="cursor-pointer" /> */}
					</div>

					{/* Right buttons */}
					{showActions && (
						<div className="flex gap-2">
							<Button
								variant="ghost"
								onClick={handleCancel}
								className="cursor-pointer text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
								size="sm"
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={!comment.trim() || isSubmitting}
								className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
								size="sm"
							>
								{isSubmitting
									? isEditing
										? 'Saving...'
										: 'Posting...'
									: isEditing
									? 'Save'
									: 'Comment'}
							</Button>
						</div>
					)}
				</div>

				<AlertDialog open={!!banInfo} onOpenChange={() => setBanInfo}>
					<AlertDialogContent
						className={isSidebarOpen ? 'ml-32' : 'ml-6'}
					>
						<AlertDialogHeader>
							<div className="flex gap-2 text-red-500 items-center">
								<AlertTriangle className="w-5 h-5" />
								<AlertDialogTitle>
									You&apos;ve been banned from commenting.
								</AlertDialogTitle>
							</div>
							<AlertDialogDescription>
								<strong className="text-black/75">Reason:</strong>{' '}
								{banInfo?.reason}
							</AlertDialogDescription>
							<AlertDialogDescription>
								<strong className="text-black/75">
									Ban expires on:
								</strong>{' '}
								{banInfo?.end_at
									? new Date(banInfo.end_at).toLocaleString(
											'en-En',
											{
												dateStyle: 'long',
												timeStyle: 'short',
											}
									)
									: '-'}
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel
								type="button"
								onClick={() => setBanInfo(null)}
								className="cursor-pointer w-full"
							>
								Close
							</AlertDialogCancel>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</form>

			<AlertDialog open={isAuthenAlert} onOpenChange={setIsAuthenAlert}>
				<AlertDialogContent className={isSidebarOpen ? 'ml-32' : 'ml-6'}>
					<AlertDialogHeader>
						<div className="flex gap-2 text-red-500 items-center">
							<LogIn className="w-5 h-5" />
							<AlertDialogTitle>Authentication Required</AlertDialogTitle>
						</div>
						<AlertDialogDescription>
							You need to act as a member to comment. <br/>
							Please log in to continue.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel
							onClick={() => setIsSubmitting(false)} 
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
