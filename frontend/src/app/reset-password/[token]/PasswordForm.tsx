'use client';

import { useFormState } from 'react-dom';
import { resetPassword, type FormState } from './actions';

// shadcn/ui imports
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

// --- CHANGE 1: Import from lucide-react instead of radix ---
import { AlertTriangle } from 'lucide-react'; // Was ExclamationTriangleIcon
import { useActionState } from 'react';

export default function PasswordForm({ token }: { token: string }) {
	const initialState: FormState = { message: '' };
	const [state, formAction] = useActionState(resetPassword, initialState);

	return (
		<main className="flex min-h-screen w-full items-center justify-center bg-background p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl">
						Reset Your Password
					</CardTitle>
					<CardDescription>
						Please enter and confirm your new password.
					</CardDescription>
				</CardHeader>

				<form action={formAction}>
					<CardContent className="grid gap-4">
						{state.message && (
							<Alert variant="destructive">
								{/* --- CHANGE 2: Use the Lucide icon component --- */}
								<AlertTriangle className="h-4 w-4" />

								<AlertDescription>
									{state.message}
								</AlertDescription>
							</Alert>
						)}

						{/* New Password Field */}
						<div className="grid gap-2">
							<Label htmlFor="new-password">New Password</Label>
							<Input
								id="new-password"
								name="newPassword"
								type="password"
								required
							/>
						</div>

						{/* Confirm Password Field */}
						<div className="grid gap-2">
							<Label htmlFor="confirm-password">
								Confirm New Password
							</Label>
							<Input
								id="confirm-password"
								name="confirmPassword"
								type="password"
								required
							/>
						</div>

						<input type="hidden" name="token" value={token} />
					</CardContent>

					<CardFooter>
						<Button type="submit" className="w-full">
							Save New Password
						</Button>
					</CardFooter>
				</form>
			</Card>
		</main>
	);
}
