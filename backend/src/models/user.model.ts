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
