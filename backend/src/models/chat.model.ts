import { getDbConnection } from '../database/mssql.database';

export interface ChatRoom {
	id: string;
	name: string | null;
	is_group: boolean;
	created_at: Date;
	updated_at: Date;
}

export interface ChatMessage {
	id: string;
	room_id: string;
	sender_id: string;
	content: string;
	created_at: Date;
	sender_handle?: string;
	sender_display_name?: string;
}

export interface ChatParticipant {
	room_id: string;
	user_id: string;
	joined_at: Date;
	last_read: Date | null;
}

// Chat Room operations
export const createChatRoom = async (
	name: string | null,
	is_group: boolean
) => {
	const pool = await getDbConnection();

	const result = await pool
		.request()
		.input('name', name)
		.input('is_group', is_group).query(`
			INSERT INTO [dbo].[chat_room] (name, is_group)
			OUTPUT inserted.id, inserted.name, inserted.is_group, 
				   inserted.created_at, inserted.updated_at
			VALUES (@name, @is_group)
		`);

	return result.recordset[0];
};

export const getChatRoomById = async (room_id: string) => {
	const pool = await getDbConnection();

	const result = await pool.request().input('room_id', room_id).query(`
		SELECT id, name, is_group, created_at, updated_at
		FROM [dbo].[chat_room]
		WHERE id = @room_id
	`);

	return result.recordset.length > 0 ? result.recordset[0] : null;
};

export const updateChatRoomName = async (room_id: string, name: string) => {
	const pool = await getDbConnection();

	const result = await pool
		.request()
		.input('room_id', room_id)
		.input('name', name).query(`
			UPDATE [dbo].[chat_room]
			SET name = @name, updated_at = CURRENT_TIMESTAMP
			OUTPUT inserted.id, inserted.name, inserted.is_group, 
				   inserted.created_at, inserted.updated_at
			WHERE id = @room_id
		`);

	return result.recordset[0];
};

export const getUserChatRooms = async (user_id: string) => {
	const pool = await getDbConnection();

	const result = await pool.request().input('user_id', user_id).query(`
		SELECT 
			cr.id,
			cr.name,
			cr.is_group,
			cr.created_at,
			cr.updated_at,
			(
				SELECT TOP 1 content
				FROM [dbo].[chat_message]
				WHERE room_id = cr.id
				ORDER BY created_at DESC
			) as last_message,
			(
				SELECT TOP 1 created_at
				FROM [dbo].[chat_message]
				WHERE room_id = cr.id
				ORDER BY created_at DESC
			) as last_message_at,
			(
				SELECT COUNT(*)
				FROM [dbo].[chat_message] cm
				WHERE cm.room_id = cr.id
				AND cm.created_at > ISNULL(cp.last_read, '1900-01-01')
				AND cm.sender_id != @user_id
			) as unread_count,
			(
				SELECT 
					p.user_id,
					p.joined_at,
					p.last_read,
					u.handle,
					u.display_name
				FROM [dbo].[chat_participant] p
				INNER JOIN [dbo].[app_user] u ON p.user_id = u.id
				WHERE p.room_id = cr.id
				FOR JSON PATH
			) as participants_json
		FROM [dbo].[chat_room] cr
		INNER JOIN [dbo].[chat_participant] cp ON cr.id = cp.room_id
		WHERE cp.user_id = @user_id
		ORDER BY cr.updated_at DESC
	`);

	// Parse participants JSON
	return result.recordset.map((room: Record<string, unknown>) => ({
		...room,
		participants: room.participants_json
			? JSON.parse(room.participants_json as string)
			: [],
		participants_json: undefined, // Remove the JSON string field
	}));
};

// Participant operations
export const addParticipant = async (room_id: string, user_id: string) => {
	if (!room_id || !user_id) {
		throw new Error(
			`Invalid parameters: room_id=${room_id}, user_id=${user_id}`
		);
	}

	const pool = await getDbConnection();

	const result = await pool
		.request()
		.input('room_id', room_id)
		.input('user_id', user_id).query(`
			INSERT INTO [dbo].[chat_participant] (room_id, user_id)
			OUTPUT inserted.room_id, inserted.user_id, inserted.joined_at, inserted.last_read
			VALUES (@room_id, @user_id)
		`);

	return result.recordset[0];
};

