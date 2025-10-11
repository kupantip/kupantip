'use client'; // required because we use client-side interactivity

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';

interface PostItemProps {
	id: string;
	title: string;
	author: string;
	category: string;
	time: number; // time in minutes
	comments?: number;
}

export const PostItem: React.FC<PostItemProps> = ({
	id,
	title,
	author,
	category,
	time,
	comments = 0,
}) => {
	const formatTime = (minutes: number) => {
		if (minutes < 60) return `${minutes} min ago`;
		if (minutes < 60 * 24)
			return `${Math.floor(minutes / 60)} hr${
				Math.floor(minutes / 60) > 1 ? 's' : ''
			} ago`;
		return `${Math.floor(minutes / (60 * 24))} day${
			Math.floor(minutes / (60 * 24)) > 1 ? 's' : ''
		} ago`;
	};

	return (
		<Link href={`/dashboard/${id}`} className="block">
			<div
				className="group py-4 px-6 flex justify-between items-center bg-white dark:bg-gray-900 
                        hover:bg-gray-100 dark:hover:bg-gray-800 
                        rounded-lg 
                        transition-all duration-300 ease-in-out 
                        hover:shadow-md"
			>
				<div className="group-hover:pl-2 transition-all duration-300 ease-in-out">
					<h3 className="font-semibold text-gray-800 dark:text-gray-100 group-hover:underline cursor-pointer">
						{title}
					</h3>
					<p className="text-sm text-gray-500">
						<Badge
							variant="secondary"
							className="mr-2 bg-green-100 text-green-800"
						>
							{category}
						</Badge>
						{author} • {formatTime(time)}
					</p>
				</div>
				<div className="flex flex-wrap gap-x-2">
					<Button className="group cursor-pointer bg-grey-3 hover:bg-grey-2 hover:scale-105">
						<Heart className="text-red-500" fill="currentColor" />
					</Button>
					<Button className="flex items-center text-blank cursor-pointer bg-grey-3 hover:bg-grey-2 hover:scale-105">
						💬 <span className="ml-1 text-sm">{comments}</span>
					</Button>
				</div>
			</div>
		</Link>
	);
};
