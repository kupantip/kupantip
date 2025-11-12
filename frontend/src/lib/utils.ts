import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useEffect, useState } from 'react';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function useIsMobile(breakpoint: number = 768): boolean {
	const [isMobile, setIsMobile] = useState<boolean>(false);

	useEffect(() => {
		const checkIsMobile = () => {
			setIsMobile(window.innerWidth < breakpoint);
		};

		checkIsMobile();
		window.addEventListener('resize', checkIsMobile);
		return () => window.removeEventListener('resize', checkIsMobile);
	}, [breakpoint]);

	return isMobile;
}
