'use client';

import React from 'react';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CommunityPage() {
	const data = [
		{
			title: 'Let’s Plan the Upcoming University Festival Together!',
			author: 'Student Union',
			time: '2 hours ago',
		},
		{
			title: 'Photography Club: Monthly Contest Submissions Open 📸',
			author: 'Photography Club',
			time: '5 hours ago',
		},
		{
			title: 'Looking for a Study Group for Advanced Calculus',
			author: 'Engineering Student',
			time: '1 day ago',
		},
		{
			title: 'Chess Club Weekly Meetup — Join Us!',
			author: 'Chess Club',
			time: '2 days ago',
		},
		{
			title: 'Volunteering Opportunity: Campus Clean-Up Event',
			author: 'Green Earth Club',
			time: '3 days ago',
		},
	];

	return (
		<div className="h-full px-10 py-8 space-y-6 rounded-lg bg-gray-50 dark:bg-gray-900">
			{/* Breadcrumb */}
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="/">Home</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>Community</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			{/* Header Card */}
			<Card className="bg-green-1 text-white shadow-md border-none">
				<CardHeader>
					<CardTitle className="text-2xl font-bold">
						Community
					</CardTitle>
				</CardHeader>
				<CardContent className="flex items-center justify-between text-sm">
					<div>3,480 Posts • 1,200 Members</div>
					<Button
						variant="secondary"
						className="bg-white text-green-1 hover:bg-gray-100 cursor-pointer"
					>
						Join
					</Button>
				</CardContent>
			</Card>

			{/* Community Discussions */}
			<Card className="shadow-sm overflow-hidden rounded-lg">
				<CardHeader className="text-green-2 mb-[-20]">
					<CardTitle className="text-lg font-semibold">
						Latest Posts
					</CardTitle>
				</CardHeader>

				<CardContent className="divide-y divide-gray-200 dark:divide-gray-700 p-0">
					{data.map((post, i) => (
						<div
							key={i}
							className="py-4 px-6 flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
						>
							<div>
								<h3 className="font-semibold text-gray-800 dark:text-gray-100 hover:underline">
									{post.title}
								</h3>
								<p className="text-sm text-gray-500">
									{post.author} • {post.time}
								</p>
							</div>
							<Button className="flex items-center text-gray-400 cursor-pointer bg-grey-3 hover:bg-grey-2">
								💬{' '}
								<span className="ml-1 text-sm">
									{/* {post.comments} */}
									12
								</span>
							</Button>
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
