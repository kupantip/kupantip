// app/dashboard/layout.tsx
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/AppSideBar';
import { Search, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import Link from 'next/link';

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<SidebarProvider>
			{/* Top bar */}
			<header className="fixed top-0 left-0 w-full h-16 bg-white shadow flex items-center px-4 z-50">
				{/* Logo */}
				<Image
					src="/dashboard/logo.svg"
					alt="logo"
					width={80}
					height={80}
				/>
				{/* Center search bar */}
				<div className="flex-1 mx-[calc(28%)]">
					<div className="relative">
						<Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
						<Input
							type="text"
							placeholder="Search in .."
							className="bg-gray-200 w-full pl-10 pr-4 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
				</div>
				{/* Right side buttons */}{' '}
				<div className="flex items-center gap-4">
					<Link href="dashboard/create-post">
						<Button className="w-full cursor-pointer">Post</Button>
					</Link>
					<Link href="/login">
						<Button className="px-4 py-2 bg-green-2 text-white rounded-lg hover:bg-green-600 cursor-pointer">
							Log In
						</Button>
					</Link>
				</div>
				<Tooltip>
					<TooltipTrigger asChild>
						<button className="ml-5">
							<Settings />
						</button>
					</TooltipTrigger>
					<TooltipContent>
						<p>Settings</p>
					</TooltipContent>
				</Tooltip>
			</header>

			{/* Sidebar + main content */}
			<div className="flex pt-16">
				{/* Sticky sidebar container */}
				<div className="sticky top-16 h-[calc(100vh-4rem)] shrink-0 overflow-hidden">
					<AppSidebar />
				</div>

				<main className="flex-1 p-4 min-h-[calc(100vh-4rem)]">
					{children}
				</main>
			</div>
		</SidebarProvider>
	);
}
