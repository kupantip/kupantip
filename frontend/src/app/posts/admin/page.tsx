'use client';
import AdminLineChart from '@/components/admin/LineChart';
import ReportCard from '@/components/admin/ReportCard';
import { ReportDataTable } from '@/components/admin/ReportDataTable';

import { useReports } from '@/services/admin/report';
import {
	useDailyPosts,
	useDailyReport,
	useStats,
} from '@/services/admin/stats';
import {
	FilePlus2,
	Flag,
	MessageCirclePlus,
	UserRoundPlus,
} from 'lucide-react';
import React from 'react';

export default function AdminPage() {
	const { data: statsData, isLoading: isLoadingStats } = useStats();

	const { data: dailyPostsData, isLoading: isLoadingDailyPosts } =
		useDailyPosts(7);
	const { data: dailyReportsData, isLoading: isLoadingDailyReport } = useDailyReport(7);

	const { data: reportsData } = useReports();

	// const onViewReport = (id: string) => {
	// 	console.log('View report:', id);
	// 	// Navigate to detail page or open modal
	// };

	// const onApproveReport = (id: string) => {
	// 	console.log('Approve report:', id);
	// 	// Call API to approve
	// };

	// const onRejectReport = (id: string) => {
	// 	console.log('Reject report:', id);
	// 	// Call API to reject
	// };

	if (isLoadingStats) {
		return <div>Loading...</div>;
	}

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-4 gap-4">
				<ReportCard
					num={statsData?.users.new_today || 0}
					iCon={<UserRoundPlus />}
					title="Users"
					subtitle={'Incoming Users'}
					date={statsData?.users.last_updated || ''}
				/>
				<ReportCard
					num={statsData?.posts.new_today || 0}
					iCon={<FilePlus2 />}
					title="Posts"
					subtitle="New posts today"
					date={statsData?.posts.last_updated || ''}
				/>
				<ReportCard
					num={statsData?.comments.new_today || 0}
					iCon={<MessageCirclePlus />}
					title="Comments"
					subtitle="New comments today"
					date={statsData?.comments.last_updated || ''}
				/>
				<ReportCard
					num={statsData?.reports.new_today || 0}
					iCon={<Flag />}
					title="Reports"
					subtitle="New reports today"
					date={statsData?.reports.last_updated || ''}
				/>
			</div>
			<div className="grid grid-cols-2 gap-2">
				{!isLoadingDailyPosts && dailyPostsData && (
					<AdminLineChart
						title="Daily Post Activity"
						subtitle={`Number of posts created in the last ${dailyPostsData.period_days} days`}
						data={dailyPostsData.data}
					/>
				)}
				{!isLoadingDailyReport && dailyReportsData && (
					<AdminLineChart
						title="Daily Report Activity"
						subtitle={`Number of reports created in the last ${dailyReportsData.period_days} days`}
						data={dailyReportsData.data}
					/>
				)}

				{/* <AdminLineChart /> */}
			</div>
			{/* Table Report */}
			<ReportDataTable
				data={reportsData || []}
			/>
		</div>
	);
}
