import React from 'react';
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from '@/components/ui/chart';

type AdminLineChartProps = {
	data: Array<{ date: string; count: number; day_label: string }>;
	title: string;
	subtitle: string;
};

export default function AdminLineChart({
	data,
	title,
	subtitle,
}: AdminLineChartProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>{subtitle}</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={{}}>
					<LineChart accessibilityLayer data={data}>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="day_label"
							tickLine={false}
							axisLine={true}
						/>
						<ChartTooltip
							cursor={false}
							content={<ChartTooltipContent hideLabel />}
						/>
						<Line dataKey="count" type="monotone" stroke="#000" />
					</LineChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
