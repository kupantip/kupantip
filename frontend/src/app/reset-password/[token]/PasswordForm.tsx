'use client';
import { Controller, useForm } from 'react-hook-form';
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
import { resetPassword } from '@/services/user/user';
import { toast } from 'sonner';

type ResestPasswordFormData = {
	newPassword: string;
	confirmPassword: string;
};

type PasswordFormProps = {
	rt_id: string;
};

export default function PasswordForm({ rt_id }: PasswordFormProps) {
	const {
		handleSubmit,
		formState: { errors },
		control,
		watch,
	} = useForm<ResestPasswordFormData>({
		defaultValues: {
			newPassword: '',
			confirmPassword: '',
		},
	});

	const handleSubmitForm = async (formData: ResestPasswordFormData) => {
		try {
			const result = await resetPassword(rt_id, formData.confirmPassword);
			if (result.success) {
				toast.success('Password has been reset successfully!');
				window.location.href = '/login';
			} else {
				toast.error(result.error || 'Failed to reset password', {
					action: {
						label: 'Login Page',
						onClick: () => {
							window.location.href = '/login';
						},
					},
				});
			}
		} catch (error) {
			console.error('Error submitting new password:', error);
		}
	};

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

				<form onSubmit={handleSubmit(handleSubmitForm)}>
					<CardContent className="grid gap-4">
						<div className="grid gap-2">
							<Controller
								name="newPassword"
								control={control}
								rules={{ required: 'New password is required' }}
								render={({ field }) => (
									<>
										<Label htmlFor="new-password">
											New Password
										</Label>
										<Input
											id="new-password"
											type="password"
											{...field}
										/>
										{errors.newPassword && (
											<span className="text-sm text-red-500">
												{errors.newPassword.message}
											</span>
										)}
									</>
								)}
							/>
						</div>

						<div className="grid gap-2">
							<Controller
								name="confirmPassword"
								control={control}
								rules={{
									required: 'Please confirm your password',
									validate: (value) =>
										value === watch('newPassword') ||
										'Passwords do not match',
								}}
								render={({ field }) => (
									<>
										<Label htmlFor="confirm-password">
											Confirm New Password
										</Label>
										<Input
											id="confirm-password"
											type="password"
											{...field}
										/>
										{errors.confirmPassword && (
											<span className="text-sm text-red-500">
												{errors.confirmPassword.message}
											</span>
										)}
									</>
								)}
							/>
						</div>
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
