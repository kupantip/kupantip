'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Helper function for combining date and time
function combineDateAndTimeHelper(
	date: Date | undefined,
	time: string
): string {
	if (!date || !time) {
		return '';
	}
	const timeParts = time.split(':');
	if (timeParts.length !== 2) {
		return '';
	}
	const hours = parseInt(timeParts[0], 10);
	const minutes = parseInt(timeParts[1], 10);

	if (isNaN(hours) || isNaN(minutes)) {
		return '';
	}

	const combined = new Date(date);
	combined.setHours(hours, minutes, 0, 0);
	return combined.toISOString();
}

// Type definition
type AnnouncementFormDataType = {
	title: string;
	body_md: string;
	startDate: Date;
	startTime: string;
	endDate: Date;
	endTime: string;
};

export type AnnouncementSubmitData = {
	title: string;
	body_md: string;
	start_at: string;
	end_at: string;
};

type AnnouncementFormProps = {
	onSubmit?: (data: AnnouncementSubmitData) => void | Promise<void>;
	isLoading?: boolean;
};

export function AnnouncementForm({
	onSubmit,
	isLoading = false,
}: AnnouncementFormProps) {
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (!isMounted) {
		return null;
	}

	return (
		<AnnouncementFormContent onSubmit={onSubmit} isLoading={isLoading} />
	);
}

