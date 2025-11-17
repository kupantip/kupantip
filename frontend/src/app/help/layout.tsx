'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

import AOS from 'aos';
import 'aos/dist/aos.css';
import { useSession } from 'next-auth/react';

import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/posts/AppSideBar';
import { Button } from '@/components/ui/button';
import { CirclePlus } from 'lucide-react';
import { Bell } from 'lucide-react';

import Link from 'next/link';
import ProfileDropDown from '@/components/ProfileDropdown';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Search } from "lucide-react"
import { useSearch } from '@/services/user/search';
import InstantSearchDropdown from '@/components/SearchDropDown';

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { data: session, status } = useSession();

	const [ SearchItem, setSearchItem ] = useState('');
	const router = useRouter();

	const [debouncedTerm, setDebouncedTerm] = useState('');
	const [showDropdown, setShowDropdown] = useState(false);
	const searchRef = useRef<HTMLFormElement>(null);
	const searchParams = useSearchParams();

	const { data: searchData, isLoading: isSearchLoading } = useSearch(debouncedTerm);

	useEffect(() => {
		const q = searchParams.get("q");
		if (q) {
			setSearchItem(q);
			setDebouncedTerm(q);
		}
	}, [searchParams]);

	useEffect(() => {
		const timer = setTimeout(() => {
			if (SearchItem.trim() !== '') {
				setDebouncedTerm(SearchItem);
			} else {
				setDebouncedTerm('');
			}
		}, 300);

		return () => {
			clearTimeout(timer);
		};
	}, [SearchItem]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
				setShowDropdown(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	useEffect(() => {
		window.history.scrollRestoration = 'manual';
		window.scrollTo({ top: 0 });
		AOS.init({ duration: 800, once: true, offset: 100 });
	}, []);

	const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!SearchItem.trim()) {
			return;
		}
		setShowDropdown(false);

		router.push(`/search?q=${encodeURIComponent(SearchItem.trim())}`);
	}

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSearchItem(value);
		setShowDropdown(value.trim() !== '');
	};

	const handleResultClick = () => {
		setShowDropdown(false);
	};

	return (
		<SidebarProvider>
			<header className="fixed top-0 left-0 w-full h-16 bg-green-2 shadow flex items-center px-6 z-50">
				<div className="flex justify-between items-center w-screen">
					<h4 className="text-white text-base font-semibold">
						KU Pantip
					</h4>

					<form 
						onSubmit={handleSearch}
						ref={searchRef} 
						className="relative w-full max-w-xl ml-54"
					>
						<InputGroup className='bg-white'>
							<InputGroupInput 
								placeholder="Search..."
								value={SearchItem}
								onChange={handleInputChange}
								onFocus={() => setShowDropdown(SearchItem.trim() !== '')}
								autoComplete="off"
							/>
							<InputGroupAddon>
								<Search />
							</InputGroupAddon>
						</InputGroup>		
						{showDropdown && (
							<InstantSearchDropdown
								isLoading={isSearchLoading}
								data={searchData}
								onResultClick={handleResultClick}
							/>
						)}
					</form>

					<div className="flex flex-wrap items-center gap-x-3">
						<div className="mr-3 w-7 h-7 bg-transparent rounded-full flex items-center justify-center hover:bg-grey-1 hover:scale-105">
							<Bell className="w-5 h-5 text-white cursor-pointer" />
						</div>
						<Link href="/posts/create-category">
							<Button className="mr-21group w-16 bg-transparent text-white rounded-lg hover:bg-transparent flex items-center gap-2 cursor-pointer hover:scale-105">
								<CirclePlus className="mt-[0.2em]" />
								<div className="group-hover:underline">
									Category
								</div>
							</Button>
						</Link>
						<Link href="/posts/create">
							<Button className="group w-20 bg-transparent text-white rounded-lg hover:bg-transparent flex items-center gap-2 cursor-pointer hover:scale-105">
								<CirclePlus className="mt-[0.2em]" />
								<div className="group-hover:underline">
									Post
								</div>
							</Button>
						</Link>
						{status !== 'authenticated' && (
							<Link href="/login">
								<Button className="w-30 bg-green-1 text-white rounded-lg hover:bg-green-700 cursor-pointer hover:scale-105">
									<div className="hover:underline">
										Log In
									</div>
								</Button>
							</Link>
						)}
						<ProfileDropDown />
					</div>
				</div>
			</header>

			<div className="flex pt-16 w-full">
				<div className="sticky top-16 h-[calc(100vh-4rem)] shrink-0 overflow-hidden">
					<AppSidebar />
				</div>

				<main className="flex-1 p-10 min-h-[calc(100vh-4rem)]">
					{children}
				</main>
			</div>
		</SidebarProvider>
	);
}