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
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useSidebar } from '@/components/ui/sidebar';

const HOVER_OPEN_DELAY_MS = 250;

// const items = [
// 	{ title: 'Home', url: '/posts', icon: Home },
// 	{ title: 'Announcement', url: '/posts/annoucement', icon: Inbox },
// 	{ title: 'Community', url: '/posts/community', icon: PersonStanding },
// 	{
// 		title: 'Recruitment',
// 		url: '/posts/recruitment',
// 		icon: BriefcaseBusiness,
// 	},
// ];

const topicItems = [
	{ title: 'Important Post', url: '/posts/priority', icon: '📌' },
	// { title: 'Games', url: '/games', icon: '🎮' },
	// { title: 'Technology', url: '/technology', icon: '💻' },
];

export function AppSidebar() {
	const { open, toggleSidebar } = useSidebar();
	const [hovered, setHovered] = useState(false);
	const hoverTimer = useRef<number | null>(null);
	const iconMenu: Record<string, React.ElementType> = {
		Home: Home,
		Announcement: Inbox,
		Community: PersonStanding,
		Recruitment: BriefcaseBusiness,
	};
	const session = useSession();
	const { data: categories, isLoading: isLoadingCategories } =
		useCategories();

	const expanded = open || hovered;

	const toggleCollapse = () => {
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

	return (
		<div
			className={`group relative h-full border-r bg-grey-1 transition-[width] duration-200 ease-out ${
				expanded ? 'w-64' : 'w-12'
			}`}
			data-expanded={expanded}
		>
			{/* Toggle button */}
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

			<nav className="h-[calc(100%-3rem)] overflow-y-auto pb-6">
				<ul className="space-y-1 px-4">
					<li>
						<Link
							href="/posts"
							className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm text-white hover:bg-gray-400 transition hover:scale-103 ${
								expanded ? 'justify-start' : 'justify-center'
							}`}
							aria-label={expanded ? undefined : 'Hot Posts'}
							title={!expanded ? 'Hot Posts' : undefined}
						>
							<span className="text-base">🔥</span>
							{expanded && <span>Hot Posts</span>}
						</Link>
					</li>
					{!isLoadingCategories &&
						categories?.map((category) => {
							const Icon = iconMenu[category.label] || Home;

							return (
								<li key={category.id}>
									<Link
										href={`/posts/category/${category.id}`}
										className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm text-white hover:bg-gray-400 transition hover:scale-103 ${
											expanded
												? 'justify-start'
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
										<Icon className="h-4 w-4 shrink-0" />
										{expanded && (
											<span>{category.label}</span>
										)}
									</Link>
								</li>
							);
						})}

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
							<li>
								<Link
									href="/posts/admin"
									className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm text-white hover:bg-gray-400 transition hover:scale-103 ${
										expanded
											? 'justify-start'
											: 'justify-center'
									}`}
									aria-label={
										expanded ? undefined : 'Admin Panel'
									}
									title={
										!expanded ? 'Admin Panel' : undefined
									}
								>
									<Calendar className="h-4 w-4 shrink-0" />
									{expanded && <span>Admin Panel</span>}
								</Link>
							</li>
							<li>
								<Link
									href="/posts/admin/announcement"
									className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm text-white hover:bg-gray-400 transition hover:scale-103 ${
										expanded
											? 'justify-start'
											: 'justify-center'
									}`}
									aria-label={
										expanded
											? undefined
											: 'Announcement Panel'
									}
									title={
										!expanded
											? 'Announcement Panel'
											: undefined
									}
								>
									<Megaphone className="h-4 w-4 shrink-0" />
									{expanded && (
										<span>Announcement Panel</span>
									)}
								</Link>
							</li>
						</>
					)}
				</ul>
			</nav>
		</div>
	);
}
