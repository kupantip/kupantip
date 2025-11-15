'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Announcement } from '@/services/announcement/announcement';
import { formatMinutes } from '@/lib/time';
import Link from 'next/link';

interface AnnouncementItemProps {
	announcement: Announcement;
}

export default function AnnouncementPreviewItem({
	announcement,
}: AnnouncementItemProps) {
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (!isMounted) {
		return null;
	}

	return (
		<Link href={`/posts/annoucement/${announcement.id}`}>
			<div
				className="group py-4 px-6 flex justify-between items-center bg-white dark:bg-gray-900 
                        hover:bg-gray-100 dark:hover:bg-gray-800 
                        rounded-lg 
                        transition-all duration-300 ease-in-out 
                        hover:shadow-md"
			>
				<div className="group-hover:pl-2 transition-all duration-300 ease-in-out">
					<h3 className="font-semibold text-gray-800 dark:text-gray-100 group-hover:underline cursor-pointer">
						{announcement.title}{' '}
					</h3>
					<p className="text-sm text-gray-500">
						<Badge
							variant="secondary"
							className="mr-2 bg-green-100 text-green-800"
						>
							{announcement.author_role}
						</Badge>
						{announcement.author_handle} •{' '}
						{formatMinutes(announcement.minutes_since_announced)}
					</p>
				</div>
			</div>
		</Link>
	);
}
