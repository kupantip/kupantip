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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Report, useUpdateReportStatus } from '@/services/admin/report';
import { Calendar, User, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { BanUserDialog } from './BanUserDialog';

type ReportDetailsDialogProps = {
	report: Report | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function ReportDetailsDialog({
	report,
	open,
	onOpenChange,
}: ReportDetailsDialogProps) {
	const [showBanDialog, setShowBanDialog] = useState(false);
	const { mutate: updateStatus, isPending } = useUpdateReportStatus();

	if (!report) return null;

	const handleApprove = () => {
		// Open ban dialog instead of directly updating status
		setShowBanDialog(true);
	};

	const handleBanSuccess = () => {
		// Update report status after successful ban
		updateStatus(
			{ id: report.id, status: 'actioned' },
			{
				onSuccess: () => {
					toast.success('Report Approved', {
						description: 'Action has been taken on this report.',
					});
					onOpenChange(false);
				},
			}
		);
	};

	const handleReject = () => {
		updateStatus(
			{ id: report.id, status: 'dismissed' },
			{
				onSuccess: () => {
					toast.success('Report Dismissed', {
						description: 'The report has been dismissed.',
					});
					onOpenChange(false);
				},
				onError: (error) => {
					toast.error('Error', {
						description:
							'Failed to dismiss report. Please try again.',
					});
				},
			}
		);
	};

	const statusColor =
		report.status === 'open'
			? 'bg-yellow-100 text-yellow-800 border-yellow-300'
			: report.status === 'actioned'
			? 'bg-green-100 text-green-800 border-green-300'
			: report.status === 'dismissed'
			? 'bg-red-100 text-red-800 border-red-300'
			: 'bg-gray-100 text-gray-800 border-gray-300';

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<AlertCircle className="h-5 w-5 text-red-500" />
							Report Details
						</DialogTitle>
						<DialogDescription>
							Review the report details and take action
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-6">
						{/* Status Badge */}
						<div className="flex items-center gap-2">
							<span className="text-sm font-medium">Status:</span>
							<Badge
								variant="outline"
								className={`capitalize ${statusColor}`}
							>
								{report.status}
							</Badge>
						</div>

						<Separator />

						{/* Report Information */}
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<FileText className="h-4 w-4" />
										<span className="font-medium">
											Report ID
										</span>
									</div>
									<p className="text-sm font-mono bg-muted p-2 rounded">
										{report.id}
									</p>
								</div>

								<div className="space-y-2">
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<Calendar className="h-4 w-4" />
										<span className="font-medium">
											Created At
										</span>
									</div>
									<p className="text-sm">
										{new Date(
											report.created_at
										).toLocaleString()}
									</p>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<FileText className="h-4 w-4" />
										<span className="font-medium">
											Target Type
										</span>
									</div>
									<p className="text-sm capitalize">
										{report.target_type}
									</p>
								</div>

								<div className="space-y-2">
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<FileText className="h-4 w-4" />
										<span className="font-medium">
											Target ID
										</span>
									</div>
									<p className="text-sm font-mono bg-muted p-2 rounded">
										{report.target_id}
									</p>
								</div>
							</div>

							<div className="space-y-2">
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<User className="h-4 w-4" />
									<span className="font-medium">
										Reporter ID
									</span>
								</div>
								<p className="text-sm font-mono bg-muted p-2 rounded">
									{report.reporter_id}
								</p>
							</div>

							<Separator />

							{/* Reason Section */}
							<div className="space-y-2">
								<h4 className="font-medium text-sm">
									Report Reason
								</h4>
								<div className="bg-muted p-4 rounded-lg">
									<p className="text-sm whitespace-pre-wrap">
										{report.reason}
									</p>
								</div>
							</div>
						</div>
					</div>

					<DialogFooter className="gap-2">
						{report.status === 'open' && (
							<>
								<Button
									variant="outline"
									className="text-red-600 hover:text-red-700 hover:bg-red-50"
									onClick={handleReject}
									disabled={isPending}
								>
									{isPending
										? 'Processing...'
										: 'Dismiss Report'}
								</Button>
								<Button
									className="bg-green-600 hover:bg-green-700"
									onClick={handleApprove}
									disabled={isPending}
								>
									Approve & Ban User
								</Button>
							</>
						)}
						<Button
							variant="secondary"
							onClick={() => onOpenChange(false)}
							disabled={isPending}
						>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<BanUserDialog
				reportId={report.id}
				userId={report.reporter_id}
				open={showBanDialog}
				onOpenChange={setShowBanDialog}
				onSuccess={handleBanSuccess}
			/>
		</>
	);
}
