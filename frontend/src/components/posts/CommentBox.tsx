'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { postComment } from '@/services/dashboard/postComment';
import { Image as ImageIcon } from 'lucide-react';

// interface Content {
// 	parent_id: string;
// 	body_md: string;
// }

interface CommentBoxProps {
	className?: string;
	postId: string;
	parentId: string;
	refresh: () => void;
	onClose?: () => void;
}

export default function CommentBox({
	className,
	postId,
	parentId,
	refresh,
	onClose,
}: CommentBoxProps) {
	const { status } = useSession();
	const isLoggedIn = status === 'authenticated';

	const [comment, setComment] = useState('');
	const [showActions, setShowActions] = useState(false);

	if (!postId) {
		postId = '';
	}

	if (!parentId) {
		parentId = '';
	}

	async function handlePostComment() {
		try {
			const success = await postComment({
				content: {
					post_id: postId,
					parent_id: parentId,
					body_md: comment,
				},
			});

			if (success && isLoggedIn) {
				toast.message('Comment Succuss');
				console.log('Comment posted successfully!');
				setComment('');
				setShowActions(false);
				if (onClose){
					onClose();
				}
			}
		} catch (err) {
			toast.error('Please login first');
			console.error('Failed to post comment:', err);
		} finally {
			refresh();
		}
	}

    const handleCancel = () => {
        setComment('');
        setShowActions(false);
        if (onClose) {
            onClose();
        }
    };

	return (
		<div
			className={cn(
				'w-full rounded-3xl border px-4 py-2 shadow-sm',
				className
			)}
		>
			<Textarea
				placeholder="Write a comment..."
				value={comment}
				onChange={(e) => setComment(e.target.value)}
				onFocus={() => setShowActions(true)}
				className="resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
				rows={1}
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
						>
							Cancel
						</Button>
						<Button
							onClick={() => {
								console.log('Comment submitted:', comment);
								handlePostComment();
								setComment('');
								setShowActions(false);
							}}
							disabled={!comment.trim()}
							className='cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50'
							size='sm'
						>
							Comment
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
