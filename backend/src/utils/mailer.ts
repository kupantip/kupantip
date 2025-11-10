import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
	service: 'Gmail',
	auth: {
		user: env.smtpUser,
		pass: env.smtpPass,
	},
});

const sendEmail = async (to: string, subject: string, html: string) => {
	try {
		const info = await transporter.sendMail({
			from: `Kupantip <${env.smtpUser}>`,
			to: to,
			subject: subject,
			html: html,
			priority: 'high',
		});
		console.log('Email sent: ' + info.response);
	} catch (error) {
		console.error('Error sending email: ', error);
		throw error;
	}
};

export const sendPasswordResetEmail = async (
	to: string,
	token: string,
	origin: string
) => {
	const baseURL = origin || 'http://localhost:3000';
	const resetLink = `${baseURL}/reset-password/${token}`;

	const html = `
	<!DOCTYPE html>
		<html lang="en">
		<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Password Reset</title>
		<style>
			/* Basic reset */
			body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
			table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
			img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
			body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }

			/* Main styles */
			@media screen and (max-width: 600px) {
			.container {
				width: 100% !important;
				max-width: 100% !important;
			}
			}
		</style>
		</head>
		<body style="margin: 0 !important; padding: 0 !important; background-color: #f4f4f4;">
		<table border="0" cellpadding="0" cellspacing="0" width="100%">
			<tr>
			<td align="center" style="background-color: #f4f4f4; padding: 40px 10px;">
				
				<table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);" class="container">
				
				<tr>
					<td align="center" style="padding: 40px 20px 20px 20px;">
					<h1 style="font-family: Arial, sans-serif; font-size: 32px; font-weight: bold; color: #333333; margin: 0;">Kupantip</h1>
					</td>
				</tr>

				<tr>
					<td align="left" style="padding: 20px 40px; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; color: #555555;">
					<h2 style="font-size: 20px; font-weight: bold; color: #333333; margin-top: 0;">Password Reset Request</h2>
					<p>Hi [User's Name],</p>
					<p>We received a request to reset the password for your account. You can reset your password by clicking the button below:</p>
					</td>
				</tr>

				<tr>
					<td align="center" style="padding: 20px 40px;">
					<table border="0" cellspacing="0" cellpadding="0">
						<tr>
						<td align="center" style="border-radius: 5px; background-color: #006E4F;">
							<a href="${resetLink}" target="_blank" style="font-size: 16px; font-family: Arial, sans-serif; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 5px; padding: 14px 28px; border: 1px solid #007bff; display: inline-block;">
							Reset Your Password
							</a>
						</td>
						</tr>
					</table>
					</td>
				</tr>

				<tr>
					<td align="left" style="padding: 20px 40px; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; color: #555555;">
					<p>This password reset link is only valid for the next <strong>24 hours</strong>.</p>
					<p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
					</td>
				</tr>

				<tr>
					<td align="center" style="padding: 40px; font-family: Arial, sans-serif; font-size: 12px; line-height: 1.5; color: #888888;">
					<p>&copy; 2025 Kupantip. All rights reserved.</p>
					<p>123 Your Street, Your City, ST 12345</p>
					</td>
				</tr>
				
				</table>
				</td>
			</tr>
		</table>
		</body>
		</html>
	`;

	await sendEmail(to, 'Password Reset Request', html);
};
