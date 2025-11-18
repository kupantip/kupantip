'use client';

import { useState, useEffect } from 'react';
import { Announcement } from '@/services/announcement/announcement';
import AnnouncementPreviewItem from './AnnouncementPreviewItem';
import { ScrollArea } from '@/components/ui/scroll-area';

type Props = {
	announcements?: Announcement[];
};

export default function StackAnnoncement({ announcements }: Props) {
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (!isMounted) {
		return null;
	}

	if (!announcements || announcements.length === 0) {
		return null;
	}

	return (
		<ScrollArea>
			{' '}
			<div className="w-full max-h-[15vh] scroll-smooth">
				<div className="space-y-3">
					{announcements.map((item) => (
						<AnnouncementPreviewItem
							key={item.id}
							announcement={item}
						/>
					))}
				</div>
			</div>
		</ScrollArea>
	);
}
