'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
	MessageSquare,
	Share2,
	ArrowUp,
	ArrowDown,
	Ellipsis,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as t from '@/types/dashboard/post';

const daySincePosted = (minutes: number) => {
	if (minutes < 60) {
		return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
	} else if (minutes < 1440) {
		const hours = Math.floor(minutes / 60);
		return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
	} else {
		const days = Math.floor(minutes / 1440);
		return `${days} day${days !== 1 ? 's' : ''} ago`;
	}
};

type PostProps = {
	post: t.Post;
	currentPage: string;
};

export default function Post({ post, currentPage }: PostProps) {
	const router = useRouter();

	const handlePostClick = () => {
		router.push(`/${currentPage}/${post.id}`);
	};

	const handleUpVote = async (e: React.MouseEvent) => {
		e.stopPropagation();
		console.log('Upvote on:', post.id);
	};

	const handleDownVote = async (e: React.MouseEvent) => {
		e.stopPropagation();
		console.log('Downvote on:', post.id);
	};

	const handleOpenComment = async (e: React.MouseEvent) => {
		e.stopPropagation();
		console.log('Comment on:', post.id);
	};

	return (
		<Card
			className="w-full border rounded-lg shadow-sm hover:bg-gray-100 px-5 gap-2"
			onClick={handlePostClick}
		>
			{/* Header */}
			<CardHeader className="flex flex-row items-center gap-2 pt-1 px-3 pb-0">
				<Avatar className="w-8 h-8">
					<AvatarImage src="/chicken.png" alt={post.author_name} />
					<AvatarFallback>
						{post.author_name.charAt(0)}
					</AvatarFallback>
				</Avatar>
				<div className="flex flex-col">
					<span className="text-sm font-semibold">
						{post.author_name}
					</span>
					<span className="text-xs text-gray-500">
						<span>{daySincePosted(post.minutes_since_posted)}</span>
					</span>
				</div>
				{/* <button className="ml-auto bg-purple-2 text-white text-xs px-3 py-1 rounded-lg hover:bg-purple-1">
                    Join
                </button> */}

				<button className="ml-auto p-1 rounded-lg hover:bg-gray-200">
					<Ellipsis />
				</button>
			</CardHeader>

			{/* Content */}
			<CardContent className="px-3 pb-1 w-[50vw]">
				<div className="text-base mb-2 font-semibold text-[1.3em]">{post.title}</div>
				<div className='text-base'>{post.body_md}</div>
				{post.attachments.length > 0 && (
					<div className="border rounded-md overflow-hidden">
						<img
							src={post.attachments[0].url}
							alt="Post attachment"
							className="w-full h-auto object-cover"
						/>
					</div>
				)}

				{/* Actions */}
				<div className="flex flex-wrap gap-1 items-center text-sm text-gray-600 pt-3">
					<div className="flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-xl h-8">
						<ArrowUp
							className="w-6 h-6 p-1 rounded-full border border-gray-200 hover:bg-gray-300"
							onClick={handleUpVote}
						/>
						<span>{post.vote_count}</span>
						<ArrowDown
							className="w-6 h-6 p-1 rounded-full border border-gray-200 hover:bg-gray-300"
							onClick={handleDownVote}
						/>
					</div>

					<div
						className="flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-xl hover:bg-gray-300 h-8"
						onClick={handleOpenComment}
					>
						<MessageSquare className="w-4 h-4" />
						<span>{post.comment_count}</span>
					</div>

					{/* <div
                        className="flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-xl hover:bg-gray-300 h-8"
                        onClick={handleShare}
                    >
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                    </div> */}
				</div>
			</CardContent>
		</Card>
	);
}
