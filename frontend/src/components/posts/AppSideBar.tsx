'use client';

import { useCategories } from '@/services/post/category';
import {
	Calendar,
	Home,
	Inbox,
	ChevronsLeft,
	ChevronsRight,
	PersonStanding,
	BriefcaseBusiness,
	Megaphone,
	Newspaper,
	Circle,
	PartyPopper,
	FileUser,
	MessageCircle,
	CirclePlus,
	ChevronDown,
	ChevronRight,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'motion/react';

const topicItems = [
	{ title: 'Important Post', url: '/posts/priority', icon: '📌' },
];

const adminLinks = [
	{
		href: '/posts/admin/report',
		icon: Calendar,
		label: 'Report Panel',
		aria: 'Report Panel',
		title: 'Report Panel',
	},
	{
		href: '/posts/admin/category',
		icon: BriefcaseBusiness,
		label: 'Category Confirm',
		aria: 'Category Confirm',
		title: 'Category Confirm',
	},
	{
		href: '/posts/admin/announcement',
		icon: Megaphone,
		label: 'Announcement Panel',
		aria: 'Announcement Panel',
		title: 'Announcement Panel',
	},
];

interface AppSidebarProps {
	isMobile?: boolean;
	onNavigate?: () => void;
}

export function AppSidebar({ isMobile = false, onNavigate }: AppSidebarProps) {
	const { open, toggleSidebar } = useSidebar();
	const [hovered, setHovered] = useState(false);
	const [isCategoryOpen, setIsCategoryOpen] = useState(true);
	const hoverTimer = useRef<number | null>(null);
	const iconMenu: Record<string, React.ElementType> = {
		Home: Home,
		Announcement: Inbox,
		Community: PersonStanding,
		Recruit: FileUser,
		Events: PartyPopper
	};
	const session = useSession();
	const { data: categories, isLoading: isLoadingCategories } =
		useCategories();

	// If mobile, always expanded. If desktop, use open/hover state.
	const expanded = isMobile ? true : (open || hovered);

	const toggleCollapse = () => {
		if (isMobile) return;
		if (hoverTimer.current) {
			window.clearTimeout(hoverTimer.current);
			hoverTimer.current = null;
		}
		setHovered(false);
		toggleSidebar();
	};

	useEffect(() => {
		return () => {
			if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
		};
	}, []);

	const handleLinkClick = () => {
		if (onNavigate) {
			onNavigate();
		}
	};

	return (
		<div
			className={`group relative h-full border-r bg-grey-1 transition-[width] duration-200 ease-out ${
				expanded ? 'w-64' : 'w-12'
			} ${isMobile ? 'w-full border-r-0' : ''}`}
			data-expanded={expanded}
		>
			{/* Toggle button - Only show on desktop */}
			{!isMobile && (
				<div
					className={`flex items-center ${
						expanded ? 'justify-between px-3' : 'justify-center'
					} py-2`}
				>
					{expanded && (
						<span className="text-sm font-semibold tracking-wide px-4 text-white">
							Menu
						</span>
					)}
					<button
						type="button"
						onClick={toggleCollapse}
						aria-label={!open ? 'Expand sidebar' : 'Collapse sidebar'}
						className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-gray-200 hover:bg-gray-100 transition"
					>
						{expanded ? (
							<ChevronsLeft className="h-4 w-4" />
						) : (
							<ChevronsRight className="h-4 w-4" />
						)}
					</button>
				</div>
			)}
			
			{/* Mobile Header */}
			{isMobile && (
				<div className="flex items-center px-6 py-4 border-b border-gray-700 mb-2">
					<span className="text-lg font-semibold tracking-wide text-white">
						Menu
					</span>
				</div>
			)}

			<ScrollArea className="flex-1 h-[calc(100%-4rem)]">
				<nav className={`pb-6 ${isMobile ? 'h-full' : ''}`}>
					<ul className={`space-y-1 ${expanded ? ' px-4' : 'px-0'}`}>
						{isMobile && (
							<>
								<li>
									<Link
										href="/chat"
										onClick={handleLinkClick}
										className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-white hover:bg-gray-400 transition hover:scale-103 justify-start"
									>
										<span className="text-base">
											<MessageCircle className="h-5 w-5 shrink-0" />
										</span>
										<span>Chat</span>
									</Link>
								</li>
								<li>
									<Link
										href="/posts/create"
										onClick={handleLinkClick}
										className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-white hover:bg-gray-400 transition hover:scale-103 justify-start"
									>
										<span className="text-base">
											<CirclePlus className="h-5 w-5 shrink-0" />
										</span>
										<span>Create Post</span>
									</Link>
								</li>
								<li>
									<Link
										href="/posts/create-category"
										onClick={handleLinkClick}
										className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-white hover:bg-gray-400 transition hover:scale-103 justify-start"
									>
										<span className="text-base">
											<CirclePlus className="h-5 w-5 shrink-0" />
										</span>
										<span>Create Category</span>
									</Link>
								</li>
								<li className="pt-2">
									<div className="mx-2 border-t border-gray-200" />
								</li>
							</>
						)}
						<li>
							<Link
								href="/posts"
								onClick={handleLinkClick}
								className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm text-white hover:bg-gray-400 transition hover:scale-103 ${
									expanded
										? 'justify-start'
										: 'justify-center'
								}`}
								aria-label={expanded ? undefined : 'Hot Posts'}
								title={!expanded ? 'News' : undefined}
							>
								<span className="text-base ">
									<Newspaper className="h-5 w-5 shrink-0" />
								</span>
								{expanded && <span>News</span>}
							</Link>
						</li>
						<li>
							<button
								onClick={() => setIsCategoryOpen(!isCategoryOpen)}
								className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm text-white bg-transparent hover:bg-gray-400 transition hover:scale-103 w-full cursor-pointer ${
									expanded ? 'justify-between' : 'justify-center'
								}`}
							>
								<div className="flex items-center gap-2">
									<span className="text-base">
										<BriefcaseBusiness className="h-5 w-5 shrink-0" />
									</span>
									{expanded && <span>Categories</span>}
								</div>
								{expanded && (
									<motion.span
										animate={{ rotate: isCategoryOpen ? 180 : 0 }}
										transition={{ duration: 0.2 }}
										className="text-xs flex items-center"
									>
										<ChevronDown className="h-4 w-4" />
									</motion.span>
								)}
							</button>
						</li>

						<AnimatePresence initial={false}>
							{isCategoryOpen && !isLoadingCategories && (
								<motion.ul
									initial={{ height: 0, opacity: 0 }}
									animate={{ height: 'auto', opacity: 1 }}
									exit={{ height: 0, opacity: 0 }}
									transition={{ duration: 0.2, ease: 'easeInOut' }}
									className="overflow-hidden"
								>
									{categories?.map((category) => {
										const Icon = iconMenu[category.label] || Home;

										return (
											<li key={category.id}>
												<Link
													href={`/posts/category/${category.id}`}
													onClick={handleLinkClick}
													className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm text-white hover:bg-gray-400 transition hover:scale-103 ${
														expanded
															? 'justify-start pl-8'
															: 'justify-center'
													}`}
													aria-label={
														expanded
															? undefined
															: category.label
													}
													title={
														!expanded
															? category.label
															: undefined
													}
												>
													{category.color_hex ? (
														<Circle
															className="h-5 w-5 shrink-0 rounded-full"
															style={{
																backgroundColor:
																	category.color_hex,
															}}
														/>
													) : (
														<Icon className="h-5 w-5 shrink-0" />
													)}

													{expanded && (
														<span>{category.label}</span>
													)}
												</Link>
											</li>
										);
									})}
								</motion.ul>
							)}
						</AnimatePresence>

						{expanded && (
							<li className="pt-2">
								<div className="mx-2 border-t border-gray-200" />
							</li>
						)}

						{expanded && (
							<li className="px-2 pt-3 text-[11px] font-semibold uppercase tracking-wide text-white">
								Topics
							</li>
						)}

						{topicItems.map((item) => (
							<li key={item.title}>
								<Link
									href={item.url}
									onClick={handleLinkClick}
									className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm text-white hover:bg-gray-400 transition hover:scale-103 ${
										expanded
											? 'justify-start'
											: 'justify-center'
									}`}
									aria-label={expanded ? undefined : item.title}
									title={!expanded ? item.title : undefined}
								>
									<span className="text-base">{item.icon}</span>
									{expanded && <span>{item.title}</span>}
								</Link>
							</li>
						))}

						{session.data?.user.role === 'admin' && (
							<>
								{expanded && (
									<li className="pt-2">
										<div className="mx-2 border-t border-gray-200" />
									</li>
								)}

								{expanded && (
									<li className="px-2 pt-3 mb-2 text-[11px] font-semibold uppercase tracking-wide text-white">
										Admin
									</li>
								)}
								{adminLinks.map((link) => (
									<li key={link.href}>
										<Link
											href={link.href}
											onClick={handleLinkClick}
											className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm text-white hover:bg-gray-400 transition hover:scale-103 ${
												expanded
													? 'justify-start'
													: 'justify-center'
											}`}
											aria-label={
												expanded ? undefined : link.aria
											}
											title={
												!expanded ? link.title : undefined
											}
										>
											<link.icon className="h-4 w-4 shrink-0" />
											{expanded && <span>{link.label}</span>}
										</Link>
									</li>
								))}
							</>
						)}
					</ul>
				</nav>
			</ScrollArea>
		</div>
	);
}
