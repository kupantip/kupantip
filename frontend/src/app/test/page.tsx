'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Check, Calendar, Mail, X } from 'lucide-react';

// 1. Mock Data for the scrollable list
const notifications = [
	{
		id: 1,
		title: 'New Message',
		description: 'You have 3 unread messages in your inbox.',
		icon: <Mail className="w-5 h-5 text-blue-500" />,
	},
	{
		id: 2,
		title: 'Project Approved',
		description: 'The dashboard redesign was approved.',
		icon: <Check className="w-5 h-5 text-green-500" />,
	},
	{
		id: 3,
		title: 'Meeting Reminder',
		description: 'Daily standup at 10:00 AM via Zoom.',
		icon: <Calendar className="w-5 h-5 text-purple-500" />,
	},
	{
		id: 4,
		title: 'New Notification',
		description: 'You have a new message from the team.',
		icon: <Bell className="w-5 h-5 text-yellow-500" />,
	},
	{
		id: 5,
		title: 'Task Completed',
		description: "Your 'Deploy v2.0' task is now complete.",
		icon: <Check className="w-5 h-5 text-green-500" />,
	},
	{
		id: 6,
		title: 'Security Alert',
		description: 'A new device signed into your account.',
		icon: <Bell className="w-5 h-5 text-red-500" />,
	},
	{
		id: 7,
		title: 'Weekly Summary',
		description: 'Your weekly performance report is ready.',
		icon: <Calendar className="w-5 h-5 text-blue-500" />,
	},
];

export default function ExpandingStackModal() {
	const [isOpen, setIsOpen] = useState(false);

	const openModal = () => setIsOpen(true);
	const closeModal = () => setIsOpen(false);

	// We use the top item for the preview card
	const topNotification = notifications[0];

	return (
		<div className="flex items-center justify-center h-[700px] bg-slate-50 dark:bg-slate-950 p-8">
			{/* =================================== */}
			{/* 1. The Stack Preview (When Closed)  */}
			{/* =================================== */}
			<motion.div
				layoutId="stack-modal-container" // Links the container
				onClick={openModal}
				className="relative w-full max-w-sm cursor-pointer"
				style={{ zIndex: 10 }} // Ensure it's above other page content
			>
				{/* Decorative cards to create the "stack" effect */}
				<motion.div
					className="absolute inset-0 w-full h-full bg-card/60 dark:bg-card/30 border rounded-xl"
					style={{ top: 12, scale: 0.92 }}
				/>
				<motion.div
					className="absolute inset-0 w-full h-full bg-card/80 dark:bg-card/50 border rounded-xl"
					style={{ top: 6, scale: 0.96 }}
				/>

				{/* The Top Card (The one that animates) */}
				<motion.div
					layoutId="stack-modal-card" // Links the card itself
					className="relative"
				>
					<Card className="shadow-xl">
						<CardHeader className="flex flex-row items-center gap-4">
							{topNotification.icon}
							<div>
								<CardTitle>{topNotification.title}</CardTitle>
								<CardDescription>
									{topNotification.description}
								</CardDescription>
							</div>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">
								+ {notifications.length - 1} more notifications.{' '}
								<span className="font-semibold text-primary">
									Click to view all.
								</span>
							</p>
						</CardContent>
					</Card>
				</motion.div>
			</motion.div>

			{/* =================================== */}
			{/* 2. The Modal (When Open)           */}
			{/* =================================== */}
			<AnimatePresence>
				{isOpen && (
					<motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
						{/* A. The Backdrop */}
						<motion.div
							className="absolute inset-0 bg-black/70 backdrop-blur-sm"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={closeModal}
						/>

						{/* B. The Modal Container (animates position/size) */}
						<motion.div
							layoutId="stack-modal-container"
							className="relative z-10 w-full max-w-2xl"
						>
							{/* C. The Modal Card (animates position/size) */}
							<motion.div
								layoutId="stack-modal-card"
								className="bg-card text-card-foreground rounded-xl shadow-2xl"
							>
								{/* D. The Scrollable Content */}
								<div className="relative flex flex-col max-h-[80vh]">
									{/* Modal Header */}
									<CardHeader className="flex-shrink-0 border-b">
										<CardTitle>All Notifications</CardTitle>
										<CardDescription>
											Scroll to see all{' '}
											{notifications.length} items.
										</CardDescription>
									</CardHeader>

									<Button
										variant="ghost"
										size="icon"
										onClick={closeModal}
										className="absolute top-3 right-3 text-muted-foreground"
									>
										<X className="w-5 h-5" />
									</Button>

									{/* The actual scroll area */}
									<CardContent className="flex-1 overflow-y-auto p-4 pr-2">
										<div className="space-y-4">
											{notifications.map((item) => (
												<div
													key={item.id}
													className="p-4 rounded-lg border bg-background/50 flex items-center gap-4"
												>
													<span className="flex-shrink-0">
														{item.icon}
													</span>
													<div className="flex-1">
														<h4 className="font-semibold text-sm">
															{item.title}
														</h4>
														<p className="text-sm text-muted-foreground">
															{item.description}
														</p>
													</div>
												</div>
											))}
										</div>
									</CardContent>
								</div>
							</motion.div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
