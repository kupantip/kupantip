'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import {
	createDirectRoom,
	createChatRoom,
	ChatRoom,
} from '@/services/chat/chatService';
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
import { Label } from '@/components/ui/label';
import { MessageSquarePlus, Search, X } from 'lucide-react';
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
	const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
	const [groupName, setGroupName] = useState('');
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
			// Filter out current user and already selected users
			const filtered = response.data.filter(
				(user) =>
					user.id !== session.user.user_id &&
					!selectedUsers.some((selected) => selected.id === user.id)
			);
			setSearchResults(filtered);
		} catch (error) {
			console.error('Search failed:', error);
			setSearchResults([]);
		} finally {
			setLoading(false);
		}
	};

	const handleSelectUser = (user: User) => {
		setSelectedUsers((prev) => [...prev, user]);
		setSearchQuery('');
		setSearchResults([]);
	};

	const handleRemoveUser = (userId: string) => {
		setSelectedUsers((prev) => prev.filter((user) => user.id !== userId));
	};

	const handleCreateChat = async () => {
		if (!session?.accessToken || selectedUsers.length === 0) return;

		try {
			setCreating(true);
			let room: ChatRoom;

			if (selectedUsers.length === 1) {
				// Direct chat
				room = await createDirectRoom(
					session.accessToken,
					selectedUsers[0].id
				);
			} else {
				// Group chat
				room = await createChatRoom(session.accessToken, {
					name: groupName.trim() || undefined,
					is_group: true,
					participant_ids: selectedUsers.map((u) => u.id),
				});
			}

			// Reset and close
			setOpen(false);
			setSearchQuery('');
			setSearchResults([]);
			setSelectedUsers([]);
			setGroupName('');
			onChatCreated(room);
		} catch (error) {
			console.error('Failed to create chat:', error);
		} finally {
			setCreating(false);
		}
	};

	const resetDialog = () => {
		setSearchQuery('');
		setSearchResults([]);
		setSelectedUsers([]);
		setGroupName('');
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen) => {
				setOpen(isOpen);
				if (!isOpen) resetDialog();
			}}
		>
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
						Search and select users. Choose one for direct message
						or multiple for a group chat.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 mt-4">
					{/* Selected Users */}
					{selectedUsers.length > 0 && (
						<div className="space-y-2">
							<Label>Selected ({selectedUsers.length})</Label>
							<div className="flex flex-wrap gap-2">
								{selectedUsers.map((user) => (
									<div
										key={user.id}
										className="flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-lg text-sm"
									>
										<span>{user.display_name}</span>
										<button
											onClick={() =>
												handleRemoveUser(user.id)
											}
											className="hover:bg-blue-200 rounded-full p-0.5"
										>
											<X className="w-3 h-3" />
										</button>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Group Name (only for 2+ users) */}
					{selectedUsers.length >= 2 && (
						<div className="space-y-2">
							<Label htmlFor="group-name">
								Group Name (Optional)
							</Label>
							<Input
								id="group-name"
								placeholder="Enter group name..."
								value={groupName}
								onChange={(e) => setGroupName(e.target.value)}
							/>
						</div>
					)}

					{/* Search */}
					<div className="space-y-2">
						<Label>Search Users</Label>
						<div className="relative">
							<Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
							<Input
								placeholder="Search by username or display name..."
								value={searchQuery}
								onChange={(e) => handleSearch(e.target.value)}
								className="pl-10"
							/>
						</div>
					</div>

					{/* Search Results */}
					<div className="max-h-[300px] overflow-y-auto space-y-2">
						{loading && (
							<p className="text-center text-gray-500 py-4">
								Searching...
							</p>
						)}

						{!loading &&
							searchQuery &&
							searchResults.length === 0 && (
								<p className="text-center text-gray-500 py-4">
									No users found
								</p>
							)}

						{!loading &&
							!searchQuery &&
							selectedUsers.length === 0 && (
								<p className="text-center text-gray-400 py-4">
									Type to search for users
								</p>
							)}

						{!loading &&
							searchResults.map((user) => (
								<button
									key={user.id}
									onClick={() => handleSelectUser(user)}
									disabled={creating}
									className="w-full p-3 hover:bg-gray-100 rounded-lg flex items-center gap-3 transition-colors disabled:opacity-50"
								>
									<div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
										{user.display_name
											.charAt(0)
											.toUpperCase()}
									</div>
									<div className="flex-1 text-left">
										<p className="font-semibold text-gray-900">
											{user.display_name}
										</p>
										<p className="text-sm text-gray-500">
											@{user.handle}
										</p>
									</div>
								</button>
							))}
					</div>

					{/* Action Buttons */}
					{selectedUsers.length > 0 && (
						<div className="flex gap-2 pt-4 border-t">
							<Button
								variant="outline"
								onClick={resetDialog}
								disabled={creating}
								className="flex-1"
							>
								Cancel
							</Button>
							<Button
								onClick={handleCreateChat}
								disabled={creating}
								className="flex-1 bg-emerald-600 hover:bg-emerald-700"
							>
								{creating
									? 'Creating...'
									: selectedUsers.length === 1
									? 'Start Direct Chat'
									: `Create Group (${selectedUsers.length})`}
							</Button>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
