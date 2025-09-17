import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
	return (
		<div
			className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center"
			role="alert"
			aria-live="assertive"
		>
			<Image
				src="/404.svg"
				alt="Page not found illustration"
				width={320}
				height={320}
				priority
				className="max-w-xs w-full h-auto"
			/>
			<h1 className="text-5xl font-bold tracking-tight">404</h1>
			<p className="text-lg text-neutral-600 dark:text-neutral-400">
				Sorry, the page you are looking for does not exist.
			</p>
			<Link
				href="/"
				className="rounded bg-black px-5 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition"
			>
				Back to Home
			</Link>
		</div>
	);
}
