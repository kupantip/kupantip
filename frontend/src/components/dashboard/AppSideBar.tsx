'use client';

import {
	Calendar,
	Home,
	Inbox,
	ChevronsLeft,
	ChevronsRight,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const HOVER_OPEN_DELAY_MS = 250;

const items = [
	{ title: 'Home', url: '/', icon: Home },
	{ title: 'Popular', url: '/inbox', icon: Inbox },
	{ title: 'Answers', url: '/calendar', icon: Calendar },
];

const topicItems = [
	{ title: 'Games', url: '/games', icon: '🎮' },
	{ title: 'Technology', url: '/technology', icon: '💻' },
];

export function AppSidebar() {
	const [collapsed, setCollapsed] = useState(false);
	const [hovered, setHovered] = useState(false);
	const hoverTimer = useRef<number | null>(null);

	const expanded = !collapsed || hovered;

	const handleMouseEnter = () => {
		if (!collapsed) return;
		if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
		hoverTimer.current = window.setTimeout(() => {
			setHovered(true);
			hoverTimer.current = null;
		}, HOVER_OPEN_DELAY_MS);
	};

	const handleMouseLeave = () => {
		if (hoverTimer.current) {
			window.clearTimeout(hoverTimer.current);
			hoverTimer.current = null;
		}

		if (collapsed) setHovered(false);
	};

	useEffect(() => {
		return () => {
			if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
		};
	}, []);

	const toggleCollapse = () => {
		if (hoverTimer.current) {
			window.clearTimeout(hoverTimer.current);
			hoverTimer.current = null;
		}
		setHovered(false);
		setCollapsed((c) => !c);
	};

	return (
		<div
			className={`group relative h-full border-r bg-white transition-[width] duration-200 ease-out ${
				expanded ? 'w-60' : 'w-14'
			}`}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			data-expanded={expanded}
		>
			{/* Toggle button */}
			<div
				className={`flex items-center ${
					expanded ? 'justify-between px-3' : 'justify-center'
				} py-2`}
			>
				{expanded && (
					<span className="text-sm font-semibold tracking-wide">
						Menu
					</span>
				)}
				<button
					type="button"
					onClick={toggleCollapse}
					aria-label={
						collapsed ? 'Expand sidebar' : 'Collapse sidebar'
					}
					className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white hover:bg-gray-100 transition"
				>
					{expanded ? (
						<ChevronsLeft className="h-4 w-4" />
					) : (
						<ChevronsRight className="h-4 w-4" />
					)}
				</button>
			</div>

			<nav className="h-[calc(100%-3rem)] overflow-y-auto pb-6">
				<ul className="space-y-1 px-1">
					{items.map((item) => {
						const Icon = item.icon;
						return (
							<li key={item.title}>
								<a
									href={item.url}
									className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-gray-100 transition ${
										expanded
											? 'justify-start'
											: 'justify-center'
									}`}
									aria-label={
										expanded ? undefined : item.title
									}
									title={!expanded ? item.title : undefined}
								>
									<Icon className="h-4 w-4 shrink-0" />
									{expanded && <span>{item.title}</span>}
								</a>
							</li>
						);
					})}

					{expanded && (
						<li className="pt-2">
							<div className="mx-2 border-t border-gray-200" />
						</li>
					)}

					{expanded && (
						<li className="px-2 pt-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
							Topics
						</li>
					)}

					{topicItems.map((item) => (
						<li key={item.title}>
							<a
								href={item.url}
								className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-gray-100 transition ${
									expanded
										? 'justify-start'
										: 'justify-center'
								}`}
								aria-label={expanded ? undefined : item.title}
								title={!expanded ? item.title : undefined}
							>
								<span className="text-base">{item.icon}</span>
								{expanded && <span>{item.title}</span>}
							</a>
						</li>
					))}
				</ul>
			</nav>
		</div>
	);
}
