import { getDbConnection } from '../database/mssql.database';
import { ConnectionPool, VarChar, NVarChar } from 'mssql'; // เพิ่ม NVarChar
import bcrypt from 'bcrypt';

export const signup = async (
	email: string,
	handle: string,
	display_name: string,
	password: string,
	role?: string
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
