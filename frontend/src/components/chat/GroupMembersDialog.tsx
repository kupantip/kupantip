'use client';

import { useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { ChatParticipant } from '@/services/chat/chatService';

interface GroupMembersDialogProps {
	participants: ChatParticipant[];
	currentUserId: string;
}

export default function GroupMembersDialog({
	participants,
	currentUserId,
}: GroupMembersDialogProps) {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="ghost" size="sm" className="h-8 px-2 gap-1">
					<Users className="h-4 w-4" />
					<span className="text-sm">{participants.length}</span>
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[400px]">
				<DialogHeader>
					<DialogTitle>
						Group Members ({participants.length})
					</DialogTitle>
				</DialogHeader>
				<div className="space-y-2 mt-4 max-h-[400px] overflow-y-auto">
					{participants.map((participant) => {
						const isCurrentUser =
							participant.user_id === currentUserId;
						return (
							<div
								key={participant.user_id}
								className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
							>
								<div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
									{participant.display_name
										.charAt(0)
										.toUpperCase()}
								</div>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2">
										<p className="font-semibold text-gray-900 truncate">
											{participant.display_name}
										</p>
										{isCurrentUser && (
											<span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
												You
											</span>
										)}
									</div>
									<p className="text-sm text-gray-500 truncate">
										@{participant.handle}
									</p>
								</div>
							</div>
						);
					})}
				</div>
			</DialogContent>
		</Dialog>
	);
}
