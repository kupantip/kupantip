import React from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export type RequestedCategory = {
	id: string;
	requester_id: string;
	label: string;
	color_hex: string;
	detail: string;
	status: string;
	created_at: string;
	reviewed_at: string | null;
	reviewed_by: string | null;
	requester_name: string;
	reviewer_name: string | null;
	minutes_since_requested?: number;
};

type CategoryCardProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	category: RequestedCategory;
};

export default function CategoryCard({
	open,
	onOpenChange,
	category,
}: CategoryCardProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>Category Request Details</DialogTitle>
					<DialogDescription>
						Detailed information for requested category
					</DialogDescription>
				</DialogHeader>
				<div className="grid grid-cols-1 gap-2 text-sm mt-2">
					<div>
						<span className="font-semibold">ID:</span> {category.id}
					</div>
					<div>
						<span className="font-semibold">Label:</span>{' '}
						{category.label}
					</div>
					<div>
						<span className="font-semibold">Color:</span>{' '}
						<span
							className="inline-block w-5 h-5 rounded-full border border-gray-300 align-middle mr-2"
							style={{ backgroundColor: category.color_hex }}
							title={category.color_hex}
						></span>{' '}
						{category.color_hex}
					</div>
					<div>
						<span className="font-semibold">Detail:</span>{' '}
						{category.detail}
					</div>
					<div>
						<span className="font-semibold">Status:</span>{' '}
						{category.status}
					</div>
					<div>
						<span className="font-semibold">Requested By:</span>{' '}
						{category.requester_name} (ID: {category.requester_id})
					</div>
					<div>
						<span className="font-semibold">Created At:</span>{' '}
						{new Date(category.created_at).toLocaleString()}
					</div>
					<div>
						<span className="font-semibold">Reviewed At:</span>{' '}
						{category.reviewed_at
							? new Date(category.reviewed_at).toLocaleString()
							: '-'}
					</div>
					<div>
						<span className="font-semibold">Reviewed By:</span>{' '}
						{category.reviewer_name || '-'} (ID:{' '}
						{category.reviewed_by || '-'})
					</div>
					{typeof category.minutes_since_requested === 'number' && (
						<div>
							<span className="font-semibold">
								Minutes Since Requested:
							</span>{' '}
							{category.minutes_since_requested}
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
