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

export default function AnnoucementPage() {
	const data = [
		{
			title: 'New Campus Update: Facilities Expansion 2025',
			author: 'Admin Team',
			time: '3 hours ago',
		},
		{
			title: 'Job Fair: Tech and Innovation Week',
			author: 'Recruitment Dept.',
			time: '1 day ago',
		},
		{
			title: 'Student Activity Grant Applications Now Open',
			author: 'Student Affairs',
			time: '2 days ago',
		},
	];

	return (
		<div className="h-full px-10 py-8 space-y-6 rounded-lg bg-gray-50 dark:bg-gray-900">
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="/">Home</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>Announcement</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			<Card className="bg-green-1 text-white shadow-md border-none">
				<CardHeader>
					<CardTitle className="text-2xl font-bold">
						Announcements
					</CardTitle>
				</CardHeader>
				<CardContent className="flex items-center justify-between text-sm">
					<div>1,240 Posts • 520 Followers</div>
					<Button
						variant="secondary"
						className="bg-white text-green-1 hover:bg-gray-100 cursor-pointer"
					>
						Follow
					</Button>
				</CardContent>
			</Card>

			<Card className="shadow-sm overflow-hidden rounded-lg">
				<CardHeader className="text-green-2 mb-[-20]">
					<CardTitle className="text-lg font-semibold">
						Latest Post
					</CardTitle>
				</CardHeader>
				<CardContent className="divide-y divide-gray-200 dark:divide-gray-700">
					{data.map((post, i) => (
						<div
							key={i}
							className="py-4 flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-800 px-2 rounded-lg transition"
						>
							<div>
								<h3 className="font-semibold text-gray-800 dark:text-gray-100">
									{post.title}
								</h3>
								<p className="text-sm text-gray-500">
									{post.author} • {post.time}
								</p>
							</div>
							<div className="text-sm text-gray-400">💬 12</div>
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
