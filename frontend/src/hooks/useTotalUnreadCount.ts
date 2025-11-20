'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getUserChatRooms } from '@/services/chat/chatService';
import { usePathname } from 'next/navigation';

export function useTotalUnreadCount() {
	const { data: session } = useSession();
	const [totalUnread, setTotalUnread] = useState(0);
	const pathname = usePathname();

	const fetchUnreadCount = async () => {
		if (!session?.accessToken) return;

		try {
			const rooms = await getUserChatRooms(session.accessToken);
			const total = rooms.reduce(
				(sum, room) => sum + (room.unread_count || 0),
				0
			);
			setTotalUnread(total);
		} catch (error) {
			console.error('Failed to fetch unread count:', error);
		}
	};

	useEffect(() => {
		fetchUnreadCount();

		// Refresh every 30 seconds
		const interval = setInterval(fetchUnreadCount, 30000);

		// Listen for custom events to refresh immediately
		const handleRefresh = () => fetchUnreadCount();
		window.addEventListener('chat:refresh-unread', handleRefresh);

		return () => {
			clearInterval(interval);
			window.removeEventListener('chat:refresh-unread', handleRefresh);
		};
	}, [session?.accessToken]);

	// Refresh when navigating away from chat page
	useEffect(() => {
		if (pathname && !pathname.includes('/chat')) {
			fetchUnreadCount();
		}
	}, [pathname]);

	return totalUnread;
}