export const getRoomParticipants = async (room_id: string) => {
	const pool = await getDbConnection();

	const result = await pool.request().input('room_id', room_id).query(`
		SELECT 
			cp.room_id,
			cp.user_id,
			cp.joined_at,
			cp.last_read,
			u.handle,
			u.display_name
		FROM [dbo].[chat_participant] cp
		INNER JOIN [dbo].[app_user] u ON cp.user_id = u.id
		WHERE cp.room_id = @room_id
	`);

	return result.recordset;
};

export const isUserInRoom = async (room_id: string, user_id: string) => {
	const pool = await getDbConnection();

	const result = await pool
		.request()
		.input('room_id', room_id)
		.input('user_id', user_id).query(`
			SELECT COUNT(*) as count
			FROM [dbo].[chat_participant]
			WHERE room_id = @room_id AND user_id = @user_id
		`);

	return result.recordset[0].count > 0;
};

export const updateLastRead = async (room_id: string, user_id: string) => {
	const pool = await getDbConnection();

	await pool.request().input('room_id', room_id).input('user_id', user_id)
		.query(`
			UPDATE [dbo].[chat_participant]
			SET last_read = CURRENT_TIMESTAMP
			WHERE room_id = @room_id AND user_id = @user_id
		`);

	return true;
};

// Message operations
export const createMessage = async (
	room_id: string,
	sender_id: string,
	content: string
) => {
	const pool = await getDbConnection();

	const result = await pool
		.request()
		.input('room_id', room_id)
		.input('sender_id', sender_id)
		.input('content', content).query(`
			INSERT INTO [dbo].[chat_message] (room_id, sender_id, content)
			OUTPUT inserted.id, inserted.room_id, inserted.sender_id, 
				   inserted.content, inserted.created_at
			VALUES (@room_id, @sender_id, @content);

			UPDATE [dbo].[chat_room]
			SET updated_at = CURRENT_TIMESTAMP
			WHERE id = @room_id;
		`);

	return result.recordset[0];
};

export const getRoomMessages = async (
	room_id: string,
	limit: number = 50,
	before_id?: string
) => {
	const pool = await getDbConnection();

	let query = `
		SELECT TOP (@limit)
			cm.id,
			cm.room_id,
			cm.sender_id,
			cm.content,
			cm.created_at,
			u.handle as sender_handle,
			u.display_name as sender_display_name
		FROM [dbo].[chat_message] cm
		INNER JOIN [dbo].[app_user] u ON cm.sender_id = u.id
		WHERE cm.room_id = @room_id
	`;

	if (before_id) {
		query += `
			AND cm.created_at < (
				SELECT created_at FROM [dbo].[chat_message] WHERE id = @before_id
			)
		`;
	}

	query += `
		ORDER BY cm.created_at DESC
	`;

	const request = pool
		.request()
		.input('room_id', room_id)
		.input('limit', limit);

	if (before_id) {
		request.input('before_id', before_id);
	}

	const result = await request.query(query);

	return result.recordset.reverse();
};

// Get or create 1-to-1 chat room
export const getOrCreateDirectRoom = async (
	user1_id: string,
	user2_id: string
) => {
	const pool = await getDbConnection();

	// Check if room already exists
	const existingResult = await pool
		.request()
		.input('user1_id', user1_id)
		.input('user2_id', user2_id).query(`
			SELECT cr.id, cr.name, cr.is_group, cr.created_at, cr.updated_at
			FROM [dbo].[chat_room] cr
			WHERE cr.is_group = 0
			AND EXISTS (
				SELECT 1 FROM [dbo].[chat_participant] 
				WHERE room_id = cr.id AND user_id = @user1_id
			)
			AND EXISTS (
				SELECT 1 FROM [dbo].[chat_participant] 
				WHERE room_id = cr.id AND user_id = @user2_id
			)
			AND (
				SELECT COUNT(*) FROM [dbo].[chat_participant] 
				WHERE room_id = cr.id
			) = 2
		`);

	if (existingResult.recordset.length > 0) {
		return existingResult.recordset[0];
	}

	// Create new room
	const room = await createChatRoom(null, false);
	await addParticipant(room.id, user1_id);
	await addParticipant(room.id, user2_id);

	return room;
};
