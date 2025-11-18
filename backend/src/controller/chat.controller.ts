import { Request, Response, NextFunction } from 'express';
import {
	getUserChatRooms,
	getChatRoomById,
	getRoomMessages,
	createChatRoom,
	addParticipant,
	getRoomParticipants,
	isUserInRoom,
	updateLastRead,
	getOrCreateDirectRoom,
	updateChatRoomName,
} from '../models/chat.model';
import * as z from 'zod';

const createRoomSchema = z.object({
	name: z.string().min(1).max(100).optional(),
	is_group: z.boolean().default(false),
	participant_ids: z.array(z.string().uuid()).min(1),
});

const createDirectRoomSchema = z.object({
	recipient_id: z.string().uuid('Invalid recipient_id format'),
});

const roomIdSchema = z.object({
	room_id: z.string().uuid('Invalid room_id format'),
});

const messagesQuerySchema = z.object({
	limit: z.coerce.number().min(1).max(100).default(50),
	before_id: z.string().uuid().optional(),
});

// GET /api/v1/chat/rooms - Get all user's chat rooms
export const getUserChatRoomsController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const rooms = await getUserChatRooms(req.user.user_id);

		return res.status(200).json(rooms);
	} catch (err) {
		next(err);
	}
};

// POST /api/v1/chat/rooms - Create new chat room (group chat)
export const createChatRoomController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const { name, is_group, participant_ids } = createRoomSchema.parse(req.body);

		// Create room
		const room = await createChatRoom(name ?? null, is_group);

		// Add creator as participant
		await addParticipant(room.id, req.user.user_id);

		// Add other participants
		for (const participant_id of participant_ids) {
			if (participant_id !== req.user.user_id) {
				await addParticipant(room.id, participant_id);
			}
		}

		const participants = await getRoomParticipants(room.id);

		return res.status(201).json({
			message: 'Chat room created',
			room: {
				...room,
				participants,
			},
		});
	} catch (err) {
		next(err);
	}
};

// POST /api/v1/chat/rooms/direct - Get or create direct message room
export const createDirectRoomController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const { recipient_id } = createDirectRoomSchema.parse(req.body);

		if (recipient_id === req.user.user_id) {
			return res
				.status(400)
				.json({ message: 'Cannot create chat with yourself' });
		}

		const room = await getOrCreateDirectRoom(req.user.user_id, recipient_id);
		const participants = await getRoomParticipants(room.id);

		return res.status(200).json({
			...room,
			participants,
		});
	} catch (err) {
		next(err);
	}
};

// GET /api/v1/chat/rooms/:room_id - Get chat room details
export const getChatRoomController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const { room_id } = roomIdSchema.parse(req.params);

		// Check if user is participant
		const isParticipant = await isUserInRoom(room_id, req.user.user_id);
		if (!isParticipant) {
			return res.status(403).json({ message: 'Not a participant of this room' });
		}

		const room = await getChatRoomById(room_id);
		if (!room) {
			return res.status(404).json({ message: 'Chat room not found' });
		}

		const participants = await getRoomParticipants(room_id);

		return res.status(200).json({
			...room,
			participants,
		});
	} catch (err) {
		if (err instanceof z.ZodError) {
			return res.status(404).json({ message: 'Chat room not found' });
		}
		next(err);
	}
};

// GET /api/v1/chat/rooms/:room_id/messages - Get messages for a room
export const getRoomMessagesController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const { room_id } = roomIdSchema.parse(req.params);
		const { limit, before_id } = messagesQuerySchema.parse(req.query);

		// Check if user is participant
		const isParticipant = await isUserInRoom(room_id, req.user.user_id);
		if (!isParticipant) {
			return res.status(403).json({ message: 'Not a participant of this room' });
		}

		const messages = await getRoomMessages(room_id, limit, before_id);

		return res.status(200).json(messages);
	} catch (err) {
		if (err instanceof z.ZodError) {
			return res.status(404).json({ message: 'Chat room not found' });
		}
		next(err);
	}
};

// POST /api/v1/chat/rooms/:room_id/read - Mark messages as read
export const markRoomAsReadController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const { room_id } = roomIdSchema.parse(req.params);

		// Check if user is participant
		const isParticipant = await isUserInRoom(room_id, req.user.user_id);
		if (!isParticipant) {
			return res.status(403).json({ message: 'Not a participant of this room' });
		}

		await updateLastRead(room_id, req.user.user_id);

		return res.status(200).json({ message: 'Marked as read' });
	} catch (err) {
		if (err instanceof z.ZodError) {
			return res.status(404).json({ message: 'Chat room not found' });
		}
		next(err);
	}
};

// PATCH /api/v1/chat/rooms/:room_id - Update room name
export const updateRoomNameController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.user) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const { room_id } = roomIdSchema.parse(req.params);
		const updateRoomSchema = z.object({
			name: z.string().min(1).max(100),
		});
		const { name } = updateRoomSchema.parse(req.body);

		// Check if user is participant
		const isParticipant = await isUserInRoom(room_id, req.user.user_id);
		if (!isParticipant) {
			return res.status(403).json({ message: 'Not authorized' });
		}

		// Check if it's a group chat
		const room = await getChatRoomById(room_id);
		if (!room) {
			return res.status(404).json({ message: 'Chat room not found' });
		}
		if (!room.is_group) {
			return res
				.status(400)
				.json({ message: 'Cannot rename direct message rooms' });
		}

		const updatedRoom = await updateChatRoomName(room_id, name);

		return res.status(200).json(updatedRoom);
	} catch (err) {
		if (err instanceof z.ZodError) {
			return res.status(400).json({ errors: err.errors });
		}
		next(err);
	}
};
