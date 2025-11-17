'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Search } from "lucide-react"
import { useSearch } from '@/services/user/search';
import InstantSearchDropdown from '@/components/SearchDropDown';

interface SearchBarProps {
  setIsRedirectLoading?: (isLoading: boolean) => void;
}

export default function SearchBar({ setIsRedirectLoading }: SearchBarProps) {
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

	const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!SearchItem.trim()) {
            return;
        }
		setShowDropdown(false);
		if(setIsRedirectLoading){
            setIsRedirectLoading(true);
        }

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
    );
}