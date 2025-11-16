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
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useSidebar } from '@/components/ui/sidebar';

const topicItems = [
	{ title: 'Important Post', url: '/posts/priority', icon: '📌' },
];

const adminLinks = [
	{
		href: '/posts/admin',
		icon: Calendar,
		label: 'Admin Panel',
		aria: 'Admin Panel',
		title: 'Admin Panel',
	},
	{
		href: '/posts/admin/catergory',
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
							title={!expanded ? 'News' : undefined}
						>
							<span className="text-base ">
								<Newspaper className="h-5 w-5 shrink-0" />
							</span>
							{expanded && <span>News</span>}
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
										<Icon className="h-5 w-5 shrink-0" />
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
							{adminLinks.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
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
		</div>
	);
}
