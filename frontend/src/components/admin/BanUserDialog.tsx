'use client';

import { useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { useCreateBan } from '@/services/admin/ban';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type BanUserDialogProps = {
	reportId: string;
	userId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
};

export function BanUserDialog({
	reportId,
	userId,
	open,
	onOpenChange,
	onSuccess,
}: BanUserDialogProps) {
	const [banType, setBanType] = useState<string>('');
	const [reasonAdmin, setReasonAdmin] = useState('');
	const [reasonUser, setReasonUser] = useState('');
	const [endDate, setEndDate] = useState<Date>();

	const { mutate: createBan, isPending } = useCreateBan();

	const handleSubmit = () => {
		if (!banType || !reasonAdmin || !reasonUser || !endDate) {
			toast.error('Missing Information', {
				description: 'Please fill in all required fields.',
			});
			return;
		}

		createBan(
			{
				user_id: userId,
				ban_type: banType,
				reason_admin: reasonAdmin,
				reason_user: reasonUser,
				related_report_id: reportId,
			},
			{
				onSuccess: () => {
					toast.success('User Banned', {
						description: 'The user has been banned successfully.',
					});
					// Reset form
					setBanType('');
					setReasonAdmin('');
					setReasonUser('');
					setEndDate(undefined);
					onOpenChange(false);
					onSuccess?.();
				},
				onError: (error) => {
					toast.error('Error', {
						description: 'Failed to ban user. Please try again.',
					});
				},
			}
		);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Ban User</DialogTitle>
					<DialogDescription>
						Set ban details and duration for this user
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Ban Type */}
					<div className="space-y-2">
						<Label htmlFor="ban-type">
							Ban Type <span className="text-red-500">*</span>
						</Label>
						<Select value={banType} onValueChange={setBanType}>
							<SelectTrigger id="ban-type">
								<SelectValue placeholder="Select ban type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="suspend">Suspend</SelectItem>
								<SelectItem value="post_ban">
									Post Ban
								</SelectItem>
								<SelectItem value="comment_ban">
									Comment Ban
								</SelectItem>
								<SelectItem value="vote_ban">
									Vote Ban
								</SelectItem>
								<SelectItem value="shadowban">
									Shadowban
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* End Date */}
					<div className="space-y-2">
						<Label>
							Ban End Date <span className="text-red-500">*</span>
						</Label>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									className={cn(
										'w-full justify-start text-left font-normal',
										!endDate && 'text-muted-foreground'
									)}
								>
									<CalendarIcon className="mr-2 h-4 w-4" />
									{endDate ? (
										format(endDate, 'PPP')
									) : (
										<span>Pick a date</span>
									)}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0">
								<Calendar
									mode="single"
									selected={endDate}
									onSelect={setEndDate}
									disabled={(date) =>
										date < new Date() ||
										date < new Date('1900-01-01')
									}
									initialFocus
								/>
							</PopoverContent>
						</Popover>
					</div>

					{/* Reason for Admin */}
					<div className="space-y-2">
						<Label htmlFor="reason-admin">
							Reason (Admin Notes){' '}
							<span className="text-red-500">*</span>
						</Label>
						<Textarea
							id="reason-admin"
							placeholder="Internal notes for admin team..."
							value={reasonAdmin}
							onChange={(e) => setReasonAdmin(e.target.value)}
							rows={3}
						/>
					</div>

					{/* Reason for User */}
					<div className="space-y-2">
						<Label htmlFor="reason-user">
							Reason (User Message){' '}
							<span className="text-red-500">*</span>
						</Label>
						<Textarea
							id="reason-user"
							placeholder="Message to show the banned user..."
							value={reasonUser}
							onChange={(e) => setReasonUser(e.target.value)}
							rows={3}
						/>
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isPending}
					>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={isPending}
						className="bg-red-600 hover:bg-red-700"
					>
						{isPending ? 'Banning...' : 'Ban User'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
