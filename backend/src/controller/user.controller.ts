import { getDbConnection } from '../database/mssql.database';
import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';
import {
	createResetToken,
	getResetToken,
	getResetTokenById,
	getUserByEmail,
	resetPassword,
	signup,
} from '../models/user.model';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import * as z from 'zod';
import { getUserActiveBans } from '../models/ban.model';
import { sendPasswordResetEmail } from '../utils/mailer';

const passwordSchema = z
	.string()
	.min(6, 'Password must be at least 6 characters')
	.regex(/[a-z]/, 'Password must contain at least one lowercase letter')
	.regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
	.regex(/[0-9]/, 'Password must contain at least one number')
	.regex(
		/[^a-zA-Z0-9]/,
		'Password must contain at least one special character'
	);

export const loginSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: passwordSchema,
});

export const signupSchema = z.object({
	email: z.string().email('Invalid email address'),
	handle: z.string().min(1, 'Handle must be at least 1 characters'),
	display_name: z.string().min(1, 'Display name is required'),
	password: passwordSchema,
	role: z.string().optional(),
});

export const loginController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		loginSchema.parse(req.body);
		const { email, password } = req.body;
		const cnt = await getDbConnection();
		// ดึง user_id, display_name จาก email
		const userResult = await cnt
			.request()
			.input('email', email)
			.query(
				'SELECT id, email, display_name FROM [dbo].[app_user] WHERE email = @email'
			);
		if (userResult.recordset.length === 0) {
			res.clearCookie('token', {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
			});
			return res.status(401).json({ message: 'Email not found' });
		}
		const {
			id: user_id,
			display_name,
			email: user_email,
		} = userResult.recordset[0];
		// ดึง password hash
		const secretResult = await cnt
			.request()
			.input('user_id', user_id)
			.query(
				'SELECT password_hash FROM [dbo].[user_secret] WHERE user_id = @user_id'
			);
		if (secretResult.recordset.length === 0) {
			res.clearCookie('token', {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
			});
			return res.status(401).json({ message: 'Password not set' });
		}
		const passwordHash = secretResult.recordset[0].password_hash;
		// เปรียบเทียบรหัสผ่าน
		const match = await bcrypt.compare(password, passwordHash);
		if (!match) {
			res.clearCookie('token', {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
			});
			return res.status(401).json({ message: 'Password incorrect' });
		}
		// ดึง role
		const roleResult = await cnt
			.request()
			.input('user_id', user_id)
			.query(
				'SELECT role FROM [dbo].[user_role] WHERE user_id = @user_id'
			);
		const role = roleResult.recordset[0]?.role || 'user';

		// Check for active suspension before allowing login
		const suspendBans = await getUserActiveBans(user_id, 'suspend');
		if (suspendBans.length > 0) {
			const ban = suspendBans[0];
			// Clear any existing token cookie to prevent using previous account
			res.clearCookie('token', {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
			});
			return res.status(403).json({
				message: 'Your account is suspended',
				reason: ban.reason_user || 'No reason provided',
				ban_type: 'suspend',
				end_at: ban.end_at,
			});
		}

		// สร้าง JWT token

		const token = jwt.sign(
			{ user_id, role, email: user_email, display_name },
			String(env.jwtSecret),
			{ expiresIn: String(env.jwtExpiresIn) } as SignOptions
		);

		// set cookie
		res.cookie('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 วัน
			sameSite: 'lax',
		});

		return res.status(200).json({
			user_id,
			role,
			email: user_email,
			display_name,
			token,
		});
	} catch (err) {
		// return res.status(500).json({ message: 'Login failed', error: err });
		next(err);
	}
};

export const signupController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		signupSchema.parse(req.body);
		const { email, handle, display_name, password, role } = req.body;
		const result = await signup(
			email,
			handle,
			display_name,
			password,
			role
		);
		if (
			result &&
			typeof result === 'object' &&
			'message' in result &&
			result.message !== 'Register success'
		) {
			return res.status(400).json(result);
		}
		return res.status(201).json({ message: 'Register success' });
	} catch (err) {
		next(err);
	}
};

const forgetPasswordSchema = z.object({
	email: z.email('Invalid email address'),
});

export const forgetPasswordController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const validateData = forgetPasswordSchema.parse(req.body);
		const { email } = validateData;

		const user = await getUserByEmail(email);
		if (!user) {
			return res
				.status(404)
				.json({ message: 'Email not found in our records' });
		}

		const token = jwt.sign(
			{ email, user_id: user.id, display_name: user.display_name },
			env.jwtSecret,
			{
				expiresIn: '24h',
			}
		);

		await createResetToken(email, token);
		await sendPasswordResetEmail(email, token, req.headers.origin || '');
		return res
			.status(200)
			.json({ message: 'Password reset link sent to email' });
	} catch (err) {
		next(err);
	}
};

export const verifyTokenController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { token } = req.params;
	try {
		const user = await getResetToken(token);
		if (!user || !user.isValid) {
			return res
				.status(400)
				.json({ valid: false, message: 'Invalid token' });
		}

		const decoded = jwt.verify(token, env.jwtSecret) as {
			email: string;
			iat: number;
			exp: number;
		};

		return res
			.status(200)
			.json({ valid: true, email: decoded.email, rt_id: user.id });
	} catch (err) {
		next(err);
	}
};

const resetPasswordSchema = z.object({
	new_password: passwordSchema,
	rt_id: z.uuid(),
});

export const resetPasswordController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { new_password } = req.body;
		const { rt_id } = req.params;

		const validateData = resetPasswordSchema.parse({
			new_password,
			rt_id,
		});

		const tokenRecord = await getResetTokenById(validateData.rt_id);

		if (!tokenRecord || !tokenRecord.isValid) {
			return res
				.status(400)
				.json({ message: 'Invalid or expired reset token' });
		}

		// Reset password
		await resetPassword(validateData.rt_id, validateData.new_password);

		return res.status(200).json({ message: 'Password reset successful' });
	} catch (error) {
		next(error);
	}
};
