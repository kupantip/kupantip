'use client';

import { useState, Suspense} from 'react';

import { useSession } from 'next-auth/react';

import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/posts/AppSideBar';
import { Button } from '@/components/ui/button';
import { CirclePlus } from 'lucide-react';
import { Bell } from 'lucide-react';

import Link from 'next/link';
import ProfileDropDown from '@/components/ProfileDropdown';
import { Loader2 } from "lucide-react"
import SearchBar from '@/components/SearchBar';

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { data: session, status } = useSession();
	const [isRedirectLoading, setIsRedirectLoading] = useState(false);

	return (
		<SidebarProvider>
			<header className="fixed top-0 left-0 w-full h-16 bg-green-2 shadow flex items-center px-6 z-50">
				<div className="flex justify-between items-center w-screen">
					<h4 className="text-white text-base font-semibold">
						KU Pantip
					</h4>
					<Suspense fallback={<p>Loading search...</p>}>
                        <SearchBar setIsRedirectLoading={setIsRedirectLoading}/>
                    </Suspense>
					<div className="flex flex-wrap items-center gap-x-3">
						<div className="mr-3 w-7 h-7 bg-transparent rounded-full flex items-center justify-center hover:bg-grey-1 hover:scale-105">
							<Bell className="w-5 h-5 text-white cursor-pointer" />
						</div>
						<Link href="/posts/create-category">
							<Button className="mr-21group w-16 bg-transparent text-white rounded-lg hover:bg-transparent flex items-center gap-2 cursor-pointer hover:scale-105">
								<CirclePlus className="mt-[0.2em]" />
								<div className="group-hover:underline">
									Category
								</div>
							</Button>
						</Link>
						<Link href="/posts/create">
							<Button className="group w-20 bg-transparent text-white rounded-lg hover:bg-transparent flex items-center gap-2 cursor-pointer hover:scale-105">
								<CirclePlus className="mt-[0.2em]" />
								<div className="group-hover:underline">
									Post
								</div>
							</Button>
						</Link>
						{status !== 'authenticated' && (
							<Link href="/login">
								<Button className="w-30 bg-green-1 text-white rounded-lg hover:bg-green-700 cursor-pointer hover:scale-105">
									<div className="hover:underline">
										Log In
									</div>
								</Button>
							</Link>
						)}
						<ProfileDropDown />
					</div>
				</div>
			</header>

			<div className="flex pt-16 w-full">
				<div className="sticky top-16 h-[calc(100vh-4rem)] shrink-0 overflow-hidden">
					<AppSidebar />
				</div>

				<main className="flex-1 min-h-[calc(100vh-4rem)]">
					{isRedirectLoading ? (
						<div className="flex flex-col justify-center items-center h-[60vh]">
							<Loader2 className="h-8 w-8 animate-spin" />
							Searching
						</div>
					) : (
						children
					)}
				</main>
			</div>
		</SidebarProvider>
	);
}