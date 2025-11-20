import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface ChatRoom {
	id: string;
	name: string | null;
	is_group: boolean;
	created_at: string;
	updated_at: string;
	last_message?: string;
	last_message_at?: string;
	unread_count?: number;
	participants?: ChatParticipant[];
}

export interface ChatParticipant {
	room_id: string;
	user_id: string;
	joined_at: string;
	last_read: string | null;
	handle: string;
	display_name: string;
}

export interface ChatMessage {
	id: string;
	room_id: string;
	sender_id: string;
	content: string;
	created_at: string;
	sender_handle: string;
	sender_display_name: string;
}

// Get all user's chat rooms
export const getUserChatRooms = async (token: string): Promise<ChatRoom[]> => {
	const response = await axios.get(`${API_URL}/chat/rooms`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	return response.data;
};

// Create new group chat
export const createChatRoom = async (
	token: string,
	data: {
		name?: string;
		is_group: boolean;
		participant_ids: string[];
	}
): Promise<ChatRoom> => {
	const response = await axios.post(`${API_URL}/chat/rooms`, data, {
		headers: { Authorization: `Bearer ${token}` },
	});
	return response.data.room;
};

// Get or create direct message room
export const createDirectRoom = async (
	token: string,
	recipient_id: string
): Promise<ChatRoom> => {
	const response = await axios.post(
		`${API_URL}/chat/rooms/direct`,
		{ recipient_id },
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);
	return response.data;
};

// Get chat room details
export const getChatRoom = async (
	token: string,
	roomId: string
): Promise<ChatRoom> => {
	const response = await axios.get(`${API_URL}/chat/rooms/${roomId}`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	return response.data;
};

// Get messages for a room
export const getRoomMessages = async (
	token: string,
	roomId: string,
	limit: number = 50,
	beforeId?: string
): Promise<ChatMessage[]> => {
	const params = new URLSearchParams({ limit: limit.toString() });
	if (beforeId) {
		params.append('before_id', beforeId);
	}

	const response = await axios.get(
		`${API_URL}/chat/rooms/${roomId}/messages?${params}`,
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);
	return response.data;
};

// Mark messages as read
export const markRoomAsRead = async (
	token: string,
	roomId: string
): Promise<void> => {
	await axios.post(
		`${API_URL}/chat/rooms/${roomId}/read`,
		{},
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);
};

// Update room name (for group chats)
export const updateRoomName = async (
	token: string,
	roomId: string,
	name: string
): Promise<ChatRoom> => {
	const response = await axios.patch(
		`${API_URL}/chat/rooms/${roomId}`,
		{ name },
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);
	return response.data;
};
