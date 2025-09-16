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
    { title: 'Popular', url: '/inbox', icon: Inbox },
    { title: 'Answers', url: '/calendar', icon: Calendar },
]

const topicItems = [
    { title: 'Games', url: '/games', icon: '🎮' },
    { title: 'Technology', url: '/technology', icon: '💻' },
]

export function AppSidebar() {
    return (
        <Sidebar className="pt-16 border-white">
            <SidebarContent className="bg-white">
                <SidebarGroup>
                    {/* <SidebarGroupLabel>Application</SidebarGroupLabel> */}
                    <SidebarContent className="overflow-y-auto h-screen">
                        <SidebarGroup>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {items.map((item) => (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                asChild
                                                className="px-3"
                                            >
                                                <a
                                                    href={item.url}
                                                    className="flex items-center gap-2 justify-start w-full px-2 py-2 hover:bg-gray-100 rounded-md"
                                                >
                                                    <item.icon className="h-4 w-4" />
                                                    <span>{item.title}</span>
                                                </a>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}

                                    {/* Divider aligned with menu items */}
                                    <div className="w-full px-3 mt-3">
                                        <div className="border-t border-gray-200"></div>
                                    </div>

                                    {/* Section header */}
                                    <div className="text-xs font-semibold text-gray-500 uppercase px-3 py-2">
                                        Topics
                                    </div>

                                    {topicItems.map((item) => (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                asChild
                                                className="px-3"
                                            >
                                                <a
                                                    href={item.url}
                                                    className="flex items-center gap-2 w-full px-2 py-2 hover:bg-gray-100 rounded-md"
                                                >
                                                    <span>{item.icon}</span>
                                                    <span>{item.title}</span>
                                                </a>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
