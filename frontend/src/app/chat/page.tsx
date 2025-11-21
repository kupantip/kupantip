'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
	ChatRoom,
	ChatMessage,
	getRoomMessages,
	markRoomAsRead,
	updateRoomName,
} from '@/services/chat/chatService';
import { useChat } from '@/hooks/useChat';
import ChatRoomList from '@/components/chat/ChatRoomList';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import NewChatDialog from '@/components/chat/NewChatDialog';
import EditRoomNameDialog from '@/components/chat/EditRoomNameDialog';
import GroupMembersDialog from '@/components/chat/GroupMembersDialog';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ChatPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [loadingMessages, setLoadingMessages] = useState(false);
	const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

	// Redirect if not authenticated
	useEffect(() => {
		if (status === 'unauthenticated') {
			router.push('/login');
		}
	}, [status, router]);

	// Handle new messages from Socket.IO
	const handleNewMessage = useCallback(
		(message: ChatMessage) => {
			if (selectedRoom && message.room_id === selectedRoom.id) {
				setMessages((prev) => [...prev, message]);

				// Mark as read if it's not our message and refresh room list
				if (
					message.sender_id !== session?.user?.user_id &&
					session?.accessToken
				) {
					markRoomAsRead(session.accessToken, message.room_id).then(
						() => {
							window.dispatchEvent(
								new Event('chat:refresh-rooms')
							);
						}
					);
				}
			} else {
				// Message from another room, refresh list to show unread badge
				window.dispatchEvent(new Event('chat:refresh-rooms'));
			}
		},
		[selectedRoom, session]
	);

	// Handle typing indicator
	const handleUserTyping = useCallback(
		(data: {
			user_id: string;
			user_display_name: string;
			is_typing: boolean;
		}) => {
			if (!selectedRoom) return;

			setTypingUsers((prev) => {
				const newSet = new Set(prev);
				if (data.is_typing) {
					newSet.add(data.user_display_name);
				} else {
					newSet.delete(data.user_display_name);
				}
				return newSet;
			});
		},
		[selectedRoom]
	);

	// Initialize Socket.IO
	const {
		isConnected,
		joinRoom,
		leaveRoom,
		sendMessage,
		sendTypingIndicator,
	} = useChat({
		token: session?.accessToken || null,
		onNewMessage: handleNewMessage,
		onUserTyping: handleUserTyping,
	});

	// Load messages when room is selected
	useEffect(() => {
		if (!selectedRoom || !session?.accessToken) return;

		loadMessages();
		joinRoom(selectedRoom.id);

		return () => {
			if (selectedRoom) {
				leaveRoom(selectedRoom.id);
			}
		};
	}, [selectedRoom?.id, session?.accessToken, joinRoom, leaveRoom]);

	const loadMessages = async () => {
		if (!selectedRoom || !session?.accessToken) return;

		try {
			setLoadingMessages(true);
			const data = await getRoomMessages(
				session.accessToken,
				selectedRoom.id
			);
			setMessages(data);

			// Mark as read and refresh room list to update unread count
			await markRoomAsRead(session.accessToken, selectedRoom.id);
			window.dispatchEvent(new Event('chat:refresh-rooms'));

			// Trigger global unread count refresh
			window.dispatchEvent(new Event('chat:refresh-unread'));
		} catch (error) {
			console.error('Failed to load messages:', error);
		} finally {
			setLoadingMessages(false);
		}
	};

	const handleSelectRoom = (room: ChatRoom) => {
		if (selectedRoom?.id !== room.id) {
			setSelectedRoom(room);
			setMessages([]);
		}
	};

	const handleSendMessage = (content: string) => {
		if (!selectedRoom || !isConnected) return;

		const success = sendMessage(selectedRoom.id, content);
		if (!success) {
			console.error('Failed to send message');
		}
	};

	const handleTyping = (isTyping: boolean) => {
		if (!selectedRoom) return;
		sendTypingIndicator(selectedRoom.id, isTyping);
	};

	const handleUpdateRoomName = async (newName: string) => {
		if (!selectedRoom || !session?.accessToken) return;

		try {
			const updatedRoom = await updateRoomName(
				session.accessToken,
				selectedRoom.id,
				newName
			);
			setSelectedRoom(updatedRoom);
			window.dispatchEvent(new Event('chat:refresh-rooms')); // Refresh room list
		} catch (error) {
			console.error('Failed to update room name:', error);
			throw error;
		}
	};

	const handleChatCreated = (room: ChatRoom) => {
		window.dispatchEvent(new Event('chat:refresh-rooms')); // Refresh room list
		setSelectedRoom(room); // Select the new room immediately
	};

	if (status === 'loading') {
		return (
			<div className="flex items-center justify-center h-screen">
				<p className="text-gray-500">Loading...</p>
			</div>
		);
	}

	if (!session) {
		return null;
	}

	return (
		<div className="flex h-[calc(100vh-4rem)] bg-gray-100">
			{/* Sidebar - Chat Room List */}
			<div className={`${selectedRoom ? 'hidden md:flex' : 'flex'} w-full md:w-80 bg-white border-r border-gray-200 flex-col`}>
				<div className="p-4 border-b border-gray-200">
					<h1 className="text-xl font-bold text-gray-900 mb-3">
						Messages
					</h1>

					<NewChatDialog onChatCreated={handleChatCreated} />

					<div className="flex items-center gap-2 mt-3">
						<div
							className={`w-2 h-2 rounded-full ${
								isConnected ? 'bg-green-500' : 'bg-gray-300'
							}`}
						/>
						<span className="text-sm text-gray-600">
							{isConnected ? 'Connected' : 'Disconnected'}
						</span>
					</div>
				</div>

				<div className="flex-1 overflow-hidden">
					<ChatRoomList
						onSelectRoom={handleSelectRoom}
						selectedRoomId={selectedRoom?.id}
					/>
				</div>
			</div>

			{/* Main Chat Area */}
			<div className={`${!selectedRoom ? 'hidden md:flex' : 'flex'} flex-1 flex-col w-full`}>
				{selectedRoom ? (
					<>
						{/* Chat Header */}
						<div className="bg-white border-b border-gray-200 p-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3 flex-1">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="md:hidden -ml-2"
                                        onClick={() => setSelectedRoom(null)}
                                    >
                                        <ArrowLeft className="h-5 w-5" />
                                    </Button>
									<div className='flex-1'>
                                        <h2 className="text-lg font-semibold text-gray-900 line-clamp-1">
                                            {selectedRoom.name ||
                                                selectedRoom.participants
                                                    ?.filter(
                                                        (p) =>
                                                            p.user_id !==
                                                            session.user.user_id
                                                    )
                                                    .map((p) => p.display_name)
                                                    .join(', ') ||
                                                'Chat'}
                                        </h2>
                                        {typingUsers.size > 0 && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                {Array.from(typingUsers).join(', ')}{' '}
                                                {typingUsers.size === 1
                                                    ? 'is'
                                                    : 'are'}{' '}
                                                typing...
                                            </p>
                                        )}
                                    </div>
								</div>
								<div className="flex items-center gap-2">
									{selectedRoom.is_group &&
										selectedRoom.participants && (
											<GroupMembersDialog
												participants={
													selectedRoom.participants
												}
												currentUserId={
													session.user.user_id
												}
											/>
										)}
									{selectedRoom.is_group && (
										<EditRoomNameDialog
											currentName={
												selectedRoom.name ||
												'Unnamed Group'
											}
											onSave={handleUpdateRoomName}
										/>
									)}
								</div>
							</div>
						</div>{' '}
						{/* Messages */}
						<MessageList
							messages={messages}
							isLoading={loadingMessages}
						/>
						{/* Message Input */}
						<MessageInput
							onSend={handleSendMessage}
							onTyping={handleTyping}
							disabled={!isConnected}
						/>
					</>
				) : (
					<div className="flex-1 flex flex-col items-center justify-center bg-white">
						<MessageCircle className="w-24 h-24 text-gray-300 mb-4" />
						<h3 className="text-xl font-semibold text-gray-700 mb-2">
							Select a conversation
						</h3>
						<p className="text-gray-500">
							Choose from your existing conversations or start a
							new one
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
