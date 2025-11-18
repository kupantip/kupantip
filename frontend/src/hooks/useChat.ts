'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ChatMessage } from '@/services/chat/chatService';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000';

interface UseChatOptions {
	token: string | null;
	onNewMessage?: (message: ChatMessage) => void;
	onUserTyping?: (data: TypingData) => void;
	onUserOnline?: (userId: string) => void;
	onUserOffline?: (userId: string) => void;
}

interface TypingData {
	user_id: string;
	user_handle: string;
	user_display_name: string;
	is_typing: boolean;
}

export const useChat = (options: UseChatOptions) => {
	const { token, onNewMessage, onUserTyping, onUserOnline, onUserOffline } =
		options;
	const [socket, setSocket] = useState<Socket | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
	const socketRef = useRef<Socket | null>(null);

	// Initialize socket connection
	useEffect(() => {
		if (!token) return;

		const newSocket = io(SOCKET_URL, {
			auth: { token },
			transports: ['websocket', 'polling'],
		});

		newSocket.on('connect', () => {
			console.log('Connected to chat server');
			setIsConnected(true);
			newSocket.emit('online');
		});

		newSocket.on('disconnect', () => {
			console.log('Disconnected from chat server');
			setIsConnected(false);
		});

		newSocket.on('error', (error: { message: string }) => {
			console.error('Socket error:', error.message);
		});

		newSocket.on('new_message', (message: ChatMessage) => {
			console.log('New message received:', message);
			onNewMessage?.(message);
		});

		newSocket.on('user_typing', (data: TypingData) => {
			onUserTyping?.(data);
		});

		newSocket.on('user_online', (data: { user_id: string }) => {
			onUserOnline?.(data.user_id);
		});

		newSocket.on('user_offline', (data: { user_id: string }) => {
			onUserOffline?.(data.user_id);
		});

		socketRef.current = newSocket;
		setSocket(newSocket);

		return () => {
			newSocket.close();
		};
	}, [token, onNewMessage, onUserTyping, onUserOnline, onUserOffline]);

	// Join room
	const joinRoom = useCallback(
		(roomId: string) => {
			if (!socket || !isConnected) {
				console.warn('Socket not connected');
				return;
			}

			if (activeRoomId && activeRoomId !== roomId) {
				socket.emit('leave_room', activeRoomId);
			}

			socket.emit('join_room', roomId);
			setActiveRoomId(roomId);
			console.log('Joined room:', roomId);
		},
		[socket, isConnected, activeRoomId]
	);

	// Leave room
	const leaveRoom = useCallback(
		(roomId: string) => {
			if (!socket || !isConnected) return;

			socket.emit('leave_room', roomId);
			if (activeRoomId === roomId) {
				setActiveRoomId(null);
			}
			console.log('Left room:', roomId);
		},
		[socket, isConnected, activeRoomId]
	);

	// Send message
	const sendMessage = useCallback(
		(roomId: string, content: string) => {
			if (!socket || !isConnected) {
				console.warn('Socket not connected');
				return false;
			}

			if (!content.trim()) {
				console.warn('Message content is empty');
				return false;
			}

			socket.emit('send_message', { roomId, content: content.trim() });
			return true;
		},
		[socket, isConnected]
	);

	// Send typing indicator
	const sendTypingIndicator = useCallback(
		(roomId: string, isTyping: boolean) => {
			if (!socket || !isConnected) return;

			socket.emit('typing', { roomId, isTyping });
		},
		[socket, isConnected]
	);

	return {
		socket,
		isConnected,
		activeRoomId,
		joinRoom,
		leaveRoom,
		sendMessage,
		sendTypingIndicator,
	};
};
