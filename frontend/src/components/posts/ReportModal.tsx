'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Post, Comment } from '@/types/dashboard/post';
import { fetchCreateReport } from '@/services/report/report';
import { toast } from 'sonner';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

interface ReportModalProps {
	targetType: 'post' | 'comment';
	target: Post | Comment;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function ReportModal({
	targetType,
	target,
	open,
	onOpenChange,
}: ReportModalProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [reason, setReason] = useState('');

	const { open: isSidebarOpen } = useSidebar();
	const { status } = useSession();
	const router = useRouter();

	const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			await fetchCreateReport({
				target_type: targetType,
				target_id: target.id,
				reason: reason,
			});
			console.log('Report Success!');
			toast.success('Report Submitted', {
				description: 'Thank you! Your report has been received.',
			});
			onOpenChange(false);
			setReason('');
		} catch (err: unknown) {
			console.log(err);
			toast.error('Submit Report Fail', {
				description: 'Unable to submit a report. Please try again.',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const titleLabel =
		targetType === 'post' ? 'Post title :' : 'Comment content :';
	const displayContent =
		targetType === 'post'
			? (target as Post).title
			: (target as Comment).body_md;

	return (
		<div>
			<Dialog open={open && status === 'authenticated'} onOpenChange={onOpenChange}>
				<DialogContent
					className={cn(
						'bg-white p-8 rounded-xl shadow-lg text-left max-w-xl w-full text-black',
						"fixed left-[50%] top-[50%] z-50 grid w-[95%] max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 rounded-xl dark:bg-gray-900"
					)}
				>
					<DialogHeader>
						<DialogTitle className="text-2xl font-bold mb-4 text-black">
							Submit a report
						</DialogTitle>
						<div>
							<Label className="block text-black mb-2">
								{titleLabel}
							</Label>
							<p className="mb-6 font-semibold text-black bg-gray-200 p-3 rounded-lg break-words">
								{displayContent}
							</p>
						</div>
					</DialogHeader>

					<form onSubmit={handleFormSubmit}>
						<div className="mb-6">
							<Label className="block text-black mb-2">Reason:</Label>
							<Textarea
								value={reason}
								onChange={(e) => setReason(e.target.value)}
								className="w-full p-2 bg-gray-200 rounded-lg text-black break-all"
								placeholder="Add more details..."
								disabled={isSubmitting}
							/>
						</div>

						<DialogFooter className="flex justify-end gap-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={isSubmitting}
								className="cursor-pointer"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isSubmitting}
								className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
							>
								{isSubmitting ? 'Submitting...' : 'Submit'}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>

	);
}
