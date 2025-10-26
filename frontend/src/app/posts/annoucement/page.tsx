'use client';

import React, { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

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
import { PostItem } from '@/components/posts/PostItem';

import { getPost } from '@/services/dashboard/getPost';
import * as t from '@/types/dashboard/post';

export default function AnnoucementPage() {
	const [postArray, setPostArray] = useState<t.Post[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);

	useEffect(() => {
		AOS.init({
			duration: 500,
			once: true,
			offset: 80,
		});
	}, []);

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

	if (loading) {
		return (
			<div className="h-full px-10 py-8 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-1 mx-auto"></div>
					<p className="mt-4 text-gray-600 dark:text-gray-400">
						Loading announcements...
					</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="h-full px-10 py-8 flex items-center justify-center">
				<div className="text-center">
					<p className="text-red-600 dark:text-red-400">
						Failed to load announcements
					</p>
					<Button
						onClick={() => window.location.reload()}
						className="mt-4"
					>
						Try Again
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div
			data-aos="fade-up"
			className="h-full px-10 py-8 space-y-6 rounded-lg bg-gray-50 dark:bg-gray-900"
		>
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
					<CardTitle>
						<div className="text-2xl font-bold">Announcements</div>
						<div className="text-sm font-normal pt-2">
							1,240 Posts • 520 Followers
						</div>
					</CardTitle>
				</CardHeader>
				<CardContent className="flex items-center justify-between text-sm">
					<div>Latest Announcements and Student Notices</div>
					<Button
						variant="secondary"
						className="bg-white text-green-1 hover:bg-gray-100 cursor-pointer hover:scale-105"
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
						<PostItem
							key={i}
							id={post.id}
							title={post.title}
							category={post.category_label}
							author={post.author_name}
							time={post.minutes_since_posted}
							comments={post.comment_count}
						/>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
