'use client';

import { useEffect, useState } from 'react';
const ROWS_PER_PAGE = 6;
import CategoryCard from '@/components/admin/CategoryCard';
import { Button } from '@/components/ui/button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Check, X } from 'lucide-react';
import {
	useRequestedCategories,
	usePatchRequestedCategoryStatus,
} from '@/services/admin/category';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

export default function AdminCategoryPage() {
	const [searchId, setSearchId] = useState('');
	const [status, setStatus] = useState<string>('');
	const [recent, setRecent] = useState<string>('');
	const [dialogId, setDialogId] = useState<string | null>(null);
	const [page, setPage] = useState(1);

	const {
		data: requests,
		isLoading,
		isError,
		error,
		refetch,
	} = useRequestedCategories({
		status: status as 'open' | 'dismissed' | 'actioned' | undefined,
		recent: recent === '' ? undefined : recent === 'true',
	});
	const patchStatus = usePatchRequestedCategoryStatus();

	const handleApprove = (id: string) => {
		patchStatus.mutate(
			{ id, input: { status: 'actioned' } },
			{ onSuccess: () => refetch() }
		);
	};

	const handleReject = (id: string) => {
		patchStatus.mutate(
			{ id, input: { status: 'dismissed' } },
			{ onSuccess: () => refetch() }
		);
	};

	useEffect(() => {
		AOS.init({
			duration: 500,
			once: true,
			offset: 80,
		});
	}, []);

	const filteredRequests =
		searchId.trim() && requests
			? requests.filter((req) => req.id.includes(searchId.trim()))
			: requests;

	// Pagination logic
	const totalRows = filteredRequests ? filteredRequests.length : 0;
	const totalPages = Math.ceil(totalRows / ROWS_PER_PAGE);
	const paginatedRequests = filteredRequests
		? filteredRequests.slice(
				(page - 1) * ROWS_PER_PAGE,
				page * ROWS_PER_PAGE
		  )
		: [];

	const handleRowClick = (id: string) => {
		setDialogId(id);
	};

	return (
		<div
			data-aos="fade-up"
			className="max-w-4xl mx-auto py-6 px-10 bg-grey-3 mt-10 rounded-lg"
		>
			<h1 className="text-2xl font-bold mb-8">Category Requests</h1>
			<div className="flex flex-wrap gap-4 mb-6 items-center">
				<input
					type="text"
					placeholder="Search by ID..."
					value={searchId}
					onChange={(e) => {
						setSearchId(e.target.value);
						setPage(1);
					}}
					className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
				/>
				<Select
					value={status || 'all'}
					onValueChange={(v) => {
						setStatus(v === 'all' ? '' : v);
						setPage(1);
					}}
				>
					<SelectTrigger className="w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700">
						<SelectValue placeholder="All Statuses" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Statuses</SelectItem>
						<SelectItem value="open">Open</SelectItem>
						<SelectItem value="actioned">Actioned</SelectItem>
						<SelectItem value="dismissed">Dismissed</SelectItem>
					</SelectContent>
				</Select>
				<Select
					value={recent || 'all'}
					onValueChange={(v) => {
						setRecent(v === 'all' ? '' : v);
						setPage(1);
					}}
				>
					<SelectTrigger className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700">
						<SelectValue placeholder="All" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All</SelectItem>
						<SelectItem value="true">Recent</SelectItem>
						<SelectItem value="false">Not Recent</SelectItem>
					</SelectContent>
				</Select>
			</div>
			{isLoading ? (
				<div className="text-center py-10 text-gray-500">
					Loading...
				</div>
			) : isError ? (
				<div className="text-center py-10 text-red-500">
					{error?.message || 'Failed to load'}
				</div>
			) : (
				<>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Label</TableHead>
								<TableHead>Color</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Requested By</TableHead>
								<TableHead className="text-right">
									Actions
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody className="overflow-y-auto h-40vh">
							{paginatedRequests &&
							paginatedRequests.length > 0 ? (
								paginatedRequests.map((req) => (
									<TableRow
										key={req.id}
										className="cursor-pointer hover:bg-gray-100"
										onClick={() => handleRowClick(req.id)}
										style={{
											transition: 'background 0.2s',
										}}
									>
										<TableCell className="font-medium">
											{req.label}
										</TableCell>
										<TableCell>
											<span
												className="inline-block w-6 h-6 rounded-full border border-gray-300 align-middle mr-2"
												style={{
													backgroundColor:
														req.color_hex,
												}}
												title={req.color_hex}
											></span>
											<span className="text-xs text-gray-500">
												{req.color_hex}
											</span>
										</TableCell>
										<TableCell>
											<span
												className={
													req.status === 'actioned'
														? 'inline-block px-3 py-1 rounded-lg text-xs font-semibold bg-green-100 text-green-700'
														: req.status === 'open'
														? 'inline-block px-3 py-1 rounded-lg text-xs font-semibold bg-yellow-100 text-yellow-800'
														: 'inline-block px-3 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-700'
												}
											>
												{req.status
													.charAt(0)
													.toUpperCase() +
													req.status.slice(1)}
											</span>
										</TableCell>
										<TableCell>
											{req.requester_name}
										</TableCell>
										<TableCell className="text-right space-x-2">
											<Button
												className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer rounded-lg"
												size="sm"
												disabled={
													req.status !== 'open' ||
													patchStatus.status ===
														'pending'
												}
												onClick={(e) => {
													e.stopPropagation();
													handleApprove(req.id);
												}}
											>
												<Check className="w-4 h-4" />
											</Button>
											<Button
												className="bg-red-600 hover:bg-red-700 cursor-pointer rounded-lg"
												size="sm"
												variant="destructive"
												disabled={
													req.status !== 'open' ||
													patchStatus.status ===
														'pending'
												}
												onClick={(e) => {
													e.stopPropagation();
													handleReject(req.id);
												}}
											>
												<X className="w-4 h-4" />
											</Button>
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell
										colSpan={5}
										className="text-center text-gray-400 py-8"
									>
										No category requests found.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
					{/* Pagination Controls */}
					{totalPages > 1 && (
						<div className="flex items-center justify-end space-x-2 mt-4">
							<Button
								variant="outline"
								size="sm"
								onClick={() =>
									setPage((p) => Math.max(1, p - 1))
								}
								disabled={page === 1}
							>
								Previous
							</Button>
							<div className="text-sm text-muted-foreground">
								Page {page} of {totalPages}
							</div>
							<Button
								variant="outline"
								size="sm"
								onClick={() =>
									setPage((p) => Math.min(totalPages, p + 1))
								}
								disabled={page === totalPages}
							>
								Next
							</Button>
						</div>
					)}
					{/* CategoryCard Dialog Popup */}
					{dialogId && filteredRequests && (
						<CategoryCard
							open={!!dialogId}
							onOpenChange={(open) =>
								open ? undefined : setDialogId(null)
							}
							category={
								filteredRequests.find((r) => r.id === dialogId)!
							}
						/>
					)}
				</>
			)}
		</div>
	);
}
