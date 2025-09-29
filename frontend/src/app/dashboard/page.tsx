'use client';

import React, { useEffect, useState } from 'react';
import Post from '@/components/dashboard/Post';
import { getPost } from '@/hooks/dashboard/getPost';
import * as t from '@/types/dashboard/post';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { RightSidebar } from '@/components/dashboard/RightSideBar';
import { TopFilter } from '@/components/dashboard/TopFilter';

export default function DashboardPage() {
	const [postData, setPostData] = useState<t.Post[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError(null);
			try {
				const result = await getPost();
				setPostData(result);
				console.log(result);
			} catch (err: unknown) {
				if (err instanceof Error) {
					setError(err.message || 'Failed to fetch data');
				} else {
					setError('An unknown error occurred');
					console.error('Unexpected error:', err);
				}
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	return (
		<div className="w-full flex gap-4 px-20 mt-2">
			<div className="w-4/5 flex flex-col gap-4">
				<TopFilter />
				{postData.map((data) => (
					<Post key={data.id} post={data} currentPage="dashboard" />
				))}
			</div>
			<RightSidebar />
		</div>
	);
}
