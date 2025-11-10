'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { postComment } from '@/services/dashboard/postComment';
import { updateComment } from '@/services/user/updateComment';
import { Image as ImageIcon } from 'lucide-react';
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
import { useSidebar } from '../ui/sidebar';

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
	editComment
}: CommentBoxProps) {
	const { status } = useSession();
	const isLoggedIn = status === 'authenticated';

	const isEditing = !!editComment;

	const [comment, setComment] = useState(isEditing ? editComment.body_md : '');
	const [showActions, setShowActions] = useState(isEditing);

	const [isSubmitting, setIsSubmitting] = useState(false);

	const [banInfo, setBanInfo] = useState<{
		message: string;
		reason: string;
		end_at: string;
	} | null>(null);

	const {open: isSidebarOpen} = useSidebar();

	if (!postId) {
		postId = '';
	}

	if (!parentId) {
		parentId = '';
	}

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (!comment.trim()){
			return;
		}

		setIsSubmitting(true);

		try {
			if (isEditing){
				const success = await updateComment({body_md : comment, id: editComment.id});
				if (success) {
					toast.success('Comment updated successfully!');
					if (onClose){
						onClose();
					}
				}
			} else {
					const success = await postComment({
						content: {
							post_id: postId,
							parent_id: parentId,
							body_md: comment
						}
					});

					if (success && isLoggedIn) {
						toast.message('Comment Succuss!');
						setComment('');
						setShowActions(false);
						if (onClose) {
							onClose();
						}
					}
				}

			refresh();

		} catch (err : any) {
			console.error("Failed to submit comment: ", err);

			if (err.response?.status === 403) {
				const { message, reason, end_at } = err.response.data;
				setBanInfo({ message, reason, end_at });
				return;
			}

			if (isEditing) {
				toast.error("Failed to update comment. Please try again.");
			} else if (!isLoggedIn) {
				toast.error("Please login first to comment.");
			} else {
				toast.error("Failed to post comment. Please try again.");
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
		<form
			onSubmit={handleSubmit}
			className={cn(
				'w-full rounded-3xl border px-4 py-2 shadow-sm',
				isEditing && 'border-emerald-600',
				className
			)}
		>
			<Textarea
				placeholder={isEditing ? "Editing comment..." : "Write a comment..."}
				value={comment}
				onChange={(e) => setComment(e.target.value)}
				onFocus={() => {
					if(isEditing){
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
					<ImageIcon size={16} className="cursor-pointer" />
					{/* <Film size={16} className="cursor-pointer" />
                    <Type size={16} className="cursor-pointer" /> */}
				</div>

				{/* Right buttons */}
				{showActions && (
					<div className="flex gap-2">
						<Button
							variant="ghost"
							onClick={handleCancel}
                            className='cursor-pointer text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            size='sm'
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={!comment.trim() || isSubmitting}
							className='cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50'
							size='sm'
						>
							{isSubmitting ? (isEditing ? 'Saving...' : 'Posting...') : (isEditing ? 'Save' : 'Comment')}
						</Button>
					</div>
				)}
			</div>

			<AlertDialog open={!!banInfo} onOpenChange={() => setBanInfo}>
				<AlertDialogContent className={isSidebarOpen ? "ml-32" : "ml-6"}>
					<AlertDialogHeader>
						<AlertDialogTitle>You are ban from Comment</AlertDialogTitle>
						<AlertDialogDescription>
                			<strong className='text-black/75'>Reason:</strong> {banInfo?.reason}
						</AlertDialogDescription>
						<AlertDialogDescription>
							<strong className='text-black/75'>End Date:</strong>{" "}
							{banInfo?.end_at
							? new Date(banInfo.end_at).toLocaleString("en-En")
							: "-"}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel
							type="button"
							onClick={() => setBanInfo(null)}
							className='cursor-pointer'
						>
							Cancel
						</AlertDialogCancel>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</form>

	);
}
