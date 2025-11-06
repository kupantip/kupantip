'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

// This defines the object that our action will return
export type FormState = {
	message: string;
};

// This is our Server Action
export async function resetPassword(
	prevState: FormState,
	formData: FormData
): Promise<FormState> {
	// 1. Get form data
	const token = formData.get('token');
	const password = formData.get('newPassword');
	const confirm = formData.get('confirmPassword');

	// 2. Validate data (simple)
	if (password !== confirm) {
		return { message: 'Passwords do not match.' };
	}
	if (!password || password.length < 8) {
		return { message: 'Password must be at least 8 characters.' };
	}

	// 3. --- YOUR BACKEND LOGIC ---
	try {
		console.log(`Resetting password for token: ${token}`);

		// TODO:
		// 1. Find the user/token in your database.
		// 2. Verify the token is not expired.
		// 3. Hash the new password.
		// 4. Update the user's password in the database.
		// 5. Invalidate the token so it can't be used again.

		// const user = await db.findUserByResetToken(token);
		// if (!user) {
		//   return { message: 'Invalid or expired token.' };
		// }

		// const hashedPassword = await hash(password);
		// await db.updateUserPassword(user.id, hashedPassword);
		// await db.invalidateToken(token);
	} catch (error) {
		console.error(error);
		return { message: 'An unexpected error occurred. Please try again.' };
	}

	// 4. Redirect to the login page on success
	redirect('/login?reset=success');
}
