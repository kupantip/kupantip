'use client';

import { useEffect, useRef } from 'react';
import { ChatMessage } from '@/services/chat/chatService';
import { useSession } from 'next-auth/react';
import { format, isToday, isYesterday } from 'date-fns';

interface MessageListProps {
	messages: ChatMessage[];
	isLoading?: boolean;
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
	const { data: session } = useSession();
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	const formatMessageTime = (dateString: string) => {
		const date = new Date(dateString);
		if (isToday(date)) {
			return format(date, 'HH:mm');
		} else if (isYesterday(date)) {
			return `Yesterday ${format(date, 'HH:mm')}`;
		} else {
			return format(date, 'MMM dd, HH:mm');
		}
	};

	const isOwnMessage = (message: ChatMessage) => {
		return message.sender_id === session?.user?.user_id;
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-full">
				<p className="text-gray-500">Loading messages...</p>
			</div>
		);
	}

	if (messages.length === 0) {
		return (
			<div className="flex items-center justify-center h-full">
				<p className="text-gray-500">No messages yet. Start the conversation!</p>
			</div>
		);
	}

	return (
		<div className="flex-1 overflow-y-auto p-4 space-y-4">
			{messages.map((message) => (
				<div
					key={message.id}
					className={`flex ${isOwnMessage(message) ? 'justify-end' : 'justify-start'}`}
				>
					<div
						className={`max-w-[70%] ${
							isOwnMessage(message) ? 'order-2' : 'order-1'
						}`}
					>
						{!isOwnMessage(message) && (
							<div className="text-xs text-gray-600 mb-1 px-1">
								{message.sender_display_name}
							</div>
						)}

						<div
							className={`rounded-lg px-4 py-2 ${
								isOwnMessage(message)
									? 'bg-blue-500 text-white'
									: 'bg-gray-200 text-gray-900'
							}`}
						>
							<p className="whitespace-pre-wrap break-words">{message.content}</p>
						</div>

						<div
							className={`text-xs text-gray-500 mt-1 px-1 ${
								isOwnMessage(message) ? 'text-right' : 'text-left'
							}`}
						>
							{formatMessageTime(message.created_at)}
						</div>
					</div>
				</div>
			))}
			<div ref={messagesEndRef} />
		</div>
	);
}
