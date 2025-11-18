import { Server, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { createMessage, isUserInRoom } from '../models/chat.model';

interface SocketUser {
	user_id: string;
	handle: string;
	display_name: string;
	role: string;
}

export const initializeSocket = (httpServer: HTTPServer) => {
	const io = new Server(httpServer, {
		cors: {
			origin: process.env.FRONTEND_URL || 'http://localhost:3000',
			credentials: true,
			methods: ['GET', 'POST'],
		},
	});

	// Authentication middleware
	io.use((socket: Socket & { user?: SocketUser }, next) => {
		const token = socket.handshake.auth.token;

		if (!token) {
			return next(new Error('Authentication error: No token provided'));
		}

		try {
			const decoded = jwt.verify(
				token,
				process.env.JWT_SECRET || 'your-secret-key'
			) as SocketUser;

			socket.user = decoded;
			next();
		} catch {
			return next(new Error('Authentication error: Invalid token'));
		}
	});

	io.on('connection', (socket: Socket & { user?: SocketUser }) => {
		const user: SocketUser = socket.user as SocketUser;
		console.log(`User connected: ${user.display_name} (${user.user_id})`);

		// Join room
		socket.on('join_room', async (roomId: string) => {
			try {
				// Verify user is participant
				const isParticipant = await isUserInRoom(roomId, user.user_id);
				if (!isParticipant) {
					socket.emit('error', {
						message: 'Not authorized to join this room',
					});
					return;
				}

				socket.join(roomId);
				console.log(`User ${user.display_name} joined room ${roomId}`);

				// Notify others
				socket.to(roomId).emit('user_joined', {
					user_id: user.user_id,
					user_handle: user.handle,
					user_display_name: user.display_name,
				});
			} catch (error) {
				console.error('Error joining room:', error);
				socket.emit('error', { message: 'Failed to join room' });
			}
		});

		// Leave room
		socket.on('leave_room', (roomId: string) => {
			socket.leave(roomId);
			console.log(`User ${user.display_name} left room ${roomId}`);

			// Notify others
			socket.to(roomId).emit('user_left', {
				user_id: user.user_id,
				user_handle: user.handle,
				user_display_name: user.display_name,
			});
		});

		// Send message
		socket.on(
			'send_message',
			async (data: { roomId: string; content: string }) => {
				try {
					const { roomId, content } = data;

					if (!content || content.trim() === '') {
						socket.emit('error', {
							message: 'Message content is required',
						});
						return;
					}

					// Verify user is participant
					const isParticipant = await isUserInRoom(
						roomId,
						user.user_id
					);
					if (!isParticipant) {
						socket.emit('error', {
							message:
								'Not authorized to send messages in this room',
						});
						return;
					}

					// Save message to database
					const message = await createMessage(
						roomId,
						user.user_id,
						content.trim()
					);

					// Broadcast to all users in the room (including sender)
					io.to(roomId).emit('new_message', {
						...message,
						sender_handle: user.handle,
						sender_display_name: user.display_name,
					});
				} catch (error) {
					console.error('Error sending message:', error);
					socket.emit('error', { message: 'Failed to send message' });
				}
			}
		);

		// Typing indicator
		socket.on('typing', (data: { roomId: string; isTyping: boolean }) => {
			const { roomId, isTyping } = data;

			socket.to(roomId).emit('user_typing', {
				user_id: user.user_id,
				user_handle: user.handle,
				user_display_name: user.display_name,
				is_typing: isTyping,
			});
		});

		// Online status
		socket.on('online', () => {
			socket.broadcast.emit('user_online', {
				user_id: user.user_id,
			});
		});

		// Disconnect
		socket.on('disconnect', () => {
			console.log(
				`User disconnected: ${user.display_name} (${user.user_id})`
			);

			socket.broadcast.emit('user_offline', {
				user_id: user.user_id,
			});
		});
	});

	return io;
};
