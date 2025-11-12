'use client';

import React, { useState } from 'react';
import {
	AnnouncementForm,
	AnnouncementSubmitData,
} from '@/components/admin/AnnouncementForm';
import { toast } from 'sonner';

export default function AnnouncementPage() {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submittedData, setSubmittedData] =
		useState<AnnouncementSubmitData | null>(null);

	const handleFormSubmit = async (data: AnnouncementSubmitData) => {
		try {
			setIsSubmitting(true);
			console.log('Form data received:', data);

			// Store the submitted data
			setSubmittedData(data);

			// TODO: Replace with actual API call
			// const response = await fetch('/api/announcements', {
			//   method: 'POST',
			//   headers: { 'Content-Type': 'application/json' },
			//   body: JSON.stringify(data),
			// });

			// if (!response.ok) throw new Error('Failed to create announcement');

			toast.success('Announcement Created', {
				description: 'The announcement has been created successfully.',
			});
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to create announcement';
			toast.error('Error', {
				description: errorMessage,
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="container py-6">
			<div className="max-w-2xl">
				<div className="mb-8">
					<h1 className="text-3xl font-bold tracking-tight">
						Create Announcement
					</h1>
					<p className="text-muted-foreground mt-2">
						Create and schedule announcements for your platform
					</p>
				</div>

				<AnnouncementForm
					onSubmit={handleFormSubmit}
					isLoading={isSubmitting}
				/>

				{/* Display submitted data for debugging */}
				{submittedData && (
					<div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
						<h2 className="font-semibold text-green-900 mb-3">
							Submitted Announcement Data:
						</h2>
						<pre className="text-sm text-green-800 overflow-auto">
							{JSON.stringify(submittedData, null, 2)}
						</pre>
					</div>
				)}
			</div>
		</div>
	);
}
