'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getUserChatRooms, ChatRoom } from '@/services/chat/chatService';
import { MessageCircle, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ChatRoomListProps {
	onSelectRoom: (room: ChatRoom) => void;
	selectedRoomId?: string;
}

export default function ChatRoomList({
	onSelectRoom,
	selectedRoomId,
}: ChatRoomListProps) {
	const { data: session } = useSession();
	const [rooms, setRooms] = useState<ChatRoom[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadRooms();

		// Listen for refresh events
		const handleRefresh = () => loadRooms();
		window.addEventListener('chat:refresh-rooms', handleRefresh);

		return () => {
			window.removeEventListener('chat:refresh-rooms', handleRefresh);
		};
	}, [session]);

	const loadRooms = async () => {
		if (!session?.accessToken) return;

		try {
			// Only show loading state if there are no rooms yet
			if (rooms.length === 0) {
				setLoading(true);
			}
			const data = await getUserChatRooms(session.accessToken);
			setRooms(data);
		} catch (error) {
			console.error('Failed to load chat rooms:', error);
		} finally {
			setLoading(false);
		}
	};

	const getRoomName = (room: ChatRoom) => {
		if (room.name) return room.name;

		// For direct messages, show other participant's name
		if (!room.is_group && room.participants) {
			const otherParticipant = room.participants.find(
				(p) => p.user_id !== session?.user?.user_id
			);
			return otherParticipant?.display_name || 'Unknown';
		}

		return 'Unnamed Chat';
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-full">
				<p className="text-gray-500">Loading chats...</p>
			</div>
		);
	}

	if (rooms.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center h-full p-8 text-center">
				<MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
				<p className="text-gray-500">No conversations yet</p>
				<p className="text-sm text-gray-400 mt-2">
					Start a new chat to begin messaging
				</p>
			</div>
		);
	}

	return (
		<div className="divide-y divide-gray-200 overflow-y-auto">
			{rooms.map((room) => (
				<button
					key={room.id}
					onClick={() => onSelectRoom(room)}
					className={`w-full py-4 px-4 hover:bg-gray-50 transition-colors text-left ${
						selectedRoomId === room.id
							? 'bg-blue-50 border-l-4 border-blue-500'
							: ''
					}`}
				>
					<div className="flex items-start gap-3">
						<div className="flex-shrink-0 mt-1">
							{room.is_group ? (
								<Users className="w-10 h-10 text-gray-400" />
							) : (
								<div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
									{getRoomName(room).charAt(0).toUpperCase()}
								</div>
							)}
						</div>

						<div className="flex-1 min-w-0">
							<div className="flex items-center justify-between mb-1">
								<h3 className="font-semibold text-gray-900 truncate">
									{getRoomName(room)}
								</h3>
								{room.last_message_at && (
									<span className="text-xs text-gray-500 ml-2">
										{formatDistanceToNow(
											new Date(room.last_message_at),
											{
												addSuffix: true,
											}
										)}
									</span>
								)}
							</div>

							{room.last_message && (
								<p className="text-sm text-gray-600 truncate">
									{room.last_message}
								</p>
							)}

							{(room.unread_count ?? 0) > 0 && (
								<div className="mt-1">
									<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500 text-white">
										{room.unread_count}
									</span>
								</div>
							)}
						</div>
					</div>
				</button>
			))}
		</div>
	);
}
