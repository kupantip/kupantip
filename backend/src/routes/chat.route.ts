import { Router } from 'express';
import {
	getUserChatRoomsController,
	createChatRoomController,
	createDirectRoomController,
	getChatRoomController,
	getRoomMessagesController,
	markRoomAsReadController,
	updateRoomNameController,
} from '../controller/chat.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All chat routes require authentication
router.use(authMiddleware);

// GET /chat/rooms - Get all user's chat rooms
router.get('/rooms', getUserChatRoomsController);

// POST /chat/rooms - Create new group chat
router.post('/rooms', createChatRoomController);

// POST /chat/rooms/direct - Get or create direct message room
router.post('/rooms/direct', createDirectRoomController);

// GET /chat/rooms/:room_id - Get chat room details
router.get('/rooms/:room_id', getChatRoomController);

// GET /chat/rooms/:room_id/messages - Get messages
router.get('/rooms/:room_id/messages', getRoomMessagesController);

// POST /chat/rooms/:room_id/read - Mark as read
router.post('/rooms/:room_id/read', markRoomAsReadController);

// PATCH /chat/rooms/:room_id - Update room name
router.patch('/rooms/:room_id', updateRoomNameController);

export default router;
