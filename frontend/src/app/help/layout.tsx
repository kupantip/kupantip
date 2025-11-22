'use client';

import { useState, Suspense } from 'react';

import { useSession } from 'next-auth/react';

import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/posts/AppSideBar';
import { Button } from '@/components/ui/button';
import { CirclePlus, MessageCircle, Menu } from 'lucide-react';

import Link from 'next/link';
import ProfileDropDown from '@/components/ProfileDropdown';
import { Loader2 } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import { useTotalUnreadCount } from '@/hooks/useTotalUnreadCount';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { data: session, status } = useSession();
	const [isRedirectLoading, setIsRedirectLoading] = useState(false);
	const totalUnread = useTotalUnreadCount();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	return (
		<SidebarProvider>
			<header className="fixed top-0 left-0 w-full h-16 bg-green-2 shadow flex items-center px-4 md:px-6 z-50">
				<div className="relative flex justify-between items-center w-full">
					<div className="flex items-center gap-2">
						<Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
							<SheetTrigger asChild>
								<Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-green-700">
									<Menu className="h-6 w-6" />
								</Button>
							</SheetTrigger>
							<SheetContent side="left" className="p-0 w-64 border-r-0 bg-grey-1 text-white">
								<VisuallyHidden>
									<SheetTitle>Menu</SheetTitle>
								</VisuallyHidden>
								<AppSidebar isMobile={true} onNavigate={() => setIsMobileMenuOpen(false)} />
							</SheetContent>
						</Sheet>
						<h4 className="hidden md:block text-white text-base font-semibold whitespace-nowrap">
							KU Pantip
						</h4>
					</div>

					<div className="flex-1 max-w-md mx-4 md:flex-none md:mx-0 md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full">
						<Suspense fallback={<p className="text-white text-sm">Loading...</p>}>
							<SearchBar
								setIsRedirectLoading={setIsRedirectLoading}
							/>
						</Suspense>
					</div>

					<div className="flex items-center gap-2 md:gap-3 shrink-0">
						<Link href="/chat" className="hidden md:block">
							<div className="relative w-7 h-7 bg-transparent rounded-full flex items-center justify-center hover:bg-grey-1 hover:scale-105 transition-transform">
								<MessageCircle className="w-5 h-5 text-white cursor-pointer" />
								{totalUnread > 0 && (
									<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 min-w-4 flex items-center justify-center px-1">
										{totalUnread > 99 ? '99+' : totalUnread}
									</span>
								)}
							</div>
						</Link>

						<div className="hidden md:flex gap-2">
							<Link href="/posts/create-category">
								<Button className="group bg-transparent text-white hover:bg-white/10 flex items-center gap-2 cursor-pointer transition-all">
									<CirclePlus className="w-5 h-5" />
									<span className="hidden lg:inline group-hover:underline">Category</span>
								</Button>
							</Link>
							<Link href="/posts/create">
								<Button className="group bg-transparent text-white hover:bg-white/10 flex items-center gap-2 cursor-pointer transition-all">
									<CirclePlus className="w-5 h-5" />
									<span className="hidden lg:inline group-hover:underline">Post</span>
								</Button>
							</Link>
						</div>

						{status !== 'authenticated' && (
							<Link href="/login">
								<Button className="bg-green-1 text-white hover:bg-green-700 cursor-pointer hover:scale-105 transition-transform">
									Log In
								</Button>
							</Link>
						)}
						<ProfileDropDown />
					</div>
				</div>
			</header>

			<div className="flex pt-16 w-full min-h-screen bg-gray-50 dark:bg-gray-900">
				<div className="hidden md:block sticky top-16 h-[calc(100vh-4rem)] shrink-0 z-40">
					<AppSidebar />
				</div>

				<main className="flex-1 w-full md:max-w-[calc(100vw-16rem)] min-h-[calc(100vh-4rem)] overflow-x-hidden">
					{isRedirectLoading ? (
						<div className="flex flex-col justify-center items-center h-[60vh]">
							<Loader2 className="h-8 w-8 animate-spin text-green-600" />
							<p className="mt-2 text-gray-500">Searching...</p>
						</div>
					) : (
						children
					)}
				</main>
			</div>
		</SidebarProvider>
	);
}
