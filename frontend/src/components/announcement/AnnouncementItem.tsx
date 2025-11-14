'use client';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Announcement } from '@/services/post/annoucement';

export default function AnnouncementItem(announcement: Announcement) {
	return (
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
									By {announcement.author_display_name}
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
							{new Date(announcement.start_at).toLocaleDateString(
								'en-US',
								{
									year: 'numeric',
									month: 'short',
									day: 'numeric',
									hour: '2-digit',
									minute: '2-digit',
								}
							)}
						</p>
					</div>
					<div>
						<span className="text-muted-foreground">End Date:</span>
						<p className="font-medium">
							{new Date(announcement.end_at).toLocaleDateString(
								'en-US',
								{
									year: 'numeric',
									month: 'short',
									day: 'numeric',
									hour: '2-digit',
									minute: '2-digit',
								}
							)}
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
	);
}
