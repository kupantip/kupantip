'use client'

import { useState, useMemo, useRef } from 'react';
import { ChevronRight, ChevronDown, Megaphone, Loader2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAnnouncement } from '@/services/announcement/announcement';
import Link from 'next/link';

const getDaysDiff = (start: string | Date, end: string | Date) => {
    const date1 = new Date(start);
    const date2 = new Date(end);

    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
};

const getDaysFromStart = (baseDate: Date, targetDate: string) => {
    const start = new Date(baseDate);
    const target = new Date(targetDate);
    const diffTime = target.getTime() - start.getTime();

    return diffTime / (1000 * 60 * 60 * 24);
};

const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

const PIXELS_PER_DAY = 60;
const VIEW_BUFFER_DAYS = 2;

export default function AnnouncementTimeline(){
    const { data: announcements, isLoading, error } = useAnnouncement();
    const [isExpanded, setIsExpanded] = useState(true);

    const headerRef = useRef<HTMLDivElement>(null);
    const bodyRef = useRef<HTMLDivElement>(null);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        if (headerRef.current) {
        headerRef.current.scrollLeft = e.currentTarget.scrollLeft;
        }
    };

    const timelineMeta = useMemo(() => {
        if (!announcements || announcements.length === 0) {
        return { startViewDate: new Date(), totalDays: 30 };
        }

        const dates = announcements.flatMap(a => [new Date(a.start_at).getTime(), new Date(a.end_at).getTime()]);
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));

        const startViewDate = new Date(minDate);
        startViewDate.setDate(startViewDate.getDate() - VIEW_BUFFER_DAYS);

        const totalDays = getDaysDiff(minDate, maxDate) + (VIEW_BUFFER_DAYS * 2) + 5; // +5 เผื่อที่ด้านหลัง

        return { startViewDate, totalDays };
    }, [announcements]);

    const daysHeader = useMemo(() => {
        return Array.from({ length: timelineMeta.totalDays }).map((_, i) => {
        const d = new Date(timelineMeta.startViewDate);
        d.setDate(d.getDate() + i);
        return d;
        });
    }, [timelineMeta]);

    if (isLoading) return (
            <div className="flex flex-col justify-center items-center h-64 gap-2">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className='text-center'>Loading Timeline...</span>
            </div>
    );
    if (error) return <div className="p-10 text-center text-red-500">Error loading data</div>;

  return (
    <TooltipProvider>
        <div className="flex flex-col h-[calc(100vh-100px)] min-h-[500px] w-full bg-white text-sm text-gray-700 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        
        {/* --- Header Section --- */}
        <div className="flex border-b border-gray-300 bg-gray-50">
            {/* Sidebar Header */}
            <div className="w-[140px] md:w-[220px] lg:w-[300px] shrink-0 p-3 font-bold border-r border-gray-300 flex items-center text-gray-600 transition-all duration-300">
            Announcement Title
            </div>

            {/* Timeline Date Header */}
            <div ref={headerRef} className="flex-1 overflow-hidden relative">
            <div className="flex h-10 items-center">
                {daysHeader.map((date, idx) => (
                <div 
                    key={idx} 
                    className="shrink-0 border-r border-gray-200 text-center text-xs text-gray-500 flex flex-col justify-center"
                    style={{ width: `${PIXELS_PER_DAY}px` }}
                >
                    <span className="font-bold">{date.getDate()}</span>
                    <span className="text-[10px]">{date.toLocaleString('en-US', { month: 'short' })}</span>
                </div>
                ))}
            </div>
            </div>
        </div>

        {/* --- Body Section --- */}
        <div
            ref={bodyRef}
            onScroll={handleScroll}  
            className="flex flex-1 overflow-auto relative"
        >
            
            {/* Left Sidebar: Item List */}
            <div className="sticky left-0 w-[140px] md:w-[220px] lg:w-[300px] shrink-0 border-r border-gray-300 bg-white z-40 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] transition-all duration-300">
            <div 
                className="h-10 flex items-center px-3 py-2 bg-gray-50 hover:bg-gray-100 cursor-pointer border-b border-gray-200"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <button className="mr-1 text-gray-500">
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                <div className="font-semibold text-xs uppercase tracking-wider text-gray-500 truncate">
                    <span className="hidden md:inline">All </span>Announcements
                </div>
            </div>

            {isExpanded && announcements?.map((item) => (
                <Link key={item.id} href={`/posts/annoucement/${item.id}?r=Announcement Timeline`} className="flex items-center px-4 py-2 h-12 border-b border-gray-100 hover:bg-blue-50 transition-colors group cursor-pointer">
                    <div className="mr-2 text-emerald-600 shrink-0">
                        <Megaphone size={16} fill="currentColor" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="truncate font-medium text-gray-700 group-hover:text-blue-600">
                            {item.title}
                        </span>
                        <span className="text-[10px] text-gray-400 truncate hidden md:block">
                            {new Date(item.start_at).toLocaleDateString()} - {new Date(item.end_at).toLocaleDateString()}
                        </span>
                    </div>
                </Link>
            ))}
            </div>

            {/* Right Timeline: Bars Area */}
            <div
                className="flex-1 relative bg-white"
            >
            
            <div className='relative min-h-full'>
                {/* Background Grid (Column Lines) */}
                <div className="absolute inset-0 flex h-full pointer-events-none z-0">
                    {daysHeader.map((_, idx) => (
                        <div 
                        key={idx} 
                        className="shrink-0 border-r border-gray-100 h-full"
                        style={{ width: `${PIXELS_PER_DAY}px`, backgroundColor: idx % 2 === 0 ? 'transparent' : '#fafafa' }} 
                        />
                    ))}
                </div>

                {/* Current Time Line */}
                {(() => {
                    const currentOffset = getDaysFromStart(timelineMeta.startViewDate, new Date().toISOString());
                    if (currentOffset >= 0) {
                    return (
                        <div 
                            className="absolute top-0 bottom-0 w-px bg-blue-500 z-20 pointer-events-none" 
                            style={{ left: `${currentOffset * PIXELS_PER_DAY}px` }}
                        >
                            <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-blue-500 rounded-full" />
                        </div>
                    )
                    }
                    return null;
                })()}

                {/* Content Container */}
                <div className="relative">
                        <div className="h-10 border-b border-gray-100/50"></div>
                        {isExpanded && announcements?.map((item) => {
                            const startOffset = getDaysFromStart(timelineMeta.startViewDate, item.start_at);
                            const durationDays = getDaysFromStart(new Date(item.start_at), item.end_at);
                            
                            const leftPos = startOffset * PIXELS_PER_DAY;
                            const widthPos = Math.max(durationDays * PIXELS_PER_DAY, 10);

                            return (
                            <div key={`timeline-${item.id}`} className="h-12 flex items-center relative w-full border-b border-transparent hover:bg-gray-50/50">
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <div 
                                            className="absolute h-6 bg-emerald-500 rounded-[4px] hover:bg-emerald-600 transition-all cursor-pointer shadow-sm flex items-center px-2 overflow-hidden ring-1 ring-purple-500/20"
                                            style={{ 
                                            left: `${leftPos}px`, 
                                            width: `${widthPos}px` 
                                            }}
                                        >
                                            <span className="text-white text-xs font-medium truncate w-full block select-none">
                                            {widthPos > 50 && item.title}
                                            </span>
                                        </div>
                                        </TooltipTrigger>

                                        <TooltipContent 
                                        className="bg-gray-800 text-white border-gray-700 p-0 overflow-hidden shadow-xl min-w-[200px]" 
                                        sideOffset={5}
                                        >

                                        <div className="px-3 py-2 border-b border-gray-600 font-bold text-sm break-words">
                                            {item.title}
                                        </div>

                                        <div className="px-3 py-2 bg-gray-800/50">
                                            <div className="grid grid-cols-[40px_1fr] gap-y-1 text-xs">
                                                <span className="text-gray-400 font-medium">Start:</span>
                                                <span className="text-gray-200">{formatDateTime(item.start_at)}</span>
                                                
                                                <span className="text-gray-400 font-medium">End:</span>
                                                <span className="text-gray-200">{formatDateTime(item.end_at)}</span>
                                            </div>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>

                            </div>
                            );
                        })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </TooltipProvider>
  );
};