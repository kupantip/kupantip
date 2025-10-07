'use client';

import { useState, useEffect } from 'react';
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
import { deletePost } from '@/services/user/delete_post';
import { upvotePost, downvotePost, deletevotePost, useUserVote } from '@/services/user/vote';


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
	const [menuOpen, setMenuOpen] = useState(false)
	const { userVote, updateUserVote } = useUserVote(post.id, post.author_id);

	const handlePostClick = () => {
		router.push(`/${currentPage}/${post.id}?userVote=${userVote}`);
	};

	const handleUpVote = async (e: React.MouseEvent) => {
		e.stopPropagation();
		let newVote = userVote
		
		if(userVote === 1){
			newVote = 0;
			try{
				await deletevotePost(post.id);
				console.log("Undo UpVote success");
			} catch (err : unknown){}
		}else{
			newVote = 1
			try{
				await upvotePost(post.id);
				console.log("UpVote Post Success",post.id);
			} catch (err : unknown){}
		}
		
		updateUserVote(newVote);
	};

	const handleDownVote = async (e: React.MouseEvent) => {
		e.stopPropagation();
		let newVote = userVote
		
		if(userVote === -1){
			newVote = 0;
			try{
				await deletevotePost(post.id);
				console.log("Undo DownVote success");
			} catch (err : unknown){}
		}else{
			newVote = -1
			try{
				await downvotePost(post.id);
				console.log("DownVote Post Success",post.id);
			} catch (err : unknown){}
		}

		updateUserVote(newVote);
	};

	const handleOpenComment = async (e: React.MouseEvent) => {
		e.stopPropagation();
		console.log('Comment on:', post.id);
	};

	const handleEdit = async (e: React.MouseEvent) => {
		e.stopPropagation();
		setMenuOpen(false);
		console.log("Edit on", post.id)
		router.push(`/${currentPage}/${post.id}/edit`);
	}

	const handleDelete = async (e: React.MouseEvent) => {
		e.stopPropagation();
		setMenuOpen(false);
		try {
			await deletePost(post.id)
			console.log("Delete post", post.id," success")
			window.location.reload();
		} catch (err : unknown){
			console.log("Delete Failed");
		}
	}

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
				<div className="ml-auto relative">
					<button 
						className="p-1 rounded-lg hover:bg-gray-200"
						onClick={(e) => {
							e.stopPropagation();
							setMenuOpen(!menuOpen);
						}}>
						<Ellipsis />
					</button>
					{menuOpen && (
						<div
							className="absolute mt-2 w-24 right-0 bg-white shadow rounded-lg"
						>
							<button
								className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
								onClick={handleEdit}
							>
								Edit
							</button>
							<button
								className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
								onClick={handleDelete}
							>
								Delete
							</button>
						</div>
					)}					
				</div>

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
							className={`w-6 h-6 p-1 rounded-full border border-gray-200 hover:bg-gray-300 cursor-pointer
								${userVote === 1 ? "bg-green-400 text-black" : "hover:bg-gray-200"}`}
							onClick={handleUpVote}
						/>
						<span>{post.vote_score}</span>
						<ArrowDown
							className={`w-6 h-6 p-1 rounded-full border border-gray-200 hover:bg-gray-300 cursor-pointer
								${userVote === -1 ? "bg-green-400 text-black" : "hover:bg-gray-200"}`}
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
