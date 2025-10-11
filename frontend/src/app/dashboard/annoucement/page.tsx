'use client';

import React, { useEffect, useState } from 'react';

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
import { PostItem } from '@/components/dashboard/PostItem';

import { getPost } from '@/hooks/dashboard/getPost';
import * as t from '@/types/dashboard/post';

export default function AnnoucementPage() {

	const [postArray, setPostArray] = useState<t.Post[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);

	useEffect(() => {
		const fetchPosts = async () => {
			try {
				const data = await getPost('Announcement');
				setPostArray(data);
				console.log(postArray);
			} catch (error) {
				setError(true);
			} finally {
				setLoading(false);
			}
		};

		fetchPosts();
	}, []);

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
						Latest Posts
					</CardTitle>
				</CardHeader>
				<CardContent className="divide-y divide-gray-200 dark:divide-gray-700 p-0">
					{postArray.map((post, i) => (
						<PostItem key={i} id={post.id} title={post.title} author={post.author_name} time={post.minutes_since_posted} comments={post.comment_count}/>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
