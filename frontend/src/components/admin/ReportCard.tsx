import { ClockFading } from 'lucide-react';
import React from 'react';

type ReportCardProps = {
	num: number;
	iCon: React.ReactNode;
	title: string;
	subtitle: string;
	date: string;
};
export default function ReportCard({
	num,
	iCon,
	title,
	subtitle,
	date,
}: ReportCardProps) {
	return (
		<div className="w-full bg-gray-200 rounded-md p-4 shadow-md hover:shadow-lg transition-shadow hover:scale-101">
			<div className="flex justify-between">
				<div>
					{num} {title}
				</div>
				<div>{iCon}</div>
			</div>

			<div>{subtitle}</div>
			<hr className="my-2" />
			<div className="text-xs flex items-center gap-1 text-gray-500">
				<ClockFading size={20} /> update: {date}
			</div>
		</div>
	);
}
