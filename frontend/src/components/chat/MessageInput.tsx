'use client';

import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageInputProps {
	onSend: (content: string) => void;
	onTyping?: (isTyping: boolean) => void;
	disabled?: boolean;
}

export default function MessageInput({
	onSend,
	onTyping,
	disabled,
}: MessageInputProps) {
	const [message, setMessage] = useState('');
	const [isTyping, setIsTyping] = useState(false);
	const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

	useEffect(() => {
		return () => {
			if (typingTimeoutRef.current) {
				clearTimeout(typingTimeoutRef.current);
			}
		};
	}, []);

	const handleInputChange = (value: string) => {
		setMessage(value);

		if (!onTyping) return;

		// Start typing
		if (!isTyping && value.length > 0) {
			setIsTyping(true);
			onTyping(true);
		}

		// Clear previous timeout
		if (typingTimeoutRef.current) {
			clearTimeout(typingTimeoutRef.current);
		}

		// Stop typing after 2 seconds of no input
		typingTimeoutRef.current = setTimeout(() => {
			setIsTyping(false);
			onTyping(false);
		}, 2000);
	};

	const handleSend = () => {
		if (!message.trim() || disabled) return;

		onSend(message.trim());
		setMessage('');

		// Stop typing indicator
		if (isTyping) {
			setIsTyping(false);
			onTyping?.(false);
			if (typingTimeoutRef.current) {
				clearTimeout(typingTimeoutRef.current);
			}
		}
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	return (
		<div className="border-t bg-white p-4">
			<div className="flex gap-2">
				<textarea
					value={message}
					onChange={(e) => handleInputChange(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="Type a message..."
					disabled={disabled}
					rows={1}
					className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
					style={{
						minHeight: '42px',
						maxHeight: '120px',
					}}
				/>

				<Button
					onClick={handleSend}
					disabled={!message.trim() || disabled}
					className="flex-shrink-0"
					size="icon"
				>
					<Send className="w-5 h-5" />
				</Button>
			</div>

			<p className="text-xs text-gray-500 mt-2">
				Press Enter to send, Shift + Enter for new line
			</p>
		</div>
	);
}
