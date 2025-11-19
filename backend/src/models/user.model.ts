import { getDbConnection } from '../database/mssql.database';
import { ConnectionPool, VarChar, NVarChar, UniqueIdentifier } from 'mssql';
import bcrypt from 'bcrypt';

export const signup = async (
	email: string,
	handle: string,
	display_name: string,
	password: string,
	role?: string,
	bio?: string,
	interests?: string,
	skills?: string
) => {
	if (!email || !handle || !display_name || !password)
		return { message: 'Missing fields' };
	try {
		const cnt: ConnectionPool = await getDbConnection();
		const transaction = cnt.transaction();
		await transaction.begin();

		try {
			// Check for duplicate email or handle
			const dupCheck = await transaction
				.request()
				.input('email', VarChar, email)
				.input('handle', VarChar, handle)
				.query(
					'SELECT [email], [handle] FROM [dbo].[app_user] WHERE [email]=@email OR [handle]=@handle'
				);
			console.log('dupCheck:', dupCheck.recordset);
			if (dupCheck.recordset.length > 0) {
				await transaction.rollback();
				return { message: 'Email or handle already exists' };
			}

			// Insert user and get user_id
			const userResult = await transaction
				.request()
				.input('email', VarChar, email)
				.input('handle', VarChar, handle)
				.input('display_name', VarChar, display_name)
				.query(
					'INSERT INTO [dbo].[app_user] ([email], [handle], [display_name]) OUTPUT INSERTED.id VALUES (@email, @handle, @display_name)'
				);

			const user_id = userResult.recordset[0]?.id;
			if (!user_id) throw new Error('Cannot get user_id after insert');

			// Hash password
			const hashedPassword = await bcrypt.hash(password, 10);

			// Insert password into user_secret
			await transaction
				.request()
				.input('user_id', NVarChar, user_id)
				.input('hashed_password', VarChar, hashedPassword)
				.query(
					'INSERT INTO [dbo].[user_secret] ([user_id], [password_hash]) VALUES (@user_id, @hashed_password)'
				);

			// Insert role into user_role (default 'user' if not provided)
			await transaction
				.request()
				.input('user_id', NVarChar, user_id)
				.input('role', VarChar, role || 'user')
				.query(
					'INSERT INTO [dbo].[user_role] ([user_id], [role]) VALUES (@user_id, @role)'
				);

			// Insert user_profile if bio, interests, or skills provided
			if (bio || interests || skills) {
				await transaction
					.request()
					.input('user_id', NVarChar, user_id)
					.input('bio', NVarChar, bio || null)
					.input('interests', NVarChar, interests || null)
					.input('skills', NVarChar, skills || null)
					.query(
						'INSERT INTO [dbo].[user_profile] ([user_id], [bio], [interests], [skills]) VALUES (@user_id, @bio, @interests, @skills)'
					);
			}

			await transaction.commit();
			return { message: 'Register success' };
		} catch (err) {
			await transaction.rollback();
			return { message: 'Register failed', error: err };
		}
	} catch (err) {
		return { message: 'Register failed', error: err };
	}
};

export const getUserByEmail = async (email: string) => {
	try {
		const cnt: ConnectionPool = await getDbConnection();

		const result = await cnt
			.request()
			.input('email', VarChar, email)
			.query(
				'SELECT id, email, display_name FROM [dbo].[app_user] WHERE email = @email'
			);

		if (result.recordset.length === 0) {
			return null; // User not found
		}

		return result.recordset[0];
	} catch (err) {
		throw new Error('Failed to get user by email: ' + err);
	}
};

export const createResetToken = async (email: string, token: string) => {
	try {
		const cnt: ConnectionPool = await getDbConnection();

		// Insert reset token into reset_token table
		await cnt
			.request()
			.input('email', VarChar, email)
			.input('token', VarChar, token)
			.query(
				`
				INSERT INTO [dbo].[reset_token] ([user_id], [token]) 
				SELECT id, @token 
				FROM [dbo].[app_user] 
				WHERE email = @email
				`
			);

		return { message: 'Reset token created successfully' };
	} catch (err) {
		throw new Error('Failed to create reset token' + err);
	}
};

export const getResetToken = async (token: string) => {
	try {
		const cnt: ConnectionPool = await getDbConnection();

		const result = await cnt
			.request()
			.input('token', VarChar, token)
			.query(
				`SELECT rt.id, rt.user_id, rt.token, rt.create_at, rt.isValid, au.email 
				FROM [dbo].[reset_token] rt 
				INNER JOIN [dbo].[app_user] au 
				ON rt.user_id = au.id 
				WHERE rt.token = @token AND rt.isValid = 1
				`
			);

		if (result.recordset.length === 0) {
			return null;
		}

		return result.recordset[0];
	} catch (err) {
		throw new Error('Failed to get reset token: ' + err);
	}
};

export const getResetTokenById = async (rt_id: string) => {
	try {
		const cnt: ConnectionPool = await getDbConnection();

		const result = await cnt
			.request()
			.input('rt_id', VarChar, rt_id)
			.query(
				`SELECT rt.id, rt.user_id, rt.token, rt.create_at, rt.isValid, au.email 
				FROM [dbo].[reset_token] rt 
				INNER JOIN [dbo].[app_user] au 
				ON rt.user_id = au.id 
				WHERE rt.id = @rt_id AND rt.isValid = 1
				`
			);

		if (result.recordset.length === 0) {
			return null;
		}

		return result.recordset[0];
	} catch (err) {
		throw new Error('Failed to get reset token by id: ' + err);
	}
};

