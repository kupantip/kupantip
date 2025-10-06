'use client';

import React from 'react';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
	const hotPosts = [
		{
			title: 'How to Prepare for the Next KU Tech Expo',
			category: 'Community',
			author: 'Student Affairs',
			time: '2 hours ago',
			comments: 24,
		},
		{
			title: 'Job Openings at the Engineering Faculty 🚀',
			category: 'Recruitment',
			author: 'HR Office',
			time: '5 hours ago',
			comments: 18,
		},
		{
			title: 'New Dormitory Rules Announcement',
			category: 'Announcement',
			author: 'Admin Team',
			time: '1 day ago',
			comments: 12,
		},
	];

	const summaryStats = [
		{ label: 'Announcements', count: 1240 },
		{ label: 'Community Posts', count: 3480 },
		{ label: 'Recruitment Posts', count: 640 },
	];

	return (
		<div className="h-full px-10 py-8 space-y-8 rounded-lg bg-gray-50 dark:bg-gray-900">
			{/* Breadcrumb */}
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbPage>Home</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			{/* Banner Section */}
			<Card className="bg-green-1 text-white shadow-md border-none rounded-xl">
				<CardHeader>
					<CardTitle className="text-2xl font-bold">
						Welcome to KU Pantip 🎓
					</CardTitle>
				</CardHeader>
				<CardContent className="flex items-center justify-between">
					<p className="text-sm">
						Explore the latest updates, discussions, and
						opportunities across our KU community.
					</p>
					<Button
						variant="secondary"
						className="bg-white text-green-1 hover:bg-gray-100 cursor-pointer"
					>
						+ New Post
					</Button>
				</CardContent>
			</Card>

			{/* Hot Posts */}
			<Card className="shadow-sm overflow-hidden rounded-lg">
				<div className="bg-green-1 text-white px-6 py-3">
					<h2 className="text-lg font-semibold">🔥 Hot Posts</h2>
				</div>
				<CardContent className="divide-y divide-gray-200 dark:divide-gray-700 p-0">
					{hotPosts.map((post, i) => (
						<div
							key={i}
							className="py-4 px-6 flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-800 transition"
						>
							<div>
								<h3 className="font-semibold text-gray-800 dark:text-gray-100">
									{post.title}
								</h3>
								<p className="text-sm text-gray-500">
									<Badge
										variant="secondary"
										className="mr-2 bg-green-100 text-green-800"
									>
										{post.category}
									</Badge>
									{post.author} • {post.time}
								</p>
							</div>
							<div className="flex items-center text-gray-400">
								💬{' '}
								<span className="ml-1 text-sm">
									{post.comments}
								</span>
							</div>
						</div>
					))}
				</CardContent>
			</Card>

			{/* Summary Section */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{summaryStats.map((item, i) => (
					<Card
						key={i}
						className="text-center shadow-sm hover:shadow-md transition"
					>
						<CardHeader>
							<CardTitle className="text-green-1">
								{item.label}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
								{item.count.toLocaleString()}
							</p>
							<p className="text-sm text-gray-500 mt-1">
								View more →
							</p>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
