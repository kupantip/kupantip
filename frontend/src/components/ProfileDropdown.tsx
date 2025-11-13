'use client';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import {
	UserPen,
	User,
	FileText,
	Bookmark,
	Settings,
	Bell,
	HelpCircle,
	LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';

export default function ProfileDropDown() {
	const { status } = useSession();
	const isAuthenticated = status === 'authenticated';

	return (
		<div className="mr-0">
			{/* 1. DropdownMenu is the main wrapper */}
			<DropdownMenu modal={false}>
				{/* 2. Tooltip wraps both triggers */}
				<Tooltip>
					<TooltipTrigger asChild>
						{/* 3. DropdownMenuTrigger is inside TooltipTrigger */}
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								className="p-0 bg-transparent hover:bg-transparent focus-visible:ring-0 cursor-pointer hover:scale-105"
							>
								<div className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-grey-1">
									<UserPen className="w-5 h-5 text-green-700" />
								</div>
							</Button>
						</DropdownMenuTrigger>
					</TooltipTrigger>
					{/* 4. TooltipContent is here */}
					<TooltipContent>
						{isAuthenticated ? (
							<p>My Account</p>
						) : (
							<p>You need to login first</p>
						)}
					</TooltipContent>
				</Tooltip>

				{/* 5. DropdownMenuContent is at the end, as a child of DropdownMenu */}
				<DropdownMenuContent
					className="w-56"
					align="end"
					sideOffset={30}
				>
					<DropdownMenuLabel>My Account</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<DropdownMenuItem asChild disabled={!isAuthenticated}>
							<Link href="/profile" className="cursor-pointer">
								<User className="mr-2 h-4 w-4" />
								<span>My Profile</span>
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild disabled={!isAuthenticated}>
							<Link href="/my-posts" className="cursor-pointer">
								<FileText className="mr-2 h-4 w-4" />
								<span>My Posts</span>
							</Link>
						</DropdownMenuItem>
						{/* <DropdownMenuItem asChild disabled={!isAuthenticated}>
							<Link href="/bookmarks" className="cursor-pointer">
								<Bookmark className="mr-2 h-4 w-4" />
								<span>Saved Posts</span>
							</Link>
						</DropdownMenuItem> */}
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						{/* <DropdownMenuItem asChild disabled={!isAuthenticated}>
							<Link href="/settings" className="cursor-pointer">
								<Settings className="mr-2 h-4 w-4" />
								<span>Settings</span>
							</Link>
						</DropdownMenuItem> */}
						<DropdownMenuItem asChild disabled={!isAuthenticated}>
							<Link
								href="/notifications"
								className="cursor-pointer"
							>
								<Bell className="mr-2 h-4 w-4" />
								<span>Notifications</span>
							</Link>
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem asChild disabled={!isAuthenticated}>
						<Link href="/help" className="cursor-pointer">
							<HelpCircle className="mr-2 h-4 w-4" />
							<span>Help & Support</span>
						</Link>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={() => signOut({ callbackUrl: '/login' })}
						className="cursor-pointer text-red-600 focus:text-red-600"
						disabled={!isAuthenticated}
					>
						<LogOut className="mr-2 h-4 w-4" />
						<span>Log out</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
