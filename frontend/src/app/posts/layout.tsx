'use client';

import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/posts/AppSideBar';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { CirclePlus } from 'lucide-react';
import { UserPen } from 'lucide-react';
import { Bell } from 'lucide-react';

import Link from 'next/link';
import NavButtons from '@/components/NavButton';

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	useEffect(() => {
		window.history.scrollRestoration = 'manual';
		window.scrollTo({ top: 0 });
		AOS.init({ duration: 800, once: true, offset: 100 });
	}, []);
	return (
		<SidebarProvider>
			<header className="fixed top-0 left-0 w-full h-16 bg-green-2 shadow flex items-center px-4 z-50">
				<div className="flex justify-between items-center w-screen">
					<h4 className="text-white">KU Pantip</h4>

					<div className="flex flex-wrap items-center gap-x-3">
						<div className="w-7 h-7 bg-transparent rounded-full flex items-center justify-center hover:bg-grey-1 hover:scale-105">
							<Bell className="w-5 h-5 text-white cursor-pointer" />
						</div>
						<Link href="/posts/create">
							<Button className="group w-20 bg-transparent text-white rounded-lg hover:bg-transparent flex items-center gap-2 cursor-pointer hover:scale-105">
								<CirclePlus className="mt-[0.2em]" />
								<div className="group-hover:underline">
									Post
								</div>
							</Button>
						</Link>
						<Link href="/login">
							<Button className="w-30 bg-green-1 text-white rounded-lg hover:bg-green-700 cursor-pointer hover:scale-105">
								<div className="hover:underline">Log In</div>
							</Button>
						</Link>
						<Button
							variant="ghost"
							className="p-0 bg-transparent hover:bg-transparent focus-visible:ring-0 cursor-pointer hover:scale-105"
						>
							<div className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-grey-1">
								<UserPen className="w-5 h-5 text-green-700" />
							</div>
						</Button>
					</div>
				</div>
			</header>

			<div className="flex pt-16 w-full">
				<div className="sticky top-16 h-[calc(100vh-4rem)] shrink-0 overflow-hidden">
					<AppSidebar />
				</div>

				<main className="flex-1 p-10 min-h-[calc(100vh-4rem)]">
					{children}
				</main>
			</div>
		</SidebarProvider>
	);
}
