'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAnnouncementById } from '@/services/announcement/announcement';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Folder, Calendar, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import AOS from 'aos';
import 'aos/dist/aos.css';
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from '@/components/ui/empty';
import { formatMinutes } from '@/lib/time';
import AnnouncementItem from '@/components/announcement/AnnouncementItem';

export default function AnnouncementDetailPage() {
	const params = useParams() as { postId: string };
	const router = useRouter();
	const announcementId = params.postId;

	const { data: announcement, isLoading } =
		useAnnouncementById(announcementId);

	useEffect(() => {
		AOS.init({
			duration: 500,
			once: true,
			offset: 80,
		});
	}, []);

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-[60vh]">
				<Empty>
					<EmptyHeader>
						<EmptyMedia>
							<Loader2 className="animate-spin w-8 h-8" />
						</EmptyMedia>
						<EmptyTitle>Loading Announcement...</EmptyTitle>
						<EmptyDescription>
							Please wait while we fetch the post for you.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			</div>
		);
	}

	if (!announcement) {
		return (
			<div className="flex justify-center items-center h-[60vh]">
				<Empty>
					<EmptyHeader>
						<EmptyMedia>
							<Folder className="w-8 h-8" />
						</EmptyMedia>
						<EmptyTitle>Post Not Found</EmptyTitle>
						<EmptyDescription>
							The post you are looking for doesn&apos;t exist or
							may have been removed.
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<div className="flex gap-2">
							<Button onClick={() => window.history.back()}>
								Go Back
							</Button>
							<Button
								variant="outline"
								onClick={() =>
									(window.location.href = '/posts')
								}
							>
								Go Back
							</Button>
						</div>
					</EmptyContent>
				</Empty>
			</div>
		);
	}

	return (
		<div className="min-h-full bg-gray-50 dark:bg-gray-900 p-4 md:p-8 lg:p-12">
			<AnnouncementItem announcement={announcement} />
		</div>
	);
}