function AnnouncementFormContent({
	onSubmit,
	isLoading = false,
}: AnnouncementFormProps) {
	const {
		register,
		handleSubmit,
		watch,
		control,
		formState: { errors },
	} = useForm<AnnouncementFormDataType>({
		mode: 'onBlur',
		defaultValues: {
			title: '',
			body_md: '',
			startTime: '09:00',
			endTime: '00:00',
		},
	});

	const title = watch('title');
	const startDate = watch('startDate');
	const startTime = watch('startTime');
	const endDate = watch('endDate');
	const endTime = watch('endTime');

	const handleFormSubmit = async (data: AnnouncementFormDataType) => {
		// Validate required fields
		if (!data.title?.trim()) {
			toast.error('Validation Error', {
				description: 'Title is required.',
			});
			return;
		}

		if (!data.body_md?.trim()) {
			toast.error('Validation Error', {
				description: 'Content is required.',
			});
			return;
		}

		if (!data.startDate) {
			toast.error('Validation Error', {
				description: 'Start date is required.',
			});
			return;
		}

		if (!data.endDate) {
			toast.error('Validation Error', {
				description: 'End date is required.',
			});
			return;
		}

		if (!data.startTime) {
			toast.error('Validation Error', {
				description: 'Start time is required.',
			});
			return;
		}

		if (!data.endTime) {
			toast.error('Validation Error', {
				description: 'End time is required.',
			});
			return;
		}

		const startAtISO = combineDateAndTimeHelper(
			data.startDate,
			data.startTime
		);
		const endAtISO = combineDateAndTimeHelper(data.endDate, data.endTime);

		if (!startAtISO || !endAtISO) {
			toast.error('Validation Error', {
				description: 'Invalid date or time format.',
			});
			return;
		}

		if (new Date(startAtISO) >= new Date(endAtISO)) {
			toast.error('Validation Error', {
				description: 'Start time must be before end time.',
			});
			return;
		}

		const submittedData: AnnouncementSubmitData = {
			title: data.title,
			body_md: data.body_md,
			start_at: startAtISO,
			end_at: endAtISO,
		};

		try {
			await onSubmit?.(submittedData);
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to submit announcement';
			toast.error('Error', {
				description: errorMessage,
			});
		}
	};

	return (
		<Card className="p-6">
			<form
				onSubmit={handleSubmit(handleFormSubmit)}
				className="space-y-6"
			>
				{/* Title Field */}
				<div className="space-y-2">
					<Label htmlFor="title">Title</Label>
					<Input
						id="title"
						placeholder="e.g., Course registration period"
						{...register('title')}
						disabled={isLoading}
					/>
					{errors.title && (
						<p className="text-sm text-red-500">
							{errors.title.message}
						</p>
					)}
				</div>

				{/* Body/Content Field */}
				<div className="space-y-2">
					<Label htmlFor="body_md">Content (Markdown)</Label>
					<Textarea
						id="body_md"
						placeholder="Enter announcement content in markdown format..."
						{...register('body_md')}
						disabled={isLoading}
						rows={8}
					/>
					<p className="text-sm text-muted-foreground">
						You can use markdown formatting (bold, italic, links,
						etc.)
					</p>
					{errors.body_md && (
						<p className="text-sm text-red-500">
							{errors.body_md.message}
						</p>
					)}
				</div>

				{/* Start Date and Time */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label>Start Date</Label>
						<Controller
							control={control}
							name="startDate"
							render={({ field }) => (
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className={cn(
												'w-full justify-start text-left font-normal',
												!field.value &&
													'text-muted-foreground'
											)}
											disabled={isLoading}
										>
											<CalendarIcon className="mr-2 h-4 w-4" />
											{field.value
												? format(
														field.value,
														'MMM dd, yyyy'
												  )
												: 'Pick a date'}
										</Button>
									</PopoverTrigger>
									<PopoverContent
										className="w-auto p-0"
										align="start"
									>
										<Calendar
											mode="single"
											selected={field.value}
											onSelect={field.onChange}
											disabled={isLoading}
										/>
									</PopoverContent>
								</Popover>
							)}
						/>
						{errors.startDate && (
							<p className="text-sm text-red-500">
								{errors.startDate.message}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="startTime">Start Time</Label>
						<div className="flex items-center gap-2">
							<Clock className="h-4 w-4 text-muted-foreground" />
							<Input
								id="startTime"
								type="time"
								{...register('startTime')}
								disabled={isLoading}
								className="flex-1"
							/>
						</div>
						{errors.startTime && (
							<p className="text-sm text-red-500">
								{errors.startTime.message}
							</p>
						)}
					</div>
				</div>

				{/* End Date and Time */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label>End Date</Label>
						<Controller
							control={control}
							name="endDate"
							render={({ field }) => (
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className={cn(
												'w-full justify-start text-left font-normal',
												!field.value &&
													'text-muted-foreground'
											)}
											disabled={isLoading}
										>
											<CalendarIcon className="mr-2 h-4 w-4" />
											{field.value
												? format(
														field.value,
														'MMM dd, yyyy'
												  )
												: 'Pick a date'}
										</Button>
									</PopoverTrigger>
									<PopoverContent
										className="w-auto p-0"
										align="start"
									>
										<Calendar
											mode="single"
											selected={field.value}
											onSelect={field.onChange}
											disabled={isLoading}
										/>
									</PopoverContent>
								</Popover>
							)}
						/>
						{errors.endDate && (
							<p className="text-sm text-red-500">
								{errors.endDate.message}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="endTime">End Time</Label>
						<div className="flex items-center gap-2">
							<Clock className="h-4 w-4 text-muted-foreground" />
							<Input
								id="endTime"
								type="time"
								{...register('endTime')}
								disabled={isLoading}
								className="flex-1"
							/>
						</div>
						{errors.endTime && (
							<p className="text-sm text-red-500">
								{errors.endTime.message}
							</p>
						)}
					</div>
				</div>

				{/* Summary Section */}
				{startDate && endDate && (
					<div className="rounded-lg bg-muted p-4 space-y-2">
						<h3 className="font-semibold text-sm">Preview</h3>
						<div className="space-y-1 text-sm">
							<p>
								<span className="font-medium">Title:</span>{' '}
								{title || '-'}
							</p>
							<p>
								<span className="font-medium">Start:</span>{' '}
								{format(startDate, 'MMM dd, yyyy')} at{' '}
								{startTime}
							</p>
							<p>
								<span className="font-medium">End:</span>{' '}
								{format(endDate, 'MMM dd, yyyy')} at {endTime}
							</p>
						</div>
					</div>
				)}

				{/* Error Summary */}
				{errors.root && (
					<div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
						{errors.root.message}
					</div>
				)}

				{/* Submit Button */}
				<Button type="submit" disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 cursor-pointer"> 
					{isLoading
						? 'Creating Announcement...'
						: 'Create Announcement'}
				</Button>
			</form>
		</Card>
	);
}
