'use client';

import React from 'react';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
    BreadcrumbLink,
    BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function RecruitmentPage() {
	const jobPosts = [
		{
			title: 'Frontend Developer (Internship)',
			department: 'Computer Engineering',
			location: 'KU Bangkhen Campus',
			type: 'Internship',
			time: '2 hours ago',
			postedBy: 'KU Tech Department',
		},
		{
			title: 'Research Assistant – AI & Robotics Lab',
			department: 'Faculty of Engineering',
			location: 'Kasetsart University',
			type: 'Part-Time',
			time: '1 day ago',
			postedBy: 'AI Robotics Lab',
		},
		{
			title: 'Backend Developer (Full-Time)',
			department: 'Information Technology Services',
			location: 'KU Office',
			type: 'Full-Time',
			time: '3 days ago',
			postedBy: 'ITS Team',
		},
	];

	const recruitmentStats = [
		{ label: 'Active Job Posts', count: 156 },
		{ label: 'Companies Partnered', count: 42 },
		{ label: 'Applications Submitted', count: 980 },
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
						<BreadcrumbPage>Recruitment</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			{/* Banner Section */}
			<Card className="bg-green-1 text-white shadow-md border-none rounded-xl">
				<CardHeader>
					<CardTitle className="text-2xl font-bold">
						Find Your Next Opportunity 💼
					</CardTitle>
				</CardHeader>
				<CardContent className="flex items-center justify-between">
					<p className="text-sm">
						Explore job openings, internships, and research
						opportunities from our KU network and beyond.
					</p>
					<Button
						variant="secondary"
						className="bg-white text-green-1 hover:bg-gray-100 cursor-pointer"
					>
						+ Post Job
					</Button>
				</CardContent>
			</Card>

			{/* Job Posts Section */}
			<Card className="shadow-sm overflow-hidden rounded-lg">
				<CardHeader className="text-green-2 mb-[-20]">
					<CardTitle className="text-lg font-semibold">
						📢 Latest Job Posts
					</CardTitle>
				</CardHeader>
				<CardContent className="divide-y divide-gray-200 dark:divide-gray-700 p-0">
					{jobPosts.map((job, i) => (
						<div
							key={i}
							className="group py-4 px-6 flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
						>
							<div>
								<h3 className="font-semibold text-gray-800 dark:text-gray-100 group-hover:underline">
									{job.title}
								</h3>
								<p className="text-sm text-gray-500">
									<Badge
										variant="secondary"
										className="mr-2 bg-green-100 text-green-800"
									>
										{job.type}
									</Badge>
									{job.department} • {job.location} •{' '}
									{job.time}
								</p>
								<p className="text-xs text-gray-400 mt-1">
									Posted by {job.postedBy}
								</p>
							</div>
							<div>
								<Button
									variant="outline"
									className="text-green-1 border-green-1 hover:bg-green-50"
								>
									Apply
								</Button>
							</div>
						</div>
					))}
				</CardContent>
			</Card>

			{/* Recruitment Stats */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{recruitmentStats.map((item, i) => (
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
								View details →
							</p>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
