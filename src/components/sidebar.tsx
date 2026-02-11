// components/app-sidebar.tsx
import { LayoutDashboard } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar({ tenant }: { tenant: string }) {
    const items = [
        { title: "Dashboard", url: `/${tenant}/dashboard`, icon: LayoutDashboard },
        { title: "Administrator", url: `/${tenant}/administrator`, icon: LayoutDashboard },
        { title: "Teacher", url: `/${tenant}/teacher`, icon: LayoutDashboard },
        { title: "Student", url: `/${tenant}/student`, icon: LayoutDashboard }
    ]

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="flex flex-col border-b h-16 items-center justify-center">
                <div className="flex items-center font-semibold w-[100%] justify-center">
                    <span className="truncate">{tenant?.toUpperCase()}</span>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title}>
                                        <a href={item.url}>
                                            <item.icon />
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