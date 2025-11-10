'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { sendPasswordResetEmail } from '@/services/user/user';

type FormProps = {
	email: string;
};

export default function ForgetPasswordPage() {
	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<FormProps>({});

	const [isTransition, startTransition] = useTransition();

	const handleSubmitForm = (data: FormProps) => {
		startTransition(async () => {
			const result = await sendPasswordResetEmail(data.email);

			if (result.success) {
				toast.success('Password reset link sent to your email.');
			} else {
				toast.error(result.error || 'Failed to send reset link.');
			}
		});
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-center">
						Forgot Password
					</CardTitle>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={handleSubmit(handleSubmitForm)}
						className="space-y-4"
					>
						<Controller
							name="email"
							control={control}
							defaultValue=""
							render={({ field }) => (
								<Input
									type="email"
									placeholder="Enter your email"
									{...field}
									required
								/>
							)}
						/>

						<Button
							type="submit"
							disabled={isTransition}
							className="w-full"
						>
							{isTransition ? 'Sending...' : 'Send Reset Link'}
						</Button>
					</form>

					{errors.email && (
						<Alert className="mt-4 bg-red-50 border-red-200">
							<AlertDescription className="text-red-800">
								{errors.email.message}
							</AlertDescription>
						</Alert>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
