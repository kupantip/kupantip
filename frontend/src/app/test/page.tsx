'use client';

import { useAnnouncement } from '@/services/post/annoucement';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';

const MOCK_ANNOUNCEMENTS = [
	{
		id: '0C0A433E-F36B-1410-8FF3-000C4550AF76',
		author_id: '030A433E-F36B-1410-8FF3-000C4550AF76',
		title: 'Exam schedule released',
		body_md:
			'The final exam schedule is now available on my.ku.th under the academic section.',
		create_at: '2025-11-09T08:00:56.200Z',
		start_at: '2025-11-08T09:00:00.000Z',
		end_at: '2025-12-01T00:00:00.000Z',
		delete_at: null,
		author_handle: 'paranyu2',
		author_display_name: 'paranyuGPT2',
		author_role: 'admin' as const,
		minutes_since_announced: 1465,
	},
	{
		id: '000A433E-F36B-1410-8FF3-000C4550AF76',
		author_id: 'F909433E-F36B-1410-8FF3-000C4550AF76',
		title: 'Payment study fee',
		body_md: 'You can make payment at payment menu in my.ku.th',
		create_at: '2025-11-09T07:44:49.077Z',
		start_at: '2025-11-05T12:00:00.000Z',
		end_at: '2025-11-10T00:00:00.000Z',
		delete_at: null,
		author_handle: 'paranyu22',
		author_display_name: 'paranyuGPT22',
		author_role: 'teacher' as const,
		minutes_since_announced: 5605,
	},
	{
		id: '1A0A433E-F36B-1410-8FF3-000C4550AF76',
		author_id: '0D0A433E-F36B-1410-8FF3-000C4550AF76',
		title: 'Course registration period',
		body_md:
			'Course registration for semester 2/2025 will open on November 20. Please register early to avoid system congestion.',
		create_at: '2025-11-09T09:25:18.593Z',
		start_at: '2025-11-01T09:00:00.000Z',
		end_at: '2025-11-22T00:00:00.000Z',
		delete_at: null,
		author_handle: 'paranyu3',
		author_display_name: 'paranyuGPT3',
		author_role: 'staff' as const,
		minutes_since_announced: 11545,
	},
];

export default function AnnouncementsPage() {
	const { data, isLoading, error } = useAnnouncement();
	const announcements = data?.announcements || MOCK_ANNOUNCEMENTS;

	if (isLoading) {
		return (
			<div className="container mx-auto py-8 px-4">
				<h1 className="text-3xl font-bold mb-8">Announcements</h1>
				<div className="space-y-4">
					{Array.from({ length: 3 }).map((_, i) => (
						<div key={i} className="space-y-3">
							<Skeleton className="h-12 w-3/4" />
							<Skeleton className="h-24 w-full" />
							<div className="flex gap-2">
								<Skeleton className="h-6 w-20" />
								<Skeleton className="h-6 w-24" />
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto py-8 px-4">
				<h1 className="text-3xl font-bold mb-8">Announcements</h1>
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						Failed to load announcements: {error.message}
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	if (!announcements || announcements.length === 0) {
		return (
			<div className="container mx-auto py-8 px-4">
				<h1 className="text-3xl font-bold mb-8">Announcements</h1>
				<Alert>
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						No announcements available at the moment.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8 px-4">
			<div className="mb-8">
				<h1 className="text-3xl font-bold">Announcements</h1>
				<p className="text-muted-foreground mt-2">
					Total announcements: {announcements.length}
				</p>
			</div>

			<div className="space-y-4">
				{announcements.map((announcement) => (
					<Card
						key={announcement.id}
						className="hover:shadow-lg transition-shadow"
					>
						<CardHeader className="pb-3">
							<div className="flex items-start justify-between gap-4">
								<div className="flex-1">
									<CardTitle className="text-xl mb-2">
										{announcement.title}
									</CardTitle>
									<CardDescription className="space-y-2">
										<div className="flex items-center gap-2 text-sm">
											<span className="font-semibold text-foreground">
												By{' '}
												{
													announcement.author_display_name
												}
											</span>
											<span className="text-xs">
												(@{announcement.author_handle})
											</span>
										</div>
										<div className="text-xs text-muted-foreground">
											Posted{' '}
											{formatDistanceToNow(
												parseISO(announcement.create_at)
											)}{' '}
											ago
										</div>
									</CardDescription>
								</div>
								<Badge variant="outline" className="mt-1">
									{announcement.author_role}
								</Badge>
							</div>
						</CardHeader>

						<CardContent className="space-y-4">
							<div className="prose prose-sm dark:prose-invert max-w-none">
								<p className="text-sm leading-relaxed whitespace-pre-wrap">
									{announcement.body_md}
								</p>
							</div>

							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<span className="text-muted-foreground">
										Start Date:
									</span>
									<p className="font-medium">
										{new Date(
											announcement.start_at
										).toLocaleDateString('en-US', {
											year: 'numeric',
											month: 'short',
											day: 'numeric',
											hour: '2-digit',
											minute: '2-digit',
										})}
									</p>
								</div>
								<div>
									<span className="text-muted-foreground">
										End Date:
									</span>
									<p className="font-medium">
										{new Date(
											announcement.end_at
										).toLocaleDateString('en-US', {
											year: 'numeric',
											month: 'short',
											day: 'numeric',
											hour: '2-digit',
											minute: '2-digit',
										})}
									</p>
								</div>
							</div>

							{announcement.delete_at && (
								<Alert variant="destructive">
									<AlertCircle className="h-4 w-4" />
									<AlertDescription>
										This announcement was deleted on{' '}
										{new Date(
											announcement.delete_at
										).toLocaleDateString('en-US')}
									</AlertDescription>
								</Alert>
							)}

							<div className="pt-2 border-t text-xs text-muted-foreground">
								ID: {announcement.id}
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
