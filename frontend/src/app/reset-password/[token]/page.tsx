import PasswordForm from './PasswordForm';

// This is a placeholder for your real database check
async function validateToken(token: string): Promise<boolean> {
	console.log('Validating token on server:', token);
	// TODO: Add your real logic here
	// 1. Find token in database
	// 2. Check if it's expired or already used
	// 3. Return true if valid, false if not

	// For this example, we'll just deny a specific "invalid" token
	if (token === 'invalid-token') {
		return false;
	}
	return true;
}

// This is the main page component
export default async function ResetPasswordPage({
	params,
}: {
	params: { token: string };
}) {
	const { token } = params;

	// 1. Validate the token on the server before rendering
	const isTokenValid = await validateToken(token);

	if (!isTokenValid) {
		return (
			<main
				className="reset-card"
				style={{
					maxWidth: '400px',
					margin: '100px auto',
					padding: '30px 40px',
					textAlign: 'center',
				}}
			>
				<h2>Invalid Link</h2>
				<p>
					This password reset link is invalid or has expired. Please
					request a new one.
				</p>
			</main>
		);
	}

	// 2. If valid, render the Client Component with the form
	return <PasswordForm token={token} />;
}
