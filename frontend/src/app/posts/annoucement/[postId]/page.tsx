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

const formatTime = (minutes: number) => {
	if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
	if (minutes < 1440)
		return `${Math.floor(minutes / 60)} hour${
			Math.floor(minutes / 60) !== 1 ? 's' : ''
		} ago`;
	return `${Math.floor(minutes / 1440)} day${
		Math.floor(minutes / 1440) !== 1 ? 's' : ''
	} ago`;
};

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
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				{/* Back Button */}
				<Button
					variant="ghost"
					onClick={() => router.back()}
					className="mb-5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
				>
					<ArrowLeft className="w-4 h-4 mr-2" />
					Back to Posts
				</Button>

				{/* Main Content Card */}
				<Card className="overflow-hidden shadow-2xl border-0 rounded-2xl">
					{/* Announcement Banner */}
					<div className="bg-gradient-to-r from-emerald-600 to-emerald-600 px-8 py-2">
						<div className="flex items-center gap-3 text-white">
							<span className="text-2xl">📢</span>
							<span className="text-base font-bold tracking-wide">
								Official Announcement
							</span>
						</div>
					</div>

					{/* Content Area */}
					<div className="px-8 py-2 bg-white dark:bg-gray-800">
						{/* Author Info */}
						<div className="flex items-center gap-4 mb-6">
							<Avatar className="w-12 h-12 border-4 border-emerald-200 dark:border-emerald-700">
								<AvatarImage
									src={`https://api.dicebear.com/7.x/initials/svg?seed=${announcement.author_display_name}`}
								/>
								<AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold text-xl">
									{announcement.author_display_name
										.charAt(0)
										.toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1">
								<div className="flex items-center gap-3 flex-wrap">
									<span className="font-bold text-xl text-gray-900 dark:text-white">
										{announcement.author_display_name}
									</span>
									<span className="px-3 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-full font-bold uppercase tracking-wider">
										{announcement.author_role}
									</span>
								</div>
								<div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
									@{announcement.author_handle} •{' '}
									{formatTime(
										announcement.minutes_since_announced
									)}
								</div>
							</div>
						</div>

						{/* Title */}
						<h1 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white leading-tight">
							{announcement.title}
						</h1>

						{/* Announcement Period */}
						{/* <div className="mb-10 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-base">
								<div className="flex items-center gap-3">
									<Calendar className="w-5 h-5 text-emerald-500" />
									<span className="font-semibold text-gray-800 dark:text-gray-200">
										Start:
									</span>
									<span className="text-gray-600 dark:text-gray-300">
										{new Date(
											announcement.start_at
										).toLocaleString('en-US', {
											dateStyle: 'full',
											timeStyle: 'short',
										})}
									</span>
								</div>
								<div className="flex items-center gap-3">
									<Clock className="w-5 h-5 text-red-500" />
									<span className="font-semibold text-gray-800 dark:text-gray-200">
										End:
									</span>
									<span className="text-gray-600 dark:text-gray-300">
										{new Date(
											announcement.end_at
										).toLocaleString('en-US', {
											dateStyle: 'full',
											timeStyle: 'short',
										})}
									</span>
								</div>
							</div>
						</div> */}

						{/* Body Content */}
						<div className="prose prose-xl max-w-none dark:prose-invert">
							<div className="text-gray-800 dark:text-gray-200 leading-relaxed space-y-6">
								<ReactMarkdown>
									{announcement.body_md}
								</ReactMarkdown>
							</div>
						</div>
					</div>
				</Card>
			</div>
		</div>
	);
}
