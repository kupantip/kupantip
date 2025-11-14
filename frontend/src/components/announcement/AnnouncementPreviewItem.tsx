'use client';

import { useState } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Announcement } from '@/services/announcement/announcement';

interface AnnouncementItemProps {
	announcement: Announcement;
}

export default function AnnouncementPreviewItem({
	announcement,
}: AnnouncementItemProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	const truncateText = (text: string, maxLength: number) => {
		if (text.length <= maxLength) return text;
		return text.substring(0, maxLength) + '...';
	};

	return (
		<Card className="">
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between gap-4">
					<div className="flex-1">
						<CardTitle className="text-lg mb-2">
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

			<CardContent className="space-y-3">
				<div className="prose prose-sm dark:prose-invert max-w-none">
					<p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
						{isExpanded
							? announcement.body_md
							: truncateText(announcement.body_md, 150)}
					</p>
				</div>

				{isExpanded && (
					<>
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
					</>
				)}

				<Button
					variant="outline"
					size="sm"
					onClick={() => setIsExpanded(!isExpanded)}
					className="w-full justify-center text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
				>
					{isExpanded ? (
						<>
							<ChevronUp className="h-4 w-4 mr-2" />
							Show Less
						</>
					) : (
						<>
							<ChevronDown className="h-4 w-4 mr-2" />
							Show More
						</>
					)}
				</Button>
			</CardContent>
		</Card>
	);
}
