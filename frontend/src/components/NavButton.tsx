'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function NavButtons() {
	const { data: session, status } = useSession();
	const isLoggedIn = status === 'authenticated';

	const handlePostClick = () => {
		if (!isLoggedIn) {
			toast.error('Please login first');
		}
	};

	return (
		<div className="flex items-center gap-4">
			{isLoggedIn ? (
				<Link href="/post">
					<Button className="w-full">Post</Button>
				</Link>
			) : (
				<Button className="w-full" onClick={handlePostClick}>
					Post
				</Button>
			)}

			<Link href={isLoggedIn ? '/profile' : '/login'}>
				<Button className="px-4 py-2 bg-green-2 text-white rounded-lg hover:bg-green-600">
					{isLoggedIn ? 'Profile' : 'Log In'}
				</Button>
			</Link>
		</div>
	);
}