export const resetPassword = async (rt_id: string, newPassword: string) => {
	try {
		const cnt: ConnectionPool = await getDbConnection();

		const hashedPassword = await bcrypt.hash(newPassword, 10);

		const result = await cnt
			.request()
			.input('rt_id', VarChar, rt_id)
			.input('hashed_password', VarChar, hashedPassword)
			.query(
				`
				BEGIN TRANSACTION;
					UPDATE user_secret
					SET password_hash = @hashed_password
					FROM user_secret us
					INNER JOIN reset_token rt 
					ON us.user_id = rt.user_id
					WHERE rt.id = @rt_id

					UPDATE reset_token
					SET isValid = 0
					WHERE id = @rt_id
				COMMIT TRANSACTION;
				`
			);

		if (result.rowsAffected[0] === 0) {
			return { message: 'Email not found' };
		}
		console.log(result);
		return { message: 'Password reset successful' };
	} catch (err) {
		return { message: 'Password reset failed', error: err };
	}
};

export type UserStats = {
	user_id: string;
	handle: string;
	display_name: string;
	email: string;
	role: string;
	created_at: Date;
	posts_count: number;
	comments_count: number;
	upvotes_given: number;
	downvotes_given: number;
	upvotes_received: number;
	downvotes_received: number;
};

export const getUserStats = async (
	user_id: string
): Promise<UserStats | null> => {
	try {
		const cnt: ConnectionPool = await getDbConnection();

		const result = await cnt
			.request()
			.input('user_id', UniqueIdentifier, user_id).query(`
				SELECT 
					u.id AS user_id,
					u.handle,
					u.display_name,
					u.email,
					ur.role,
					u.created_at,
					
					-- Posts count
					(SELECT COUNT(*) 
					 FROM [dbo].[post] p 
					 WHERE p.author_id = u.id AND p.deleted_at IS NULL) AS posts_count,
					
					-- Comments count
					(SELECT COUNT(*) 
					 FROM [dbo].[comment] c 
					 WHERE c.author_id = u.id AND c.deleted_at IS NULL) AS comments_count,
					
					-- Upvotes given (posts + comments)
					(SELECT COUNT(*) 
					 FROM [dbo].[post_vote] pv 
					 WHERE pv.user_id = u.id AND pv.value = 1) +
					(SELECT COUNT(*) 
					 FROM [dbo].[comment_vote] cv 
					 WHERE cv.user_id = u.id AND cv.value = 1) AS upvotes_given,
					
					-- Downvotes given (posts + comments)
					(SELECT COUNT(*) 
					 FROM [dbo].[post_vote] pv 
					 WHERE pv.user_id = u.id AND pv.value = -1) +
					(SELECT COUNT(*) 
					 FROM [dbo].[comment_vote] cv 
					 WHERE cv.user_id = u.id AND cv.value = -1) AS downvotes_given,
					
					-- Upvotes received on posts
					(SELECT COUNT(*) 
					 FROM [dbo].[post_vote] pv
					 INNER JOIN [dbo].[post] p ON pv.post_id = p.id
					 WHERE p.author_id = u.id AND pv.value = 1 AND p.deleted_at IS NULL) AS upvotes_received_posts,
					
					-- Upvotes received on comments
					(SELECT COUNT(*) 
					 FROM [dbo].[comment_vote] cv
					 INNER JOIN [dbo].[comment] c ON cv.comment_id = c.id
					 WHERE c.author_id = u.id AND cv.value = 1 AND c.deleted_at IS NULL) AS upvotes_received_comments,
					
					-- Downvotes received on posts
					(SELECT COUNT(*) 
					 FROM [dbo].[post_vote] pv
					 INNER JOIN [dbo].[post] p ON pv.post_id = p.id
					 WHERE p.author_id = u.id AND pv.value = -1 AND p.deleted_at IS NULL) AS downvotes_received_posts,
					
					-- Downvotes received on comments
					(SELECT COUNT(*) 
					 FROM [dbo].[comment_vote] cv
					 INNER JOIN [dbo].[comment] c ON cv.comment_id = c.id
					 WHERE c.author_id = u.id AND cv.value = -1 AND c.deleted_at IS NULL) AS downvotes_received_comments
					
				FROM [dbo].[app_user] u
				LEFT JOIN [dbo].[user_role] ur ON u.id = ur.user_id
				WHERE u.id = @user_id
			`);

		if (result.recordset.length === 0) {
			return null;
		}

		const row = result.recordset[0];

		return {
			user_id: row.user_id,
			handle: row.handle,
			display_name: row.display_name,
			email: row.email,
			role: row.role,
			created_at: row.created_at,
			posts_count: row.posts_count,
			comments_count: row.comments_count,
			upvotes_given: row.upvotes_given,
			downvotes_given: row.downvotes_given,
			upvotes_received:
				row.upvotes_received_posts + row.upvotes_received_comments,
			downvotes_received:
				row.downvotes_received_posts + row.downvotes_received_comments,
		};
	} catch (err) {
		throw new Error('Failed to get user stats: ' + err);
	}
};
