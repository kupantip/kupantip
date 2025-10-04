'use client';

import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

interface Item {
	name: string;
	value: string;
}

const SELECT_ITEM: Item[] = [
	{ name: 'Best', value: 'Value' },
	{ name: 'Top', value: 'Value' },
	{ name: 'New', value: 'Value' },
	{ name: 'Hot', value: 'Value' },
	{ name: 'Rising', value: 'Value' },
];

export function TopFilter() {
	return (
		<div>
			<Select>
				<SelectTrigger className="w-[8em]">
					<SelectValue placeholder="Sort By" />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectLabel>Sort By</SelectLabel>
						{SELECT_ITEM.map((item) => (
							<SelectItem key={item.name} value={item.value}>
								{item.name}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
		</div>
	);
}
