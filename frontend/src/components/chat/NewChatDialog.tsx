'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { createDirectRoom, ChatRoom } from '@/services/chat/chatService';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { MessageSquarePlus, Search } from 'lucide-react';
import { searchUsers } from '@/services/user/search';
import { User } from '@/types/dashboard/user';

interface NewChatDialogProps {
	onChatCreated: (room: ChatRoom) => void;
}

export default function NewChatDialog({ onChatCreated }: NewChatDialogProps) {
	const { data: session } = useSession();
	const [open, setOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [searchResults, setSearchResults] = useState<User[]>([]);
	const [loading, setLoading] = useState(false);
	const [creating, setCreating] = useState(false);

	const handleSearch = async (query: string) => {
		setSearchQuery(query);

		if (!query.trim() || !session?.accessToken) {
			setSearchResults([]);
			return;
		}

		try {
			setLoading(true);
			const response = await searchUsers(session.accessToken, query);
			// Filter out current user
			const filtered = response.data.filter(
				(user) => user.id !== session.user.user_id
			);
			setSearchResults(filtered);
		} catch (error) {
			console.error('Search failed:', error);
			setSearchResults([]);
		} finally {
			setLoading(false);
		}
	};

	const handleCreateChat = async (userId: string) => {
		if (!session?.accessToken) return;

		try {
			setCreating(true);
			const room = await createDirectRoom(session.accessToken, userId);
			setOpen(false);
			setSearchQuery('');
			setSearchResults([]);
			onChatCreated(room); // Pass the room to parent
		} catch (error) {
			console.error('Failed to create chat:', error);
		} finally {
			setCreating(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="w-full" variant="outline">
					<MessageSquarePlus className="w-4 h-4 mr-2" />
					New Chat
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Start a new chat</DialogTitle>
					<DialogDescription>
						Search for users to start a conversation
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 mt-4">
					<div className="relative">
						<Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
						<Input
							placeholder="Search by username or display name..."
							value={searchQuery}
							onChange={(e) => handleSearch(e.target.value)}
							className="pl-10"
						/>
					</div>

					<div className="max-h-[400px] overflow-y-auto space-y-2">
						{loading && (
							<p className="text-center text-gray-500 py-4">Searching...</p>
						)}

						{!loading && searchQuery && searchResults.length === 0 && (
							<p className="text-center text-gray-500 py-4">No users found</p>
						)}

						{!loading && !searchQuery && (
							<p className="text-center text-gray-400 py-4">
								Type to search for users
							</p>
						)}

						{!loading &&
							searchResults.map((user) => (
								<button
									key={user.id}
									onClick={() => handleCreateChat(user.id)}
									disabled={creating}
									className="w-full p-3 hover:bg-gray-100 rounded-lg flex items-center gap-3 transition-colors disabled:opacity-50"
								>
									<div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
										{user.display_name.charAt(0).toUpperCase()}
									</div>
									<div className="flex-1 text-left">
										<p className="font-semibold text-gray-900">
											{user.display_name}
										</p>
										<p className="text-sm text-gray-500">@{user.handle}</p>
									</div>
								</button>
							))}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
