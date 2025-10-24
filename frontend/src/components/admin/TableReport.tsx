'use client';

import { Report } from '@/services/admin/report';
import React, { useState } from 'react';
import { ReportDataTable } from './ReportDataTable';

type TableReportProps = {
	data: Array<Report>;
};

export default function TableReport({ data }: TableReportProps) {
	const [reports, setReports] = useState(data);

	const handleApprove = (id: string) => {
		console.log('Approve report:', id);
		// Call API to approve
		// setReports(reports.map(r => r.id === id ? { ...r, status: 'resolved' } : r))
	};

	const handleReject = (id: string) => {
		console.log('Reject report:', id);
		// Call API to reject
		// setReports(reports.filter(r => r.id !== id))
	};

	const handleView = (id: string) => {
		console.log('View report:', id);
		// Navigate to detail page or open modal
	};

	return (
		<ReportDataTable
			data={reports}
			onApprove={handleApprove}
			onReject={handleReject}
			onView={handleView}
		/>
	);
}
