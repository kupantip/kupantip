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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil } from 'lucide-react';

interface EditRoomNameDialogProps {
	currentName: string;
	onSave: (newName: string) => Promise<void>;
}

export default function EditRoomNameDialog({
	currentName,
	onSave,
}: EditRoomNameDialogProps) {
	const [open, setOpen] = useState(false);
	const [roomName, setRoomName] = useState(currentName);
	const [saving, setSaving] = useState(false);

	const handleSave = async () => {
		if (!roomName.trim()) return;

		try {
			setSaving(true);
			await onSave(roomName.trim());
			setOpen(false);
		} catch (error) {
			console.error('Failed to update room name:', error);
		} finally {
			setSaving(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
					<Pencil className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Room Name</DialogTitle>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="room-name">Room Name</Label>
						<Input
							id="room-name"
							value={roomName}
							onChange={(e) => setRoomName(e.target.value)}
							placeholder="Enter room name"
							maxLength={100}
						/>
					</div>
					<div className="flex justify-end gap-2">
						<Button
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={saving}
						>
							Cancel
						</Button>
						<Button
							onClick={handleSave}
							disabled={saving || !roomName.trim()}
							className="bg-emerald-600 hover:bg-emerald-700"
						>
							{saving ? 'Saving...' : 'Save'}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
