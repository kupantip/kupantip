'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { sendPasswordResetEmail } from '@/services/user/user';

type FormProps = {
	email: string;
};

export default function ForgetPasswordPage() {
	const router = useRouter();
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
			<div className="relative w-full max-w-md">
				<Card className="w-full">
					<CardHeader>
						<CardTitle className="text-center">
							Forgot Password
						</CardTitle>
					</CardHeader>
					<CardContent>
						<button
							onClick={() => router.back()}
							className="absolute left-2 top-2 flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer"
							aria-label="Go back"
						>
							<ArrowLeft className="w-5 h-5" />
						</button>
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
								className="w-full bg-emerald-600 hover:bg-emerald-700"
							>
								{isTransition
									? 'Sending...'
									: 'Send Reset Link'}
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
		</div>
	);
}
