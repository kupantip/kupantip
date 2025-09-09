// components/app-sidebar.tsx
import { Calendar, Home, Inbox, Search, Settings } from 'lucide-react'
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
} from '@/components/ui/sidebar'

const items = [
    { title: 'Home', url: '/', icon: Home },
    { title: 'Inbox', url: '/inbox', icon: Inbox },
    { title: 'Calendar', url: '/calendar', icon: Calendar },
    { title: 'Search', url: '/search', icon: Search },
    { title: 'Settings', url: '/settings', icon: Settings },
]

export function AppSidebar() {
    return (
        <Sidebar className="pt-16 border-white">
            <SidebarContent className='bg-white'>
                <SidebarGroup>
                    {/* <SidebarGroupLabel>Application</SidebarGroupLabel> */}
                    <SidebarGroupContent>

                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a
                                            href={item.url}
                                            className="flex items-center gap-2 w-40 justify-start mx-auto px-2 py-2 hover:bg-gray-100 rounded-md bg-white"
                                        >
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
