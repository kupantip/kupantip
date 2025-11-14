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
import { X } from 'lucide-react';
import { Announcement } from '@/services/announcement/announcement';
import AnnouncementItem from './AnnouncementItem';
import AnnouncementPreviewItem from './AnnouncementPreviewItem';

type Props = {
	announcements?: Announcement[];
};

export default function StackAnnoncement({ announcements }: Props) {
	const [isOpen, setIsOpen] = useState(false);

	const openModal = () => {
		setIsOpen(true);
		document.body.style.overflow = 'hidden';
	};
	const closeModal = () => {
		setIsOpen(false);
		document.body.style.overflow = 'unset';
	};

	if (!announcements || announcements.length === 0) {
		return null;
	}

	// We use the top item for the preview card
	const topAnnouncement = announcements[0];

	return (
		<div className="flex items-center justify-center w-full">
			<motion.div
				layoutId="stack-modal-container" // Links the container
				onClick={openModal}
				className="relative w-full cursor-pointer"
				style={{ zIndex: 10 }} // Ensure it's above other page content
			>
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
					<AnnouncementPreviewItem announcement={topAnnouncement} />
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
								<Card className="relative flex flex-col max-h-[60vh]">
									{/* Modal Header */}
									<CardHeader>
										<CardTitle>All Announcement</CardTitle>
										<CardDescription>
											Scroll to see all{' '}
											{announcements.length} items.
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
									<CardContent className="flex-1 overflow-y-auto p-4 pr-2 scroll-smooth snap-y snap-mandatory">
										<div className="space-y-4">
											{announcements.map((item) => (
												<div
													key={item.id}
													className="snap-center snap-always"
												>
													<AnnouncementItem
														announcement={item}
													/>
												</div>
											))}
										</div>
									</CardContent>
								</Card>
							</motion.div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
