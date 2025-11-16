'use client';

import { useEffect, useState } from 'react';
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

// Mocked category requests data
const mockCategoryRequests = [
	{
		id: '1',
		label: 'Technology',
		color_hex: '#10b981',
		status: 'pending',
		requested_by: '11111',
	},
	{
		id: '2',
		label: 'Travel',
		color_hex: '#f59e42',
		status: 'pending',
		requested_by: '22222',
	},
	{
		id: '3',
		label: 'Food',
		color_hex: '#ef4444',
		status: 'approved',
		requested_by: '33333',
	},
];

export default function AdminCategoryPage() {
	const [requests, setRequests] = useState(mockCategoryRequests);

	const handleApprove = (id: string) => {
		setRequests((prev) =>
			prev.map((req) =>
				req.id === id ? { ...req, status: 'approved' } : req
			)
		);
	};

	const handleReject = (id: string) => {
		setRequests((prev) =>
			prev.map((req) =>
				req.id === id ? { ...req, status: 'rejected' } : req
			)
		);
	};

	useEffect(() => {
		AOS.init({
			duration: 500,
			once: true,
			offset: 80,
		});
	}, []);

	return (
		<div
			data-aos="fade-up"
			className="max-w-4xl mx-auto py-6 px-10 bg-grey-3 mt-10 rounded-lg"
		>
			<h1 className="text-2xl font-bold mb-8">Category Requests</h1>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Label</TableHead>
						<TableHead>Color</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Requested By</TableHead>
						<TableHead className="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{requests.map((req) => (
						<TableRow key={req.id}>
							<TableCell className="font-medium">
								{req.label}
							</TableCell>
							<TableCell>
								<span
									className="inline-block w-6 h-6 rounded-full border border-gray-300 align-middle mr-2"
									style={{ backgroundColor: req.color_hex }}
									title={req.color_hex}
								></span>
								<span className="text-xs text-gray-500">
									{req.color_hex}
								</span>
							</TableCell>
							<TableCell>
								<span
									className={
										req.status === 'approved'
											? 'inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700'
											: req.status === 'pending'
											? 'inline-block px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800'
											: 'inline-block px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700'
									}
								>
									{req.status.charAt(0).toUpperCase() +
										req.status.slice(1)}
								</span>
							</TableCell>
							<TableCell>{req.requested_by}</TableCell>
							<TableCell className="text-right space-x-2">
								<Button
									className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
									size="sm"
									disabled={req.status !== 'pending'}
									onClick={() => handleApprove(req.id)}
								>
									<Check className="w-4 h-4" />
								</Button>
								<Button
									className="bg-red-600 hover:bg-red-700 cursor-pointer"
									size="sm"
									variant="destructive"
									disabled={req.status !== 'pending'}
									onClick={() => handleReject(req.id)}
								>
									<X className="w-4 h-4" />
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
